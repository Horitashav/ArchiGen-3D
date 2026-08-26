import React from "react";
import { Download, Box } from "lucide-react";

export default function ModelViewer({ modelUrl, isGenerating }) {
  const fullModelUrl = modelUrl 
    ? (modelUrl.startsWith("http") ? modelUrl : `http://localhost:8000${modelUrl}`)
    : null;

  return (
    <div className="relative w-full h-[520px] rounded-2xl bg-gradient-to-b from-studio-900 via-studio-850 to-studio-950 border border-studio-700/60 shadow-2xl overflow-hidden flex flex-col justify-between p-4">
      {/* Top Overlay Badge */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-studio-900/80 backdrop-blur-md border border-studio-700/80 text-xs font-medium text-slate-300">
          <Box className="w-3.5 h-3.5 text-accent-blue" />
          <span>WebGL 3D Orbit Viewport</span>
        </div>

        {fullModelUrl && !isGenerating && (
          <a
            href={fullModelUrl}
            download="architecture_model.glb"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-xs font-medium text-indigo-300 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .GLB</span>
          </a>
        )}
      </div>

      {/* Main 3D Canvas or Empty State */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <Box className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Synthesizing 3D Architectural Mesh</p>
              <p className="text-xs text-slate-400 mt-1">Extracting spatial layout and calculating vertex geometry...</p>
            </div>
          </div>
        ) : fullModelUrl ? (
          <model-viewer
            src={fullModelUrl}
            alt="3D Architectural Mesh"
            auto-rotate
            camera-controls
            shadow-intensity="1.8"
            shadow-softness="0.8"
            exposure="1.0"
            environment-image="neutral"
            style={{ width: "100%", height: "100%" }}
          ></model-viewer>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center px-6 text-slate-500">
            <div className="w-14 h-14 rounded-2xl bg-studio-800/80 border border-studio-700/80 flex items-center justify-center text-slate-400">
              <Box className="w-7 h-7 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">No 3D Model Loaded</p>
              <p className="text-xs text-slate-500 mt-0.5">Select a preset or enter a prompt on the left to synthesize geometry.</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      {fullModelUrl && !isGenerating && (
        <div className="z-10 flex items-center justify-between text-[11px] text-slate-400 px-2 py-1 rounded-md bg-studio-900/60 backdrop-blur-sm border border-studio-800">
          <span>Left-click + drag: Rotate | Scroll: Zoom | Right-click: Pan</span>
          <span className="text-emerald-400 flex items-center gap-1">● Active Shader</span>
        </div>
      )}
    </div>
  );
}