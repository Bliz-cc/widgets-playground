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

// Goal has 3 zones: 0=left, 1=center, 2=right
const ZONES = ["left", "center", "right"] as const;
type Zone = (typeof ZONES)[number];

// SVG Football Goal + Goalkeeper
const FootballGoal: FC<{
  color: string;
  accent: string;
  keeperZone: Zone | null;
  shotZone: Zone | null;
  isGoal: boolean | null;
}> = ({ color, accent, keeperZone, shotZone, isGoal }) => {
  const keeperX = keeperZone === "left" ? 20 : keeperZone === "right" ? 120 : 70;

  return (
    <svg viewBox="0 0 180 130" className="w-full" style={{ maxHeight: 200 }}>
      <defs>
        <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#052e16" />
        </linearGradient>
      </defs>

      {/* Pitch */}
      <rect x="0" y="80" width="180" height="50" fill="url(#pitchGrad)"/>
      <rect x="0" y="78" width="180" height="4" fill="#166534" opacity="0.6"/>

      {/* Penalty arc / D */}
      <ellipse cx="90" cy="80" rx="40" ry="15" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.3"/>

      {/* Penalty spot */}
      <circle cx="90" cy="80" r="2" fill="#ffffff" opacity="0.5"/>

      {/* Goal frame */}
      <rect x="30" y="20" width="120" height="65" fill="none" stroke={accent} strokeWidth="3"/>
      {/* Goal net lines */}
      {[0,1,2,3,4].map(i => (
        <line key={`v${i}`} x1={30 + i * 30} y1="20" x2={30 + i * 30} y2="85" stroke="#ffffff" strokeWidth="0.5" opacity="0.15"/>
      ))}
      {[0,1,2,3,4].map(i => (
        <line key={`h${i}`} x1="30" y1={20 + i * 13} x2="150" y2={20 + i * 13} stroke="#ffffff" strokeWidth="0.5" opacity="0.15"/>
      ))}
      {/* Goal posts glow */}
      <rect x="29" y="19" width="4" height="67" fill={accent} opacity="0.8" rx="1"/>
      <rect x="147" y="19" width="4" height="67" fill={accent} opacity="0.8" rx="1"/>
      <rect x="29" y="19" width="122" height="4" fill={accent} opacity="0.8" rx="1"/>

      {/* Zone dividers (subtle) */}
      <line x1="90" y1="20" x2="90" y2="85" stroke="#ffffff" strokeWidth="0.4" strokeDasharray="3 3" opacity="0.2"/>
      <line x1="70" y1="20" x2="70" y2="85" stroke="#ffffff" strokeWidth="0.4" strokeDasharray="3 3" opacity="0.15"/>
      <line x1="110" y1="20" x2="110" y2="85" stroke="#ffffff" strokeWidth="0.4" strokeDasharray="3 3" opacity="0.15"/>

      {/* Goalkeeper */}
      <motion.g
        animate={keeperZone ? { x: keeperX - 70 } : { x: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Body */}
        <rect x="62" y="45" width="16" height="28" fill={color} rx="3"/>
        {/* Head */}
        <circle cx="70" cy="36" r="10" fill={color}/>
        {/* Gloves arms spread */}
        <rect x="42" y="46" width="20" height="8" fill={color} rx="3"/>
        <rect x="78" y="46" width="20" height="8" fill={color} rx="3"/>
        <circle cx="42" cy="50" r="6" fill="#f59e0b"/>
        <circle cx="98" cy="50" r="6" fill="#f59e0b"/>
        {/* Legs */}
        <rect x="63" y="73" width="7" height="14" fill={color} rx="2"/>
        <rect x="70" y="73" width="7" height="14" fill={color} rx="2"/>
      </motion.g>

      {/* Ball trajectory */}
      {shotZone && (
        <motion.circle
          cx={shotZone === "left" ? 50 : shotZone === "right" ? 130 : 90}
          cy={isGoal ? 52 : 45}
          r="7"
          fill="#f1f5f9"
          stroke="#94a3b8"
          strokeWidth="1"
          initial={{ cx: 90, cy: 95, r: 4, opacity: 0 }}
          animate={{ cy: isGoal ? 52 : 45, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}

      {/* GOAL / SAVED overlay text */}
      {isGoal !== null && (
        <motion.text
          x="90" y="115"
          textAnchor="middle"
          fontSize="18"
          fontWeight="900"
          fontStyle="italic"
          fill={isGoal ? "#22c55e" : "#ef4444"}
          initial={{ opacity: 0, y: 110 }}
          animate={{ opacity: 1, y: 115 }}
          transition={{ duration: 0.3 }}
        >
          {isGoal ? "GOAL!" : "SAVED!"}
        </motion.text>
      )}
    </svg>
  );
};

// Zone selector component
const ZoneSelector: FC<{ selected: Zone | null; onSelect: (z: Zone) => void; color: string; accent: string }> = ({
  selected, onSelect, color, accent
}) => (
  <div className="flex gap-2 w-full">
    {ZONES.map(z => (
      <button
        key={z}
        onClick={() => onSelect(z)}
        className="flex-1 py-3 font-black uppercase tracking-widest text-xs border-2 transition-all"
        style={{
          borderColor: selected === z ? accent : "#ffffff22",
          backgroundColor: selected === z ? `${color}cc` : "transparent",
          color: selected === z ? "#ffffff" : "#ffffff44",
          boxShadow: selected === z ? `0 0 15px ${color}66` : "none",
        }}
      >
        {z}
      </button>
    ))}
  </div>
);

const FootballPenalty: FC<WidgetView> = ({
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
  const { is_completed, lead_data, handle_pre_game_submit } = useGameSession({
    widget_id, promos, selected_index,
    on_close_cleanup: is_fullscreen ? toggle_fullscreen : undefined,
  });
  const { play } = useAudio(useMemo(() => ({
    win: { src: "/ui/win.mp3", volume: 0.5, loop: false },
    lose: { src: "/ui/lose.mp3", volume: 0.4, loop: false },
  }), []));

  const [phase, setPhase] = useState<"idle" | "aim" | "result">("idle");
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [keeperZone, setKeeperZone] = useState<Zone | null>(null);
  const [isGoal, setIsGoal] = useState<boolean | null>(null);
  const [won, setWon] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  usePreviewStateOverride({
    preview_mode, preview_state_override,
    on_start_state: () => setPhase("idle"),
    on_game_state: () => startGame(),
    on_win_state: () => { setWon(true); setShowResult(true); },
    on_lose_state: () => { setWon(false); setShowResult(true); },
  });

  const startGame = useCallback(() => {
    if (is_interaction_disabled || is_completed || content_expired) return;
    setPhase("aim");
    setSelectedZone(null);
    setKeeperZone(null);
    setIsGoal(null);
    send_interaction_event(widget_id, selected_index ?? 0, promos);
  }, [is_interaction_disabled, is_completed, content_expired, selected_index, promos]);

  const handleShoot = useCallback(() => {
    if (!selectedZone || phase !== "aim") return;

    const keeper = ZONES[Math.floor(Math.random() * 3)] as Zone;
    setKeeperZone(keeper);

    const goal = keeper !== selectedZone;
    setIsGoal(goal);
    setPhase("result");

    if (goal) {
      play("win");
      setWon(true);
      setShowConfetti(true);
      setTimeout(() => setShowResult(true), 1500);
    } else {
      play("lose");
      setWon(false);
      setTimeout(() => setShowResult(true), 1200);
    }
  }, [selectedZone, phase]);

  return (
    <WidgetBaseContainer ref={element_ref} is_fullscreen={is_fullscreen}>
      {/* Stadium background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a1628 0%, #052e16 60%, #14532d 100%)" }}>
        {/* Crowd blur backdrop */}
        <div className="absolute inset-x-0 top-0 h-24 opacity-20"
          style={{ background: `repeating-linear-gradient(90deg, ${theme_primary}33 0px, transparent 4px, transparent 12px)` }}/>
        {/* Floodlights */}
        <div className="absolute top-2 left-4 w-16 h-24 opacity-15"
          style={{ background: `radial-gradient(ellipse, #ffffff 0%, transparent 70%)` }}/>
        <div className="absolute top-2 right-4 w-16 h-24 opacity-15"
          style={{ background: `radial-gradient(ellipse, #ffffff 0%, transparent 70%)` }}/>
      </div>

      <WidgetFullscreenToggle is_fullscreen={is_fullscreen} on_toggle={toggle_fullscreen}
        theme_primary={theme_primary!} is_mobile={is_mobile} is_ios={is_ios}/>
      {showConfetti && <WidgetConfetti text={text4} colors={[theme_primary!, "#ffffff", theme_accent!]}
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

          {/* Goal */}
          <div className="flex-1 w-full flex items-center justify-center px-2">
            <FootballGoal
              color={theme_primary!}
              accent={theme_accent!}
              keeperZone={keeperZone}
              shotZone={phase === "result" ? selectedZone : null}
              isGoal={isGoal}
            />
          </div>

          {/* Controls */}
          <div className="w-full space-y-3">
            {phase === "idle" && !is_completed && (
              <motion.button onClick={startGame} whileTap={{ scale: 0.95 }}
                disabled={select_promo_loading || is_interaction_disabled}
                className="w-full py-5 font-black text-xl italic uppercase tracking-tighter text-white border-2 disabled:opacity-50"
                style={{ backgroundColor: theme_primary, borderColor: theme_accent, boxShadow: `0 0 25px ${theme_primary}55` }}>
                {select_promo_loading ? "..." : text3}
              </motion.button>
            )}

            {phase === "aim" && (
              <>
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest text-center">PICK YOUR SPOT</p>
                <ZoneSelector selected={selectedZone} onSelect={setSelectedZone} color={theme_primary!} accent={theme_accent!}/>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleShoot}
                  disabled={!selectedZone}
                  className="w-full py-5 font-black text-xl italic uppercase tracking-tighter text-white disabled:opacity-30"
                  style={{ backgroundColor: selectedZone ? theme_primary : "#374151", boxShadow: selectedZone ? `0 0 20px ${theme_primary}55` : "none" }}>
                  SHOOT!
                </motion.button>
              </>
            )}

            {phase === "result" && (
              <button onClick={() => { setPhase("idle"); setIsGoal(null); setKeeperZone(null); }}
                className="w-full py-4 font-black uppercase tracking-widest border text-white/50 border-white/10 text-sm">
                TAKE ANOTHER PENALTY
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
            className="absolute inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="w-full bg-[#0a1628] border-t-2 p-6 flex flex-col gap-4"
              style={{ borderColor: won ? "#22c55e" : "#ef4444", boxShadow: `0 -16px 40px ${won ? "#22c55e" : "#ef4444"}22` }}>
              <h2 className="text-3xl font-black italic uppercase text-center" style={{ color: won ? "#22c55e" : "#ef4444" }}>
                {won ? "GOAL! 🥅" : "SAVED! 🧤"}
              </h2>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest text-center">
                {won ? `You shot ${selectedZone}, keeper dove ${keeperZone}` : `Keeper guessed ${keeperZone} — blocked!`}
              </p>
              {won ? (
                <div className="space-y-3">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder={text8} className="w-full bg-white/5 border border-white/10 px-4 py-3 font-mono text-sm text-white outline-none"/>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1"/>
                    <p className="text-[10px] text-white/30 uppercase">{terms_text} {terms_link && <a href={terms_link} target="_blank" className="underline">[READ]</a>}</p>
                  </div>
                  <button onClick={() => handle_pre_game_submit(email, termsAccepted)}
                    className="w-full py-4 font-black italic uppercase text-white"
                    style={{ backgroundColor: "#22c55e" }}>
                    {text10}
                  </button>
                </div>
              ) : (
                <button onClick={() => { setShowResult(false); setPhase("idle"); }}
                  className="w-full py-4 font-black uppercase border text-white/50 border-white/20">
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

export default FootballPenalty;
