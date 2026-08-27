"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Download } from "lucide-react";

interface ModelViewerProps {
  modelUrl: string;
}

export function ModelViewer({ modelUrl }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    script.type = "module";
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card variant="bordered" padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 dark:border-surface-700">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            3D Model Preview
          </h3>
          <a
            href={modelUrl}
            download="model.glb"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download .glb
          </a>
        </div>

        <div ref={containerRef} className="relative bg-zinc-100 dark:bg-zinc-900">
          <div
            dangerouslySetInnerHTML={{
              __html: `
                <model-viewer
                  src="${modelUrl}"
                  alt="AI-generated 3D architectural model"
                  auto-rotate
                  camera-controls
                  shadow-intensity="1"
                  shadow-softness="0.5"
                  exposure="0.8"
                  environment-image="neutral"
                  style="width: 100%; height: 500px; --poster-color: transparent;"
                  loading="eager"
                  touch-action="pan-y"
                >
                  <div slot="progress-bar" style="display: none;"></div>
                </model-viewer>
              `,
            }}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full glass text-xs text-zinc-500 dark:text-zinc-400 pointer-events-none">
            Drag to rotate · Scroll to zoom · Two fingers to pan
          </div>
        </div>
      </Card>
    </motion.div>
  );
}