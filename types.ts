export enum ShapeType {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  BUDDHA = 'Buddha', // Represented as a meditating abstract form
  FIREWORKS = 'Fireworks'
}

export interface AppState {
  currentShape: ShapeType;
  particleColor: string;
  particleCount: number;
  isWebcamActive: boolean;
  motionSensitivity: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}