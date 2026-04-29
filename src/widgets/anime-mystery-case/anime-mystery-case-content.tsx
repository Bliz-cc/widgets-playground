/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { type FC, useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WidgetBaseContainer, WidgetLayoutContent, WidgetHeadings,
  WidgetFullscreenToggle, WidgetConfetti, WidgetSuccessOverlay,
  WidgetErrorOverlay, CONTENT_LANGUAGE_ENUM,
} from "@blizcc/ui";
import {
  useGetVisitorIndex, useFullscreen, usePromoAutoSelect, usePromoSoldOut,
  useGameSession, usePreviewStateOverride, useAudio, useSubmitWidgetEvents,
} from "@blizcc/ui";
import type { WidgetView } from "@blizcc/ui";

type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

const ITEMS: { label: string; rarity: Rarity; icon: string; color: string }[] = [
  { label: "Stone Shard",   rarity: "COMMON",    icon: "🪨", color: "#6b7280" },
  { label: "Iron Gauntlet", rarity: "COMMON",    icon: "🧤", color: "#6b7280" },
  { label: "Crystal Orb",  rarity: "RARE",      icon: "🔮", color: "#3b82f6" },
  { label: "Thunder Bow",  rarity: "RARE",      icon: "🏹", color: "#3b82f6" },
  { label: "Shadow Blade", rarity: "EPIC",      icon: "⚔️", color: "#a855f7" },
  { label: "Spirit Robe",  rarity: "EPIC",      icon: "👘", color: "#a855f7" },
  { label: "Dragon Core",  rarity: "LEGENDARY", icon: "🐉", color: "#f59e0b" },
  { label: "Void Crystal", rarity: "LEGENDARY", icon: "💎", color: "#f59e0b" },
];

// Extend reel with shuffled duplicates for smooth scrolling
const buildReel = () => {
  const pool = [...ITEMS, ...ITEMS, ...ITEMS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
};

const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: "#6b7280",
  RARE: "#3b82f6",
  EPIC: "#a855f7",
  LEGENDARY: "#f59e0b",
};

const ITEM_H = 88; // px height per reel item

