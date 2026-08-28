"use client";

import { X, Download, Building2, Layers, Gem, Paintbrush, Sparkles, Home } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { ArchitectureSpec } from "@/types";

interface DetailPanelProps {
  spec: ArchitectureSpec | null;
  modelUrl: string | null;
  onClose: () => void;
}

export function DetailPanel({ spec, modelUrl, onClose }: DetailPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 dark:border-surface-700 flex-shrink-0">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-architect-500" />
          Specification Details
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-zinc-400 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {!spec ? (
          <div className="text-center py-12">
            <Building2 className="h-10 w-10 text-zinc-200 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Generate a 3D model to inspect its spatial and material breakdown here.
            </p>
          </div>
        ) : (
          <>
            <Section icon={<Building2 className="h-3.5 w-3.5" />} label="Building Type">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {spec.building_type}
              </p>
            </Section>

            <Section icon={<Paintbrush className="h-3.5 w-3.5" />} label="Architectural Style">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {spec.architectural_style}
              </p>
            </Section>

            <Section icon={<Layers className="h-3.5 w-3.5" />} label="Total Floors">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {spec.total_floors} {spec.total_floors === 1 ? "story" : "stories"}
              </p>
            </Section>

            <Section icon={<Gem className="h-3.5 w-3.5" />} label="Materials">
              <div className="flex flex-wrap gap-1.5">
                {spec.materials.map((m) => (
                  <Badge key={m} variant="info">{m}</Badge>
                ))}
              </div>
            </Section>

            <Section icon={<Sparkles className="h-3.5 w-3.5" />} label="Key Features">
              <div className="flex flex-wrap gap-1.5">
                {spec.key_features.map((f) => (
                  <Badge key={f} variant="default">{f}</Badge>
                ))}
              </div>
            </Section>

            <Section icon={<Paintbrush className="h-3.5 w-3.5" />} label="Color Palette">
              <div className="flex flex-wrap gap-2">
                {spec.color_palette.map((color) => (
                  <div key={color} className="flex items-center gap-1.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-surface-200 dark:border-surface-700"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{color}</span>
                  </div>
                ))}
              </div>
            </Section>

            {spec.rooms && spec.rooms.length > 0 && (
              <Section icon={<Home className="h-3.5 w-3.5" />} label={`Rooms (${spec.rooms.length})`}>
                <div className="space-y-1.5">
                  {spec.rooms.map((room, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-800 text-xs"
                    >
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{room.name}</span>
                      <span className="text-zinc-400 ml-1.5">
                        · Floor {room.floor_level} · {room.dimensions_approx}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section icon={<Sparkles className="h-3.5 w-3.5" />} label="AI Synthesized 3D Prompt">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed bg-surface-50 dark:bg-surface-800 rounded-lg p-3 font-mono">
                {spec.refined_3d_prompt}
              </p>
            </Section>

            {modelUrl && (
              <div className="pt-2">
                <a
                  href={modelUrl}
                  download="architectural_model.glb"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download .glb Model
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mb-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}