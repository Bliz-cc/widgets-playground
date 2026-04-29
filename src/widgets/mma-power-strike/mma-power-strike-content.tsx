/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { type FC, useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
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

// ── POWER METER bar width (0-100) oscillates like a sine wave
const KO_MIN = 65;
const KO_MAX = 88;

// SVG Fighter silhouettes
const FighterLeft: FC<{ color: string; accent: string; isAttacking?: boolean }> = ({ color, accent, isAttacking }) => (
  <svg viewBox="0 0 60 100" className="w-16 h-24">
    {/* Body */}
    <rect x="20" y="35" width="22" height="30" fill={color} rx="4"/>
    {/* Head */}
    <circle cx="31" cy="22" r="12" fill={color}/>
    {/* Helmet/glare */}
    <ellipse cx="27" cy="17" rx="5" ry="4" fill="#ffffff" opacity="0.25"/>
    {/* Shorts stripe */}
    <rect x="20" y="55" width="22" height="3" fill={accent}/>
    {/* Left arm */}
    <motion.rect
      x={isAttacking ? "40" : "10"} y="38" width="8" height="18"
      fill={color} rx="4"
      animate={isAttacking ? { x: [40, 52, 40] } : { x: [10, 8, 10] }}
      transition={{ repeat: Infinity, duration: isAttacking ? 0.3 : 1.5 }}
    />
    {/* Right arm */}
    <rect x="42" y="38" width="8" height="18" fill={color} rx="4"/>
    {/* Glove left */}
    <motion.circle
      cx={isAttacking ? 55 : 17} cy="44" r="7" fill={accent}
      animate={isAttacking ? { cx: [55, 62, 55] } : { cx: [17, 15, 17] }}
      transition={{ repeat: Infinity, duration: isAttacking ? 0.3 : 1.5 }}
    />
    {/* Glove right */}
    <circle cx="54" cy="44" r="7" fill={accent}/>
    {/* Legs */}
    <rect x="21" y="65" width="9" height="25" fill={color} rx="3"/>
    <rect x="30" y="65" width="9" height="25" fill={color} rx="3"/>
    {/* Boots */}
    <rect x="19" y="86" width="12" height="8" fill={accent} rx="2"/>
    <rect x="28" y="86" width="12" height="8" fill={accent} rx="2"/>
  </svg>
);

const FighterRight: FC<{ color: string; isDazed?: boolean }> = ({ color, isDazed }) => (
  <motion.svg
    viewBox="0 0 60 100" className="w-16 h-24"
    animate={isDazed ? { rotate: [0, -15, 10, -5, 0], x: [0, 8, -4, 2, 0] } : {}}
    transition={{ duration: 0.6 }}
  >
    {/* Mirrored fighter */}
    <rect x="18" y="35" width="22" height="30" fill={color} rx="4"/>
    <circle cx="29" cy="22" r="12" fill={color}/>
    <ellipse cx="33" cy="17" rx="5" ry="4" fill="#ffffff" opacity="0.25"/>
    <rect x="18" y="55" width="22" height="3" fill="#ffffff" opacity="0.3"/>
    <rect x="42" y="38" width="8" height="18" fill={color} rx="4"/>
    <rect x="10" y="38" width="8" height="18" fill={color} rx="4"/>
    <circle cx="8" cy="44" r="7" fill="#4b5563"/>
    <circle cx="44" cy="44" r="7" fill="#4b5563"/>
    <rect x="20" y="65" width="9" height="25" fill={color} rx="3"/>
    <rect x="29" y="65" width="9" height="25" fill={color} rx="3"/>
    <rect x="18" y="86" width="12" height="8" fill="#374151" rx="2"/>
    <rect x="27" y="86" width="12" height="8" fill="#374151" rx="2"/>
    {/* Stars if dazed */}
    {isDazed && (
      <>
        <motion.text x="25" y="6" fontSize="8" animate={{ rotate: 360, y: [6, 2, 6] }} transition={{ repeat: Infinity, duration: 0.5 }}>⭐</motion.text>
        <motion.text x="35" y="8" fontSize="6" animate={{ rotate: -360, y: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 0.4 }}>✨</motion.text>
      </>
    )}
  </motion.svg>
);

const MmaPowerStrike: FC<WidgetView> = ({
  widget_id, link_id, theme_primary, theme_secondary, theme_accent, theme_line_height,
  text1, text2, text3, text4, text5, text8, text10, text11, text14,
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
  const { is_completed, lead_data, handle_pre_game_submit, set_is_completed } = useGameSession({
    widget_id, promos, selected_index,
    on_close_cleanup: is_fullscreen ? toggle_fullscreen : undefined,
    auto_skip_delay: 4000,
  });
  const { play } = useAudio(useMemo(() => ({
    win: { src: "/ui/win.mp3", volume: 0.5, loop: false },
    lose: { src: "/ui/lose.mp3", volume: 0.4, loop: false },
  }), []));

  // Game state
  const [phase, setPhase] = useState<"idle" | "playing" | "ko" | "miss">("idle");
  const [power, setPower] = useState(0);        // 0–100 oscillating
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDazed, setIsDazed] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [won, setWon] = useState(false);
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dirRef = useRef(1); // 1 = rising, -1 = falling
  const speedRef = useRef(1.2 + Math.random() * 1.5);

  usePreviewStateOverride({
    preview_mode, preview_state_override,
    on_start_state: () => setPhase("idle"),
    on_game_state: () => startGame(),
    on_win_state: () => { setWon(true); setShowResult(true); },
    on_lose_state: () => { setWon(false); setShowResult(true); },
  });

  const startGame = useCallback(() => {
    if (is_interaction_disabled || is_completed || content_expired) return;
    setPhase("playing");
    setPower(0);
    dirRef.current = 1;
    speedRef.current = 1.2 + Math.random() * 1.5;
    send_interaction_event(widget_id, selected_index ?? 0, promos);

    loopRef.current = setInterval(() => {
      setPower(prev => {
        const next = prev + dirRef.current * speedRef.current;
        if (next >= 100) { dirRef.current = -1; return 100; }
        if (next <= 0) { dirRef.current = 1; return 0; }
        return next;
      });
    }, 30);
  }, [is_interaction_disabled, is_completed, content_expired, selected_index, promos]);

  const handleStrike = useCallback(() => {
    if (phase !== "playing") return;
    if (loopRef.current) clearInterval(loopRef.current);

    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 500);

    if (power >= KO_MIN && power <= KO_MAX) {
      play("win");
      setIsDazed(true);
      setPhase("ko");
      setWon(true);
      setShowConfetti(true);
      setTimeout(() => setShowResult(true), 1200);
    } else {
      play("lose");
      setPhase("miss");
      setWon(false);
      setTimeout(() => setShowResult(true), 800);
    }
  }, [phase, power]);

  useEffect(() => () => { if (loopRef.current) clearInterval(loopRef.current); }, []);

  const inKoZone = power >= KO_MIN && power <= KO_MAX;

  return (
    <WidgetBaseContainer ref={element_ref} is_fullscreen={is_fullscreen}>
      {/* Retro mat background */}
      <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: "#0f0a08" }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${theme_primary}22 0px, transparent 1px, transparent 40px, ${theme_primary}22 41px),
                            repeating-linear-gradient(90deg, ${theme_primary}22 0px, transparent 1px, transparent 40px, ${theme_primary}22 41px)`,
        }}/>
        {/* Spotlight */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${theme_primary}18 0%, transparent 70%)`
        }}/>
        {/* Corner ropes */}
        <div className="absolute top-[30%] left-0 right-0 h-px opacity-30" style={{ backgroundColor: theme_accent }}/>
        <div className="absolute top-[35%] left-0 right-0 h-px opacity-20" style={{ backgroundColor: theme_accent }}/>
        <div className="absolute top-[40%] left-0 right-0 h-px opacity-15" style={{ backgroundColor: theme_accent }}/>
      </div>

      <WidgetFullscreenToggle is_fullscreen={is_fullscreen} on_toggle={toggle_fullscreen}
        theme_primary={theme_primary!} is_mobile={is_mobile} is_ios={is_ios}/>

      {showConfetti && <WidgetConfetti text={text4} colors={[theme_primary!, theme_accent!, "#ffffff"]}
        duration={4} on_animation_end={() => setShowConfetti(false)}/>}
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

          {/* Fighter arena */}
          <div className="flex-1 flex items-end justify-center gap-4 w-full pb-2">
            <motion.div animate={isAttacking ? { x: [0, 14, 0] } : { x: [0, -3, 0] }}
              transition={isAttacking ? { duration: 0.3 } : { repeat: Infinity, duration: 1.5 }}>
              <FighterLeft color={theme_primary!} accent={theme_accent!} isAttacking={isAttacking}/>
            </motion.div>

            {/* VS badge */}
            <div className="text-2xl font-black italic" style={{ color: theme_accent, textShadow: `0 0 20px ${theme_accent}` }}>VS</div>

            <FighterRight color="#374151" isDazed={isDazed}/>
          </div>

          {/* Power meter */}
          {phase === "playing" && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                <span style={{ color: theme_accent }}>POWER</span>
                <span style={{ color: inKoZone ? "#22c55e" : theme_primary }}>
                  {inKoZone ? "⚡ KO ZONE" : `${power.toFixed(0)}%`}
                </span>
              </div>
              <div className="relative w-full h-5 bg-white/5 overflow-hidden flex gap-px">
                {Array.from({ length: 30 }).map((_, i) => {
                  const pct = (i / 30) * 100;
                  const isLit = pct <= power;
                  const isKo = pct >= KO_MIN && pct <= KO_MAX;
                  return (
                    <div key={i} className="flex-1 h-full transition-colors duration-75" style={{
                      backgroundColor: isLit ? (isKo ? "#22c55e" : theme_primary) : "#ffffff08",
                      boxShadow: isLit && isKo ? "0 0 6px #22c55e" : "none",
                    }}/>
                  );
                })}
                {/* KO zone bracket */}
                <div className="absolute top-0 bottom-0 border-x-2 border-green-400/70 pointer-events-none"
                  style={{ left: `${KO_MIN}%`, width: `${KO_MAX - KO_MIN}%`, backgroundColor: "#22c55e0a" }}/>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="w-full">
            {phase === "idle" && !is_completed ? (
              <motion.button onClick={startGame} whileTap={{ scale: 0.95 }}
                disabled={select_promo_loading || is_interaction_disabled}
                className="w-full py-5 font-black text-xl italic uppercase tracking-tighter text-white border-2 disabled:opacity-50"
                style={{ backgroundColor: theme_primary, borderColor: theme_accent, boxShadow: `0 0 30px ${theme_primary}55` }}>
                {select_promo_loading ? "..." : text3}
              </motion.button>
            ) : phase === "playing" ? (
              <motion.button onClick={handleStrike} whileTap={{ scale: 0.92 }}
                className="w-full py-5 font-black text-2xl italic uppercase tracking-tighter text-black transition-colors"
                style={{
                  backgroundColor: inKoZone ? "#22c55e" : theme_primary,
                  boxShadow: inKoZone ? "0 0 40px #22c55e88" : `0 0 20px ${theme_primary}44`,
                  transition: "background-color 0.15s, box-shadow 0.15s",
                }}>
                {inKoZone ? "⚡ STRIKE!" : "STRIKE!"}
              </motion.button>
            ) : (
              <button onClick={() => { setPhase("idle"); setIsDazed(false); }}
                className="w-full py-4 font-black uppercase tracking-widest border text-white/50 border-white/10 text-sm">
                REMATCH
              </button>
            )}
          </div>

          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/20 text-center">{text5}</p>
        </div>
      </WidgetLayoutContent>

      {/* Result popup */}
      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.8, rotate: -3 }} animate={{ scale: 1, rotate: 0 }}
              className="w-full max-w-sm bg-[#0f0a08] border-2 p-8 flex flex-col items-center gap-4"
              style={{ borderColor: won ? theme_accent : "#6b7280", boxShadow: `0 0 40px ${won ? theme_accent : "#6b728044"}` }}>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: won ? theme_accent : "#6b7280" }}>
                {won ? "K.O.!" : "MISS!"}
              </h2>
              <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
                {won ? `Power: ${power.toFixed(0)}% — Perfect Strike` : `Power: ${power.toFixed(0)}% — Missed the KO Zone`}
              </p>
              {won ? (
                <div className="w-full space-y-3 pt-2">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder={text8} className="w-full bg-white/5 border border-white/10 px-4 py-3 font-mono text-sm outline-none text-white placeholder:text-white/20"/>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1"/>
                    <p className="text-[10px] text-white/30 uppercase">{terms_text} {terms_link && <a href={terms_link} target="_blank" className="underline">[READ]</a>}</p>
                  </div>
                  <button onClick={() => handle_pre_game_submit(email, termsAccepted)}
                    className="w-full py-4 font-black italic uppercase text-black"
                    style={{ backgroundColor: theme_accent }}>
                    {text10}
                  </button>
                </div>
              ) : (
                <button onClick={() => { setShowResult(false); setPhase("idle"); }}
                  className="w-full py-4 font-black uppercase tracking-widest border text-white/60 border-white/20">
                  TRY AGAIN
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </WidgetBaseContainer>
  );
};

export default MmaPowerStrike;
