"use client";

import { Building2, Moon, Sun, Code } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-surface-200 dark:border-surface-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-architect-500 rounded-xl text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Arch<span className="text-architect-500">3D</span>
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 -mt-0.5">
                AI Architecture Generator
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleDark}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-xl text-zinc-600 hover:bg-surface-100 dark:text-zinc-400 dark:hover:bg-surface-800 transition-colors"
            >
              <Code className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}