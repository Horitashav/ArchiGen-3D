"use client";

import { Header } from "@/components/layout/Header";
import { PromptInput } from "@/components/generator/PromptInput";
import { StatusTracker } from "@/components/generator/StatusTracker";
import { SpecViewer } from "@/components/generator/SpecViewer";
import { ModelViewer } from "@/components/generator/ModelViewer";
import { useGeneration } from "@/hooks/useGeneration";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Layers, Zap } from "lucide-react";

export default function HomePage() {
  const {
    status,
    spec,
    modelUrl,
    error,
    isLoading,
    generate,
    reset,
  } = useGeneration();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-architect-50 via-white to-indigo-50 dark:from-surface-950 dark:via-surface-900 dark:to-architect-950" />
          
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center mb-12">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
              >
                Describe a building.
                <br />
                <span className="gradient-text">Watch it come to life.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto"
              >
                AI-powered text-to-3D architecture generation. Describe any building 
                in natural language and get an interactive 3D model in seconds.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-4 mt-6 text-sm text-zinc-500 dark:text-zinc-400"
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Instant synthesis
                </span>
                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-architect-500" />
                  Any architectural style
                </span>
                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                <span className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-emerald-500" />
                  Interactive 3D preview
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <PromptInput
                onSubmit={generate}
                isLoading={isLoading}
                onReset={reset}
              />
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {status !== "idle" && (
            <div className="max-w-3xl mx-auto">
              <StatusTracker status={status} />
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl mx-auto mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
              >
                <p className="font-medium">Generation failed</p>
                <p className="mt-1">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(spec || modelUrl) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6"
              >
                {spec && (
                  <div className="lg:col-span-2">
                    <SpecViewer spec={spec} />
                  </div>
                )}

                {modelUrl && (
                  <div className={spec ? "lg:col-span-3" : "lg:col-span-5"}>
                    <ModelViewer modelUrl={modelUrl} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="border-t border-surface-200 dark:border-surface-700 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Built with FastAPI, Llama 3, and Procedural 3D Engine · 
          <span className="text-architect-500 font-medium"> Text-to-3D Architect</span>
        </div>
      </footer>
    </div>
  );
}