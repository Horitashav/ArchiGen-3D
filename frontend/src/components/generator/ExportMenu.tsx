"use client";

import { useState } from "react";
import { Download, FileBox, Printer, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ExportMenuProps {
  taskId: string;
  token: string | null;
}

const FORMATS = [
  { key: "glb",  label: "GLB (Web/AR)",       icon: FileBox,  description: "Textured, web-optimized" },
  { key: "obj",  label: "OBJ (Universal 3D)", icon: FileBox,  description: "Blender, Maya, 3ds Max" },
  { key: "stl",  label: "STL (3D Print)",     icon: Printer,  description: "Slicer-ready, geometry only" },
  { key: "pdf",  label: "PDF (Summary)",       icon: FileText, description: "Architectural specification sheet" },
] as const;

export function ExportMenu({ taskId, token }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const handleExport = async (format: string) => {
    setDownloading(format);
    try {
      if (format === "glb") {
        window.open(`${API_URL.replace("/api/v1", "")}/static/models/${taskId}.glb`);
      } else {
        const response = await fetch(`${API_URL}/models/tasks/${taskId}/export/${format}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) throw new Error("Export failed");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `architecture_${taskId.slice(0, 8)}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setDownloading(null);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button variant="secondary" size="sm" onClick={() => setIsOpen(!isOpen)}>
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-64 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-xl z-50 py-1 animate-fade-in">
          {FORMATS.map((fmt) => {
            const Icon = fmt.icon;
            return (
              <button
                key={fmt.key}
                onClick={() => handleExport(fmt.key)}
                disabled={downloading !== null}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors disabled:opacity-50"
              >
                <Icon className="h-4 w-4 text-architect-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {fmt.label}
                    {downloading === fmt.key && " ..."}
                  </p>
                  <p className="text-[10px] text-zinc-400">{fmt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}