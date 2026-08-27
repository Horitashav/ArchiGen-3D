"use client";

import { motion } from "framer-motion";
import { Building2, Layers, Paintbrush, Gem, Home, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ArchitectureSpec } from "@/types";

interface SpecViewerProps {
  spec: ArchitectureSpec;
}

export function SpecViewer({ spec }: SpecViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card variant="bordered" padding="lg">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-architect-500" />
          Architecture Specification
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              icon={<Building2 className="h-4 w-4" />}
              label="Building Type"
              value={spec.building_type}
            />
            <InfoItem
              icon={<Paintbrush className="h-4 w-4" />}
              label="Style"
              value={spec.architectural_style}
            />
            <InfoItem
              icon={<Layers className="h-4 w-4" />}
              label="Total Floors"
              value={`${spec.total_floors} ${spec.total_floors === 1 ? "story" : "stories"}`}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-2">
              <Gem className="h-3.5 w-3.5" />
              Materials
            </label>
            <div className="flex flex-wrap gap-1.5">
              {spec.materials.map((material) => (
                <Badge key={material} variant="info">
                  {material}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Key Features
            </label>
            <div className="flex flex-wrap gap-1.5">
              {spec.key_features.map((feature) => (
                <Badge key={feature} variant="default">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">
              Color Palette
            </label>
            <div className="flex gap-2">
              {spec.color_palette.map((color) => (
                <div key={color} className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
                  <div
                    className="w-4 h-4 rounded-full border border-surface-200 dark:border-surface-700"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                  {color}
                </div>
              ))}
            </div>
          </div>

          {spec.rooms && spec.rooms.length > 0 && (
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-2">
                <Home className="h-3.5 w-3.5" />
                Rooms ({spec.rooms.length})
              </label>
              <div className="grid grid-cols-2 gap-2">
                {spec.rooms.map((room, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-800 text-sm"
                  >
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {room.name}
                    </span>
                    <span className="text-zinc-400 dark:text-zinc-500 text-xs ml-2">
                      Floor {room.floor_level} · {room.dimensions_approx}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-1">
        {icon}
        {label}
      </label>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}