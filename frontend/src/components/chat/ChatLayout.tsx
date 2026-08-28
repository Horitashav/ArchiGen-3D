"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  detailPanel: React.ReactNode;
  showDetailPanel: boolean;
  onToggleDetailPanel?: () => void;
}

export function ChatLayout({
  sidebar,
  main,
  detailPanel,
  showDetailPanel,
  onToggleDetailPanel,
}: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex overflow-hidden bg-surface-50 dark:bg-surface-950">
      {/* ── LEFT SIDEBAR ── */}
      <aside
        className={
          "flex-shrink-0 border-r border-surface-200 dark:border-surface-700 " +
          "bg-surface-100 dark:bg-surface-900 transition-all duration-300 ease-in-out overflow-hidden " +
          (sidebarOpen ? "w-[260px]" : "w-0")
        }
      >
        <div className="w-[260px] h-full">{sidebar}</div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-200 dark:border-surface-700 bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>

          <div className="flex-1" />

          {onToggleDetailPanel && (
            <Button variant="ghost" size="sm" onClick={onToggleDetailPanel}>
              {showDetailPanel ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {main}
      </div>

      {/* ── RIGHT DETAIL PANEL ── */}
      <aside
        className={
          "flex-shrink-0 border-l border-surface-200 dark:border-surface-700 " +
          "bg-white dark:bg-surface-900 transition-all duration-300 ease-in-out overflow-hidden " +
          (showDetailPanel ? "w-[340px]" : "w-0")
        }
      >
        <div className="w-[340px] h-full overflow-y-auto">{detailPanel}</div>
      </aside>
    </div>
  );
}