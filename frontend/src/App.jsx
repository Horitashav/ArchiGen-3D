import React, { useState, useEffect } from "react";
import { 
  Building2, Sparkles, Layers, RefreshCw, Cpu, 
  CheckCircle2, AlertCircle, Compass, Home, Palette, 
  ArrowUpRight, History
} from "lucide-react";
import ModelViewer from "./components/ModelViewer";
import { generateArchitecture, parseBlueprintOnly, fetchRecentTasks } from "./services/api";

const PRESETS = [
  {
    title: "Minimalist Cantilever Villa",
    tag: "Residential",
    prompt: "A modern 2-story minimalist villa with cedar timber cladding, black steel frames, floor-to-ceiling glass windows, and a cantilevered second-floor balcony over a reflection pool."
  },
  {
    title: "Brutalist Concrete Office Tower",
    tag: "Commercial",
    prompt: "A 3-story brutalist office tower featuring heavy exposed aggregate concrete slabs, recessed glass ribbons, and angular geometric exterior columns."
  },
  {
    title: "Scandinavian Lakeside Cabin",
    tag: "Nordic",
    prompt: "A contemporary single-story Scandinavian cabin with floor-to-ceiling panoramic glass windows, light pine timber walls, and a raised wooden deck foundation."
  },
  {
    title: "Industrial Steel & Glass Loft",
    tag: "Urban",
    prompt: "A 2-story industrial loft with exposed matte black steel I-beams, textured red brick accent walls, large grid-pane windows, and a flat roof terrace."
  }
];

