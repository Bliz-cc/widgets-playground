import { useState, type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TEMPLATE_PROMOS } from "../utils/promos";
import type { WidgetView } from "@blizcc/ui";

export interface WidgetDefinition {
  id: string;
  name: string;
  Component: FC<any>;
  schema: WidgetView;
}

export interface WidgetPlaygroundProps {
  widgets: WidgetDefinition[];
}

const PRESETS = [
  {
    name: "Default (Studio)",
    primary: "#7c3aed",
    secondary: "#1e293b",
    accent: "#f472b6",
  },
  {
    name: "Cyber Neon",
    primary: "#ff00ff",
    secondary: "#000000",
    accent: "#00ffff",
  },
  {
    name: "Deep Emerald",
    primary: "#10b981",
    secondary: "#064e3b",
    accent: "#34d399",
  },
  {
    name: "Sunset Gold",
    primary: "#f59e0b",
    secondary: "#451a03",
    accent: "#fbbf24",
  },
  {
    name: "Midnight Rose",
    primary: "#e11d48",
    secondary: "#1e1b4b",
    accent: "#fb7185",
  },
  {
    name: "Arctic Ice",
    primary: "#0ea5e9",
    secondary: "#0c4a6e",
    accent: "#7dd3fc",
  },
];

export const WidgetPlayground: FC<WidgetPlaygroundProps> = ({ widgets }) => {
  const [activeWidgetId, setActiveWidgetId] = useState(widgets[0]?.id);
  const activeWidget =
    widgets.find((w) => w.id === activeWidgetId) || widgets[0];

  if (!activeWidget) return null;

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white p-8 font-sans">
      {/* Header & Controls */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            WIDGET PLAYGROUND
          </h1>
          <p className="text-white/40 font-medium">
            Exploring:{" "}
            <span className="text-white uppercase">{activeWidget.name}</span>
          </p>
        </div>

        {/* Select Dropdown */}
        <div className="relative">
          <select
            value={activeWidgetId}
            onChange={(e) => setActiveWidgetId(e.target.value)}
            className="appearance-none bg-white/5 border border-white/10 rounded-xl px-5 py-3 pr-10 font-bold text-sm text-white/80 focus:outline-none focus:border-purple-500 focus:text-white cursor-pointer transition-all hover:border-white/20"
          >
            {widgets.map((w) => (
              <option key={w.id} value={w.id} className="bg-[#1a1a2e] text-white">
                {w.name}
              </option>
            ))}
          </select>
          {/* Chevron */}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">▼</span>
        </div>
      </div>

      {/* Grid of Previews */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeWidgetId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="contents"
          >
            {PRESETS.map((preset) => (
              <div key={preset.name} className="flex flex-col gap-4 group">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-purple-400 transition-colors">
                    {preset.name}
                  </span>
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: preset.secondary }}
                    />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: preset.accent }}
                    />
                  </div>
                </div>

                <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-transform group-hover:scale-[1.02] duration-500 bg-black/20">
                  <activeWidget.Component
                    {...activeWidget.schema}
                    theme_primary={preset.primary}
                    theme_secondary={preset.secondary}
                    theme_accent={preset.accent}
                    promos={TEMPLATE_PROMOS}
                    preview_mode={true}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-[0.3em] text-white/20">
        <span>BLIZ WIDGET ENGINE V0.1.39</span>
        <span>BUILD SUCCESSFUL: {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
};
