import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { generateShapePositions } from '../utils/geometry';
import { ShapeType } from '../types';

interface ParticleSystemProps {
  shape: ShapeType;
  color: string;
  count: number;
  interactionValue: number; // 0 to 1 (Mouse or Motion)
}

// Custom shader for cooler particles
const particleVertexShader = `
  uniform float uTime;
  uniform float uSize;
  uniform float uScatter;
  attribute vec3 targetPosition;
  attribute float randomSeed;
  
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    
    // Interpolate between current position (handled by JS for shape morph) and scattered
    // Actually, we will handle shape morphing in JS for simplicity with complex equations,
    // and use shader for "breathing" and interaction.
    
    // Add noise based on time and interaction
    float noise = sin(pos.y * 2.0 + uTime) * cos(pos.x * 2.0 + uTime * 0.5);
    
    // Expansion/Scatter effect based on hand gesture (uScatter)
    vec3 scatterDir = normalize(pos) * uScatter * 5.0; // Explode outwards
    vec3 finalPos = pos + scatterDir + (vec3(noise) * uScatter * 0.5);

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = uSize * (30.0 / -mvPosition.z);
    
    // Fade out if scattering too much
    vAlpha = 1.0 - (uScatter * 0.5);
  }
`;

const particleFragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    // Circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Soft edge glow
    float glow = 1.0 - (dist * 2.0);
    glow = pow(glow, 1.5);

    gl_FragColor = vec4(uColor, vAlpha * glow);
  }
`;

const Particles: React.FC<ParticleSystemProps> = ({ shape, color, count, interactionValue }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const hoverRef = useRef(0);
  
  // Buffers
  const { positions, targetPositions } = useMemo(() => {
    const current = generateShapePositions(shape, count);
    return {
      positions: current, // Initial positions
      targetPositions: current // For morphing
    };
  }, [shape, count]);

  // We keep a secondary buffer to lerp towards
  const currentPositionsRef = useRef<Float32Array>(positions.slice());
  
  // Update geometry when shape changes
  useEffect(() => {
    const newTargets = generateShapePositions(shape, count);
    // Animate points to new positions over time in useFrame
    if (pointsRef.current) {
        (pointsRef.current.geometry as THREE.BufferGeometry).setAttribute(
            'targetPosition', 
            new THREE.BufferAttribute(newTargets, 3)
        );
    }
    // We store the target in a plain property to access in useFrame for CPU lerp 
    // (CPU lerp is easier for complex morphs than writing a complex shader for 5 shapes)
    if (pointsRef.current) {
        pointsRef.current.userData.targetPositions = newTargets;
    }
  }, [shape, count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const material = pointsRef.current.material as THREE.ShaderMaterial;
    
    // Update Shader Uniforms
    material.uniforms.uTime.value = time;
    // Smooth interaction value
    hoverRef.current = THREE.MathUtils.lerp(hoverRef.current, interactionValue, 0.1);
    material.uniforms.uScatter.value = hoverRef.current;
    material.uniforms.uColor.value.set(color);

    // CPU Morphing Logic (Smooth transition between shapes)
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const target = pointsRef.current.userData.targetPositions;

    if (target) {
        const positions = posAttr.array as Float32Array;
        const speed = 2.5 * delta; // Morph speed

        let needsUpdate = false;
        for (let i = 0; i < count * 3; i++) {
            const diff = target[i] - positions[i];
            if (Math.abs(diff) > 0.01) {
                positions[i] += diff * speed;
                needsUpdate = true;
            } else {
                positions[i] = target[i];
            }
        }
        if (needsUpdate) posAttr.needsUpdate = true;
    }
    
    // Slow rotation of the whole system
    pointsRef.current.rotation.y += 0.05 * delta;
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uSize: { value: 4.0 }, // Base particle size
    uScatter: { value: 0 }
  }), [color]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions} // Initialize with current
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-targetPosition"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        attach="material"
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const ParticleScene: React.FC<ParticleSystemProps> = (props) => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
        <ambientLight intensity={0.5} />
        <Particles {...props} />
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};