export default function App() {
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("spec"); // 'spec' | 'json'
  const [currentResult, setCurrentResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [backendAlive, setBackendAlive] = useState(true);

  const loadHistory = async () => {
    try {
      const tasks = await fetchRecentTasks(5);
      setHistory(tasks);
      setBackendAlive(true);
    } catch (e) {
      setBackendAlive(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateArchitecture(prompt);
      setCurrentResult(data);
      await loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate 3D model.");
    } finally {
      setLoading(false);
    }
  };

  const handleParseOnly = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const spec = await parseBlueprintOnly(prompt);
      setCurrentResult({ architecture_spec: spec, model_url: null, status: "completed" });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to parse blueprint.");
    } finally {
      setLoading(false);
    }
  };

  const spec = currentResult?.architecture_spec;

  return (
    <div className="min-h-screen bg-studio-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-studio-800 bg-studio-900/60 backdrop-blur-xl sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-accent-blue flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">ArchSynth 3D</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v0.1.0 AI Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Natural Language to 3D Architectural Spatial Synthesis</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-studio-800/80 border border-studio-700 text-xs">
            <span className={`w-2 h-2 rounded-full ${backendAlive ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            <span className="text-slate-300 font-medium">{backendAlive ? "FastAPI Connected" : "Backend Offline"}</span>
          </div>
        </div>
      </header>

      {/* Main Studio Grid */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Controls & Presets (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Prompt Box */}
          <div className="bg-studio-900/80 border border-studio-700/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Architectural Prompt
              </label>
              <span className="text-[11px] text-slate-500">{prompt.length}/600 chars</span>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe building layout, floors, materials, facade styling, and balconies..."
              className="w-full bg-studio-950 border border-studio-700 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />

            {/* Quick Action Buttons */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                <span>Synthesize 3D</span>
              </button>

              <button
                onClick={handleParseOnly}
                disabled={loading || !prompt.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-studio-800 hover:bg-studio-700 border border-studio-600 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Cpu className="w-4 h-4 text-slate-400" />
                <span>Parse Blueprint</span>
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="bg-studio-900/80 border border-studio-700/80 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-accent-blue" />
              Design Presets
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p.prompt)}
                  className="text-left p-3 rounded-xl bg-studio-950/60 hover:bg-studio-800/80 border border-studio-800 hover:border-studio-600 transition-all group flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {p.title}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{p.tag} Style</div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* History Drawer */}
          <div className="bg-studio-900/80 border border-studio-700/80 rounded-2xl p-5 shadow-xl flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-400" />
                Recent Syntheses
              </h3>
              <button onClick={loadHistory} className="text-slate-400 hover:text-slate-200 transition-colors">
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No tasks in database yet.</p>
              ) : (
                history.map((t) => (
                  <div
                    key={t.task_id}
                    onClick={() => setCurrentResult(t)}
                    className="p-2.5 rounded-lg bg-studio-950/50 hover:bg-studio-800/60 border border-studio-800 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="truncate max-w-[200px]">
                      <div className="text-xs text-slate-300 truncate font-mono">{t.task_id.substring(0, 8)}...</div>
                      <div className="text-[10px] text-slate-500 truncate">{t.architecture_spec?.architectural_style || "Architectural Task"}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono">
                      {t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: 3D Viewport & Architectural Blueprint (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* 3D Model Canvas */}
          <ModelViewer 
            modelUrl={currentResult?.model_url} 
            isGenerating={loading} 
          />

          {/* Blueprint Insights Panel */}
          <div className="bg-studio-900/80 border border-studio-700/80 rounded-2xl p-5 shadow-xl">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-studio-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("spec")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "spec"
                      ? "bg-indigo-600/20 border border-indigo-500/40 text-indigo-300"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Extracted Blueprint
                </button>
                <button
                  onClick={() => setActiveTab("json")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "json"
                      ? "bg-indigo-600/20 border border-indigo-500/40 text-indigo-300"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Raw Metadata JSON
                </button>
              </div>

              {spec && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pydantic Validated</span>
                </div>
              )}
            </div>

            {/* Spec Tab Content */}
            {activeTab === "spec" ? (
              spec ? (
                <div className="flex flex-col gap-5">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-studio-950/70 border border-studio-800">
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-indigo-400" /> Building Type
                      </div>
                      <div className="text-sm font-semibold text-slate-200 mt-1 capitalize">{spec.building_type}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-studio-950/70 border border-studio-800">
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-accent-blue" /> Architectural Style
                      </div>
                      <div className="text-sm font-semibold text-slate-200 mt-1 capitalize">{spec.architectural_style}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-studio-950/70 border border-studio-800">
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" /> Total Floors
                      </div>
                      <div className="text-sm font-semibold text-slate-200 mt-1">{spec.total_floors} Levels</div>
                    </div>
                  </div>

                  {/* Materials & Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Identified Materials</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {spec.materials?.map((mat, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-800 text-xs text-slate-300">
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Spatial Features</h4>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {spec.key_features?.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Room Breakdown Table */}
                  {spec.rooms && spec.rooms.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Spatial Layout Breakdown</h4>
                      <div className="overflow-x-auto rounded-xl border border-studio-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-studio-950 text-slate-400 border-b border-studio-800">
                            <tr>
                              <th className="p-2.5 font-medium">Room / Space</th>
                              <th className="p-2.5 font-medium">Level</th>
                              <th className="p-2.5 font-medium">Estimated Dimensions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-studio-800/60 bg-studio-950/40">
                            {spec.rooms.map((r, idx) => (
                              <tr key={idx} className="hover:bg-studio-800/30 transition-colors">
                                <td className="p-2.5 font-medium text-slate-200">{r.name}</td>
                                <td className="p-2.5 text-slate-400">Floor {r.floor_level}</td>
                                <td className="p-2.5 text-slate-400">{r.dimensions_approx || "Standard"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Run a prompt to view the extracted architectural blueprint specifications.
                </div>
              )
            ) : (
              <pre className="p-3.5 rounded-xl bg-studio-950 border border-studio-800 text-xs text-slate-300 font-mono overflow-x-auto max-h-[300px]">
                {JSON.stringify(currentResult || { message: "No active task selected." }, null, 2)}
              </pre>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}