import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ParticleScene } from './components/ParticleScene';
import { UI } from './components/UI';
import { AppState, ShapeType } from './types';
import Webcam from 'react-webcam';
import { useMotionDetector } from './hooks/useMotionDetector';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentShape: ShapeType.HEART,
    particleColor: '#FF6B6B',
    particleCount: 8000,
    isWebcamActive: true,
    motionSensitivity: 1.0,
  });

  const [interactionMode, setInteractionMode] = useState<'mouse' | 'motion'>('mouse');
  const [interactionValue, setInteractionValue] = useState(0);

  const webcamRef = useRef<Webcam>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null); // To store the actual video element from react-webcam

  // Get motion value from our custom hook
  const motionAmount = useMotionDetector(videoRef, appState.isWebcamActive && interactionMode === 'motion');

  // Handle Mouse Move for precise control
  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (interactionMode !== 'mouse') return;
    const x = e.clientX / window.innerWidth;
    // Map center (0.5) to 0, edges to 1 for "Opening" effect or just Left->Right
    // Let's do: Left = Close, Right = Open
    setInteractionValue(x);
  }, [interactionMode]);

  // Sync interaction value based on mode
  useEffect(() => {
    if (interactionMode === 'motion') {
      // Amplify motion for better effect
      setInteractionValue(Math.min(motionAmount * 5, 1));
    }
  }, [motionAmount, interactionMode]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Helper to capture ref from Webcam component
  const handleUserMedia = () => {
     if (webcamRef.current && webcamRef.current.video) {
         videoRef.current = webcamRef.current.video;
     }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white selection:bg-cyan-500 selection:text-black">
      
      {/* Background Webcam */}
      {appState.isWebcamActive && (
        <div className="absolute inset-0 z-0 opacity-40 grayscale contrast-125 pointer-events-none">
          <Webcam
            ref={webcamRef}
            audio={false}
            onUserMedia={handleUserMedia}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* 3D Scene */}
      <div className="absolute inset-0 z-1">
        <ParticleScene
          shape={appState.currentShape}
          color={appState.particleColor}
          count={appState.particleCount}
          interactionValue={interactionValue}
        />
      </div>

      {/* UI Overlay */}
      <UI 
        state={appState} 
        setState={setAppState} 
        toggleFullscreen={toggleFullscreen}
        interactionMode={interactionMode}
        setInteractionMode={setInteractionMode}
      />

    </div>
  );
};

export default App;