const AnimeMysteryCase: FC<WidgetView> = ({
  widget_id, link_id, theme_primary, theme_secondary, theme_accent, theme_line_height,
  text1, text2, text3, text4, text5, text8, text10, text11,
  promos, original_url = "", content_expired,
  content_language = CONTENT_LANGUAGE_ENUM.ENGLISH,
  terms_link, terms_text, preview_mode, preview_state_override,
}) => {
  const { visitor_index, visitor_index_loading, is_rate_limited, is_interaction_disabled } = useGetVisitorIndex();
  const { element_ref, is_fullscreen, toggle_fullscreen, is_mobile, is_ios } = useFullscreen();
  const { selected_index, select_promo_loading, select_promo_error } = usePromoAutoSelect({
    widget_id, link_id, preview_mode, content_expired,
    promos_length: promos.length,
    skip_fetch: is_interaction_disabled || visitor_index_loading,
  });
  usePromoSoldOut(promos);
  const { send_interaction_event } = useSubmitWidgetEvents(preview_mode);
  const { is_completed, lead_data, handle_pre_game_submit } = useGameSession({
    widget_id, promos, selected_index,
    on_close_cleanup: is_fullscreen ? toggle_fullscreen : undefined,
  });
  const { play } = useAudio(useMemo(() => ({
    win: { src: "/ui/win.mp3", volume: 0.5, loop: false },
    lose: { src: "/ui/lose.mp3", volume: 0.4, loop: false },
  }), []));

  const [phase, setPhase] = useState<"idle" | "spinning" | "result">("idle");
  const [reelItems] = useState(() => buildReel());
  const [offset, setOffset] = useState(0);         // current pixel scroll offset
  const [landedItem, setLandedItem] = useState<typeof ITEMS[0] | null>(null);
  const [won, setWon] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedRef = useRef(8); // px per tick

  usePreviewStateOverride({
    preview_mode, preview_state_override,
    on_start_state: () => setPhase("idle"),
    on_game_state: () => startSpin(),
    on_win_state: () => { setWon(true); setShowResult(true); },
    on_lose_state: () => { setWon(false); setShowResult(true); },
  });

  const startSpin = useCallback(() => {
    if (is_interaction_disabled || is_completed || content_expired) return;
    setPhase("spinning");
    setOffset(0);
    speedRef.current = 10 + Math.random() * 6;
    send_interaction_event(widget_id, selected_index ?? 0, promos);

    loopRef.current = setInterval(() => {
      setOffset(prev => prev + speedRef.current);
    }, 16);
  }, [is_interaction_disabled, is_completed, content_expired, selected_index, promos]);

  const handleStop = useCallback(() => {
    if (phase !== "spinning") return;
    if (loopRef.current) clearInterval(loopRef.current);

    // Which item is in the center window?
    const centerIdx = Math.floor(offset / ITEM_H) % reelItems.length;
    const item = reelItems[centerIdx] ?? reelItems[0];
    setLandedItem(item);
    setPhase("result");

    const isWin = item.rarity === "LEGENDARY" || item.rarity === "EPIC";
    setWon(isWin);

    if (isWin) {
      play("win");
      setShowConfetti(true);
      setTimeout(() => setShowResult(true), 1000);
    } else {
      play("lose");
      setTimeout(() => setShowResult(true), 800);
    }
  }, [phase, offset, reelItems]);

  useEffect(() => () => { if (loopRef.current) clearInterval(loopRef.current); }, []);

  // Visible reel items (3 in window + wrapping)
  const visibleItems = useMemo(() => {
    const startIdx = Math.floor(offset / ITEM_H);
    return Array.from({ length: 5 }, (_, i) => {
      const idx = (startIdx + i) % reelItems.length;
      return { item: reelItems[idx], visualOffset: (offset % ITEM_H) };
    });
  }, [offset, reelItems]);

  return (
    <WidgetBaseContainer ref={element_ref} is_fullscreen={is_fullscreen}>
      {/* Anime void background */}
      <div className="absolute inset-0 overflow-hidden" style={{ background: "#0f0a1e" }}>
        {/* Speed lines */}
        {phase === "spinning" && Array.from({ length: 12 }).map((_, i) => (
          <motion.div key={i}
            className="absolute h-px"
            style={{
              top: `${(i / 12) * 100}%`,
              left: 0, right: 0,
              background: `linear-gradient(90deg, transparent, ${theme_accent}55, transparent)`,
            }}
            animate={{ scaleX: [0.3, 1.5, 0.3], opacity: [0, 0.8, 0] }}
            transition={{ repeat: Infinity, duration: 0.3 + i * 0.04, ease: "linear" }}
          />
        ))}
        {/* Particle sparkles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%`, backgroundColor: theme_accent }}
            animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], y: [0, -20, -40] }}
            transition={{ repeat: Infinity, duration: 1.5 + i * 0.2, delay: i * 0.3 }}
          />
        ))}
        {/* Gradient orb */}
        <div className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(ellipse 70% 50% at 50% 30%, ${theme_primary}44, transparent)` }}/>
      </div>

      <WidgetFullscreenToggle is_fullscreen={is_fullscreen} on_toggle={toggle_fullscreen}
        theme_primary={theme_primary!} is_mobile={is_mobile} is_ios={is_ios}/>
      {showConfetti && <WidgetConfetti text={text4} colors={[theme_primary!, theme_accent!, "#f59e0b"]}
        duration={5} on_animation_end={() => setShowConfetti(false)}/>}
      {is_completed && <WidgetSuccessOverlay theme_primary={theme_primary!} theme_secondary={theme_secondary!}
        customer={lead_data} message={text11 || ""}/>}
      {(select_promo_error || is_rate_limited) && <WidgetErrorOverlay
        error_type={is_rate_limited ? "RESERVED" : "GENERIC"} original_url={original_url}
        theme_primary={theme_primary!} theme_secondary={theme_secondary!} content_language={content_language}/>}

      <WidgetLayoutContent theme_primary={theme_primary!} theme_secondary={theme_secondary!}
        theme_accent={theme_accent} theme_line_height={theme_line_height}
        content_expired={content_expired} widget_visitor_index={visitor_index ?? 0}>
        <div className="relative w-full h-full flex flex-col items-center px-4 pt-6 pb-4 gap-4">
          <WidgetHeadings title={text1} sub_title={text2}
            theme_primary={theme_primary!} theme_line_height={parseFloat(theme_line_height!)}/>

          {/* Rarity legend */}
          <div className="flex gap-3">
            {(Object.entries(RARITY_COLORS) as [Rarity, string][]).map(([r, c]) => (
              <div key={r} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}` }}/>
                <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: c }}>{r[0]}</span>
              </div>
            ))}
          </div>

          {/* Reel window */}
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="relative w-full overflow-hidden"
              style={{ height: ITEM_H * 3, border: `2px solid ${theme_primary}44` }}>
              {/* Center highlight */}
              <div className="absolute inset-x-0 z-10 pointer-events-none"
                style={{
                  top: ITEM_H, height: ITEM_H,
                  background: `linear-gradient(180deg, ${theme_primary}22, ${theme_primary}44, ${theme_primary}22)`,
                  borderTop: `2px solid ${theme_accent}`,
                  borderBottom: `2px solid ${theme_accent}`,
                  boxShadow: `inset 0 0 20px ${theme_primary}33`,
                }}/>
              {/* Top/bottom fade */}
              <div className="absolute inset-x-0 top-0 h-16 z-10 pointer-events-none"
                style={{ background: "linear-gradient(180deg, #0f0a1e, transparent)" }}/>
              <div className="absolute inset-x-0 bottom-0 h-16 z-10 pointer-events-none"
                style={{ background: "linear-gradient(0deg, #0f0a1e, transparent)" }}/>

              {/* Items */}
              {visibleItems.map(({ item, visualOffset }, i) => (
                <div key={i}
                  className="absolute inset-x-0 flex items-center gap-3 px-4"
                  style={{ top: i * ITEM_H - visualOffset, height: ITEM_H }}>
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: RARITY_COLORS[item.rarity] }}>
                      {item.rarity}
                    </p>
                    <p className="text-sm font-bold text-white/80">{item.label}</p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: RARITY_COLORS[item.rarity], boxShadow: `0 0 8px ${RARITY_COLORS[item.rarity]}` }}/>
                </div>
              ))}
            </div>
          </div>

          {/* Button */}
          <div className="w-full">
            {phase === "idle" && !is_completed ? (
              <motion.button onClick={startSpin} whileTap={{ scale: 0.95 }}
                disabled={select_promo_loading || is_interaction_disabled}
                className="w-full py-5 font-black text-xl italic uppercase tracking-tighter text-white border-2 disabled:opacity-50"
                style={{ backgroundColor: theme_primary, borderColor: theme_accent, boxShadow: `0 0 30px ${theme_primary}55` }}>
                {select_promo_loading ? "..." : text3}
              </motion.button>
            ) : phase === "spinning" ? (
              <motion.button onClick={handleStop} whileTap={{ scale: 0.95 }}
                className="w-full py-5 font-black text-2xl italic uppercase tracking-tighter text-black animate-pulse"
                style={{ backgroundColor: theme_accent, boxShadow: `0 0 40px ${theme_accent}88` }}>
                ⚡ STOP!
              </motion.button>
            ) : (
              <button onClick={() => { setPhase("idle"); setLandedItem(null); }}
                className="w-full py-4 font-black uppercase tracking-widest border text-white/50 border-white/10 text-sm">
                OPEN ANOTHER
              </button>
            )}
          </div>

          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/20 text-center">{text5}</p>
        </div>
      </WidgetLayoutContent>

      {/* Result popup */}
      <AnimatePresence>
        {showResult && landedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/88 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.7, rotate: -6 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="w-full max-w-sm border-2 p-8 flex flex-col items-center gap-4"
              style={{
                backgroundColor: "#0f0a1e",
                borderColor: RARITY_COLORS[landedItem.rarity],
                boxShadow: `0 0 60px ${RARITY_COLORS[landedItem.rarity]}44`,
              }}>
              <motion.div className="text-6xl" animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}>
                {landedItem.icon}
              </motion.div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: RARITY_COLORS[landedItem.rarity] }}>
                  {landedItem.rarity} ITEM
                </p>
                <h2 className="text-2xl font-black italic uppercase" style={{ color: RARITY_COLORS[landedItem.rarity] }}>
                  {landedItem.label}
                </h2>
              </div>
              {won ? (
                <div className="w-full space-y-3 pt-2">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder={text8} className="w-full bg-white/5 border border-white/10 px-4 py-3 font-mono text-sm text-white outline-none"/>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1"/>
                    <p className="text-[10px] text-white/30 uppercase">{terms_text} {terms_link && <a href={terms_link} target="_blank" className="underline">[READ]</a>}</p>
                  </div>
                  <button onClick={() => handle_pre_game_submit(email, termsAccepted)}
                    className="w-full py-4 font-black italic uppercase text-black"
                    style={{ backgroundColor: RARITY_COLORS[landedItem.rarity] }}>
                    {text10}
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-2 pt-2">
                  <p className="text-xs text-white/30 text-center">Need EPIC or LEGENDARY to win</p>
                  <button onClick={() => { setShowResult(false); setPhase("idle"); }}
                    className="w-full py-4 font-black uppercase border text-white/50 border-white/20">
                    TRY AGAIN
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </WidgetBaseContainer>
  );
};

export default AnimeMysteryCase;
