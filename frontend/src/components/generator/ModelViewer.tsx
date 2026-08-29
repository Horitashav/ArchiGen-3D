"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box, Grid3x3, Image as ImageIcon, Sun, Moon, Lamp, RotateCcw,
  Maximize2, Camera, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportMenu } from "./ExportMenu";

interface ModelViewerProps {
  modelUrl: string;
  taskId?: string;
  token?: string | null;
}

const CAMERA_PRESETS = [
  { label: "Front",       icon: "→", orbit: "0deg 75deg 105%",   target: "auto auto auto" },
  { label: "Side",        icon: "↗", orbit: "90deg 75deg 105%",  target: "auto auto auto" },
  { label: "Top",         icon: "↓", orbit: "0deg 0deg 105%",    target: "auto auto auto" },
  { label: "Perspective", icon: "◇", orbit: "45deg 55deg 105%",  target: "auto auto auto" },
  { label: "Close-up",    icon: "🔍", orbit: "30deg 70deg 60%",   target: "auto auto auto" },
] as const;

const LIGHTING_PRESETS = [
  { label: "Neutral",  icon: Sun,  env: "neutral",    exposure: 1.0 },
  { label: "Studio",   icon: Lamp, env: "legacy",     exposure: 0.8 },
  { label: "Dawn",     icon: Sun,  env: "legacy",     exposure: 1.2 },
  { label: "Night",    icon: Moon, env: "neutral",    exposure: 0.3 },
] as const;

type RenderMode = "textured" | "solid" | "wireframe";

export function ModelViewer({ modelUrl, taskId, token }: ModelViewerProps) {
  const viewerRef = useRef<HTMLElement | null>(null);
  const [renderMode, setRenderMode] = useState<RenderMode>("textured");
  const [activeLighting, setActiveLighting] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showCameraMenu, setShowCameraMenu] = useState(false);

  useEffect(() => {
    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement("script");
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
      script.type = "module";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const el = document.getElementById("arch-model-viewer");
    if (el) viewerRef.current = el;
  }, [modelUrl]);

  const setCameraPreset = (preset: typeof CAMERA_PRESETS[number]) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.setAttribute("camera-orbit", preset.orbit);
    viewer.setAttribute("camera-target", preset.target);
    setShowCameraMenu(false);
  };

  const setLighting = (index: number) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const preset = LIGHTING_PRESETS[index];
    viewer.setAttribute("environment-image", preset.env);
    viewer.setAttribute("exposure", String(preset.exposure));
    setActiveLighting(index);
  };

  const toggleAutoRotate = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (autoRotate) {
      viewer.removeAttribute("auto-rotate");
    } else {
      viewer.setAttribute("auto-rotate", "");
    }
    setAutoRotate(!autoRotate);
  };

  const resetCamera = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.setAttribute("camera-orbit", "45deg 55deg 105%");
    viewer.setAttribute("camera-target", "auto auto auto");
  };

  const applyRenderMode = (mode: RenderMode) => {
    const viewer = viewerRef.current as any;
    if (!viewer || !viewer.model) return;

    setRenderMode(mode);
    try {
      viewer.model.materials.forEach((material: any) => {
        if (mode === "solid") {
          material.pbrMetallicRoughness.setBaseColorFactor([0.85, 0.85, 0.88, 1.0]);
          material.pbrMetallicRoughness.setMetallicFactor(0.0);
          material.pbrMetallicRoughness.setRoughnessFactor(1.0);
        } else if (mode === "wireframe") {
          material.pbrMetallicRoughness.setBaseColorFactor([0.2, 0.5, 1.0, 1.0]);
          material.setAlphaMode("OPAQUE");
        }
      });
    } catch {
      console.warn("Could not modify material mode");
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700 bg-zinc-100 dark:bg-zinc-900">
      {/* ── Top Toolbar ── */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <div className="flex items-center gap-1 pointer-events-auto">
          {[
            { mode: "textured" as const, icon: ImageIcon, label: "Textured" },
            { mode: "solid" as const,    icon: Box,       label: "Solid" },
            { mode: "wireframe" as const,icon: Grid3x3,   label: "Wireframe" },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => applyRenderMode(mode)}
              title={label}
              className={cn(
                "p-1.5 rounded-lg transition-all text-white/70 hover:text-white hover:bg-white/20",
                renderMode === mode && "bg-white/25 text-white"
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 pointer-events-auto">
          {LIGHTING_PRESETS.map((preset, i) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.label}
                onClick={() => setLighting(i)}
                title={preset.label}
                className={cn(
                  "p-1.5 rounded-lg transition-all text-white/70 hover:text-white hover:bg-white/20",
                  activeLighting === i && "bg-white/25 text-white"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3D Viewer ── */}
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <model-viewer
              id="arch-model-viewer"
              src="${modelUrl}"
              alt="AI-generated 3D architectural model"
              auto-rotate
              camera-controls
              camera-orbit="45deg 55deg 105%"
              shadow-intensity="1"
              shadow-softness="0.5"
              exposure="1.0"
              environment-image="neutral"
              interaction-prompt="none"
              style="width: 100%; height: 500px; --poster-color: transparent;"
              loading="eager"
              touch-action="pan-y"
            ></model-viewer>
          `,
        }}
      />

      {/* ── Bottom Toolbar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
        <div className="flex items-center gap-1 pointer-events-auto">
          <div className="relative">
            <button
              onClick={() => setShowCameraMenu(!showCameraMenu)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              <Camera className="h-3.5 w-3.5" />
              Camera
              <ChevronDown className={cn("h-3 w-3 transition-transform", showCameraMenu && "rotate-180")} />
            </button>

            {showCameraMenu && (
              <div className="absolute bottom-full mb-1 left-0 w-40 rounded-xl bg-zinc-900/95 border border-zinc-700 shadow-2xl py-1 backdrop-blur-xl">
                {CAMERA_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setCameraPreset(preset)}
                    className="w-full px-3 py-2 text-left text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="text-base">{preset.icon}</span>
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleAutoRotate}
            title={autoRotate ? "Pause rotation" : "Start rotation"}
            className={cn(
              "p-1.5 rounded-lg transition-all text-white/70 hover:text-white hover:bg-white/20",
              autoRotate && "bg-white/25 text-white"
            )}
          >
            <RotateCcw className={cn("h-4 w-4", autoRotate && "animate-spin")} style={{ animationDuration: "3s" }} />
          </button>

          <button
            onClick={resetCamera}
            title="Reset camera view"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <div className="pointer-events-auto">
          {taskId && <ExportMenu taskId={taskId} token={token ?? null} />}
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-white/60 pointer-events-none">
        Drag to rotate · Scroll to zoom · Two fingers to pan
      </div>
    </div>
  );
}