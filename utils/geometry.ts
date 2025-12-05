import { Vector3, ShapeType } from '../types';
import * as THREE from 'three';

const randomPointInSphere = (radius: number): Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return {
    x: r * sinPhi * Math.cos(theta),
    y: r * sinPhi * Math.sin(theta),
    z: r * Math.cos(phi)
  };
};

export const generateShapePositions = (type: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const tempVec = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;

    switch (type) {
      case ShapeType.HEART: {
        // Heart parametric equation
        const t = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()); // Even distribution
        // 3D Heart variation
        const scale = 0.25;
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // We add volume by using random sphere distribution logic modulated by heart bounds
        
        // Simpler volume approach: rejection sampling or layering
        // Let's use a parametric surface approach mixed with noise
        const phi = Math.random() * Math.PI;
        const theta = Math.random() * Math.PI * 2;
        
        // Base heart 2D
        const hx = 16 * Math.pow(Math.sin(theta), 3);
        const hy = 13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta);
        
        // Add depth
        x = hx * scale;
        y = hy * scale;
        z = (Math.random() - 0.5) * 4 * Math.sin(theta); // Thicker in middle
        
        // Randomize inside
        const spread = Math.random();
        x *= spread;
        y *= spread;
        z *= spread;
        break;
      }

      case ShapeType.FLOWER: {
        // Rose curve 3D
        const k = 4; // Petals
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI; // Curve up/down
        const r = Math.cos(k * theta) + 2; 
        
        const dist = Math.random() * 2;
        x = dist * Math.cos(theta) * r;
        z = dist * Math.sin(theta) * r;
        y = Math.sin(dist * Math.PI) * 2 - 1; 
        break;
      }

      case ShapeType.SATURN: {
        // Planet + Rings
        const isRing = Math.random() > 0.4;
        if (isRing) {
          // Ring
          const innerR = 3;
          const outerR = 5.5;
          const angle = Math.random() * Math.PI * 2;
          const radius = innerR + Math.random() * (outerR - innerR);
          x = Math.cos(angle) * radius;
          z = Math.sin(angle) * radius;
          y = (Math.random() - 0.5) * 0.2; // Thin ring
        } else {
          // Planet Body
          const p = randomPointInSphere(2.5);
          x = p.x; y = p.y; z = p.z;
        }
        
        // Tilt
        const tilt = 0.4;
        const rotX = x;
        const rotY = y * Math.cos(tilt) - z * Math.sin(tilt);
        const rotZ = y * Math.sin(tilt) + z * Math.cos(tilt);
        x = rotX; y = rotY; z = rotZ;
        break;
      }

      case ShapeType.BUDDHA: {
        // Abstract meditating figure (Head, Torso, Legs)
        const part = Math.random();
        if (part < 0.2) {
          // Head
          const p = randomPointInSphere(0.8);
          x = p.x; y = p.y + 2.5; z = p.z;
        } else if (part < 0.6) {
          // Torso (Cylinder-ish)
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 1.2;
          const h = Math.random() * 2.5;
          x = Math.cos(angle) * r;
          y = h;
          z = Math.sin(angle) * r;
        } else {
          // Legs (Crossed - simplified as a wide flattened torus/sphere at bottom)
          const angle = Math.random() * Math.PI * 2;
          const r = 1 + Math.random() * 2; // Wide base
          x = Math.cos(angle) * r;
          y = (Math.random() - 0.5) * 0.8; 
          z = Math.sin(angle) * r;
        }
        // Center it
        y -= 1.5;
        break;
      }

      case ShapeType.FIREWORKS: {
        // Explosion snapshot
        const p = randomPointInSphere(5);
        // Push everything out to surface for shell effect, or full volume for burst
        // Let's do trails: Lines from center. 
        // For point cloud, simply a large sphere with concentration at ends
        const r = 5 * Math.pow(Math.random(), 0.1); // Bias towards outer edge
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }

      default:
        break;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  return positions;
};