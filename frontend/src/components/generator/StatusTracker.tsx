"use client";

import { motion } from "framer-motion";
import { Brain, Palette, Box, CheckCircle2, XCircle } from "lucide-react";
import type { TaskStatus } from "@/types";

interface StatusTrackerProps {
  status: TaskStatus | "idle";
}

const STEPS = [
  { key: "parsing",       label: "Analyzing Description", icon: Brain,        description: "AI is extracting architectural details..." },
  { key: "generating_2d", label: "Creating Blueprint",    icon: Palette,      description: "Generating reference spatial massing..." },
  { key: "generating_3d", label: "Building 3D Model",     icon: Box,          description: "Synthesizing procedural 3D geometry..." },
  { key: "completed",     label: "Complete",              icon: CheckCircle2, description: "Your model is ready!" },
] as const;

function getStepState(stepKey: string, currentStatus: string) {
  const order = ["pending", "parsing", "generating_2d", "generating_3d", "completed"];
  const stepIndex = order.indexOf(stepKey);
  const currentIndex = order.indexOf(currentStatus);

  if (currentStatus === "failed") return "error";
  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "active";
  return "upcoming";
}

export function StatusTracker({ status }: StatusTrackerProps) {
  if (status === "idle") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-6"
    >
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const state = getStepState(step.key, status);
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center text-center">
                <div
                  className={
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 " +
                    (state === "done"
                      ? "bg-emerald-500 text-white"
                      : state === "active"
                      ? "bg-architect-500 text-white animate-pulse-glow"
                      : state === "error"
                      ? "bg-red-500 text-white"
                      : "bg-surface-200 dark:bg-surface-700 text-zinc-400")
                  }
                >
                  {state === "error" ? (
                    <XCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                <span
                  className={
                    "mt-2 text-xs font-medium " +
                    (state === "active"
                      ? "text-architect-600 dark:text-architect-400"
                      : state === "done"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-400")
                  }
                >
                  {step.label}
                </span>

                {state === "active" && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 max-w-24"
                  >
                    {step.description}
                  </motion.span>
                )}
              </div>

              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-3 h-0.5 rounded-full bg-surface-200 dark:bg-surface-700 relative overflow-hidden">
                  {(state === "done" || state === "active") && (
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: state === "done" ? "100%" : "50%" }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}