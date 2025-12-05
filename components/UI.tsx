import React from 'react';
import { AppState, ShapeType } from '../types';
import { Camera, Layers, Minimize2, Maximize2, Palette, Activity } from 'lucide-react';

interface UIProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  toggleFullscreen: () => void;
  interactionMode: 'mouse' | 'motion';
  setInteractionMode: (mode: 'mouse' | 'motion') => void;
}

export const UI: React.FC<UIProps> = ({ state, setState, toggleFullscreen, interactionMode, setInteractionMode }) => {
  
  const shapes = Object.values(ShapeType);
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#F0F', '#00FFFF', '#FFFFFF'];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 pointer-events-auto">
          <h1 className="text-white font-bold text-xl tracking-wider flex items-center gap-2">
            <Activity className="text-cyan-400" size={20} />
            ZenParticles
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {interactionMode === 'motion' 
              ? 'Move hands/body to disperse particles' 
              : 'Move mouse horizontally to disperse'}
          </p>
        </div>

        <div className="flex gap-2">
           <button
            onClick={() => setState(s => ({ ...s, isWebcamActive: !s.isWebcamActive }))}
            className={`pointer-events-auto p-3 rounded-xl backdrop-blur-md border transition-all ${
              state.isWebcamActive 
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                : 'bg-black/40 border-white/10 text-white hover:bg-white/10'
            }`}
            title="Toggle Webcam"
          >
            <Camera size={20} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="pointer-events-auto p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Controls Bottom */}
      <div className="flex flex-col gap-4 items-center w-full pointer-events-none">
        
        {/* Interaction Switcher */}
        <div className="pointer-events-auto bg-black/60 backdrop-blur-lg rounded-full p-1 flex gap-1 border border-white/10">
             <button
                onClick={() => setInteractionMode('mouse')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    interactionMode === 'mouse' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
             >
                Mouse Control
             </button>
             <button
                onClick={() => setInteractionMode('motion')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    interactionMode === 'motion' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                }`}
             >
                Motion Control (Webcam)
             </button>
        </div>

        <div className="pointer-events-auto bg-black/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 w-full max-w-2xl shadow-2xl">
          
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            
            {/* Shape Selector */}
            <div className="flex flex-col gap-3 w-full">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={12} /> Model
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {shapes.map(shape => (
                  <button
                    key={shape}
                    onClick={() => setState(s => ({ ...s, currentShape: shape }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                      state.currentShape === shape
                        ? 'bg-white/10 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="flex flex-col gap-3 shrink-0">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Palette size={12} /> Color
              </span>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setState(s => ({ ...s, particleColor: color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      state.particleColor === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color, boxShadow: state.particleColor === color ? `0 0 10px ${color}` : 'none' }}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};