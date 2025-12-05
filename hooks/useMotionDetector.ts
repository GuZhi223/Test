import React, { useEffect, useRef, useState } from 'react';

/**
 * A lightweight motion detector.
 * It compares the current video frame with the previous one.
 * The amount of pixel change determines the "Spread/Energy" of the system.
 */
export const useMotionDetector = (videoRef: React.RefObject<HTMLVideoElement>, isActive: boolean) => {
  const [motionValue, setMotionValue] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const intervalRef = useRef<number>();

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = 64; // Low res for performance
    canvas.height = 48;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvasRef.current = canvas;

    const checkMotion = () => {
      if (!videoRef.current || !ctx || videoRef.current.readyState !== 4) return;

      // Draw current video frame to low-res canvas
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = frame.data;
      const length = data.length;

      let diffScore = 0;

      if (prevFrameRef.current) {
        const prev = prevFrameRef.current;
        // Simple pixel difference
        for (let i = 0; i < length; i += 4) { // stride 4 (RGBA)
            // Compare luminance roughly
            const diff = Math.abs(data[i] - prev[i]) + Math.abs(data[i+1] - prev[i+1]) + Math.abs(data[i+2] - prev[i+2]);
            if (diff > 50) diffScore++;
        }
      }

      // Store current frame
      prevFrameRef.current = new Uint8ClampedArray(data);

      // Normalize score (heuristic)
      // Max pixels approx 3000. If 10% change, that's a lot of motion.
      const normalizedMotion = Math.min(diffScore / (canvas.width * canvas.height * 0.1), 1);
      
      // Smooth dampening
      setMotionValue(prev => prev * 0.8 + normalizedMotion * 0.2);

      intervalRef.current = requestAnimationFrame(checkMotion);
    };

    intervalRef.current = requestAnimationFrame(checkMotion);

    return () => {
      if (intervalRef.current) cancelAnimationFrame(intervalRef.current);
    };
  }, [isActive, videoRef]);

  return motionValue;
};