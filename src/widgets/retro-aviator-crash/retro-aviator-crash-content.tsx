/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  type FC,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

// =============================================================
// @blizcc/ui — UI Components & Enums
// =============================================================
import {
  WidgetBaseContainer,
  WidgetLayoutContent,
  WidgetHeadings,
  WidgetFullscreenToggle,
  WidgetConfetti,
  WidgetSuccessOverlay,
  WidgetErrorOverlay,
  CONTENT_LANGUAGE_ENUM,
} from "@blizcc/ui";

// =============================================================
// @blizcc/ui — Hooks
// =============================================================
import {
  useGetVisitorIndex,
  useFullscreen,
  usePromoAutoSelect,
  usePromoSoldOut,
  useGameSession,
  usePreviewStateOverride,
  useAudio,
  useSubmitWidgetEvents,
} from "@blizcc/ui";

// =============================================================
// @blizcc/ui — Standard Interfaces
// =============================================================
import type { WidgetView } from "@blizcc/ui";

// =============================================================
// RETRO HELICOPTER SVG COMPONENT
// =============================================================
const RetroHelicopter: FC<{
  color: string;
  accent: string;
  isCrashed?: boolean;
  isPlaying?: boolean;
}> = ({ color, accent, isCrashed, isPlaying }) => {
  // Derive darker shade for depth
  const dim = `${color}99`;

  return (
    <motion.div
      className="relative w-48 h-28"
      animate={
        isCrashed
          ? {
              rotate: [0, -15, 45, 120, 200],
              y: [0, -10, 60],
              scale: [1, 1.1, 0.3],
              opacity: [1, 1, 0],
            }
          : {}
      }
      transition={isCrashed ? { duration: 1.2, ease: "easeIn" } : {}}
    >
      <svg
        viewBox="0 0 180 90"
        className="w-full h-full"
        style={{ filter: `drop-shadow(0 0 12px ${color}88)` }}
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="cockpitGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.7" />
            <stop offset="60%" stopColor={accent} stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="exhaustGrad" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffff00" stopOpacity="1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── TAIL BOOM ── */}
        <polygon points="105,42 155,40 158,47 105,50" fill={dim} />
        {/* Tail boom ribbing / panels */}
        <line
          x1="115"
          y1="40"
          x2="116"
          y2="50"
          stroke={color}
          strokeWidth="0.8"
          opacity="0.5"
        />
        <line
          x1="125"
          y1="40"
          x2="126"
          y2="50"
          stroke={color}
          strokeWidth="0.8"
          opacity="0.5"
        />
        <line
          x1="135"
          y1="40"
          x2="136"
          y2="49"
          stroke={color}
          strokeWidth="0.8"
          opacity="0.5"
        />
        <line
          x1="145"
          y1="40"
          x2="146"
          y2="48"
          stroke={color}
          strokeWidth="0.8"
          opacity="0.5"
        />

        {/* Vertical fin */}
        <polygon points="155,22 162,40 155,40" fill={color} />
        <polygon points="155,22 162,40 158,40" fill="url(#bodyGrad)" />
        {/* Horizontal stabilizers */}
        <polygon points="152,47 170,45 170,49 152,50" fill={color} />
        <polygon points="152,47 134,45 134,49 152,50" fill={dim} />

        {/* ── TAIL ROTOR (animated) ── */}
        <motion.g
          style={{ transformOrigin: "163px 47px" }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.12, ease: "linear" }}
        >
          <line
            x1="163"
            y1="37"
            x2="163"
            y2="57"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="153"
            y1="47"
            x2="173"
            y2="47"
            stroke={accent}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </motion.g>
        {/* Hub */}
        <circle cx="163" cy="47" r="2.5" fill={accent} />

        {/* ── MAIN FUSELAGE ── */}
        {/* Nose cone */}
        <polygon points="28,36 55,28 55,56 28,52" fill={color} />
        <polygon points="28,36 55,28 55,56 28,52" fill="url(#bodyGrad)" />
        {/* Body slab */}
        <rect x="55" y="26" width="52" height="32" fill={color} rx="2" />
        <rect
          x="55"
          y="26"
          width="52"
          height="32"
          fill="url(#bodyGrad)"
          rx="2"
        />
        {/* Engine nacelle bump on top */}
        <ellipse cx="81" cy="26" rx="22" ry="7" fill={dim} />
        <ellipse cx="81" cy="26" rx="18" ry="5" fill={color} />
        {/* Exhaust vents */}
        <rect x="100" y="20" width="3" height="5" fill="#111" rx="1" />
        <rect x="95" y="20" width="3" height="5" fill="#111" rx="1" />
        <rect x="90" y="20" width="3" height="5" fill="#111" rx="1" />

        {/* ── COCKPIT ── */}
        <ellipse
          cx="48"
          cy="42"
          rx="18"
          ry="14"
          fill="url(#cockpitGrad)"
          stroke={accent}
          strokeWidth="1.2"
        />
        {/* Cockpit frame / cross */}
        <line
          x1="48"
          y1="28"
          x2="48"
          y2="56"
          stroke={accent}
          strokeWidth="0.8"
          opacity="0.5"
        />
        <line
          x1="30"
          y1="42"
          x2="66"
          y2="42"
          stroke={accent}
          strokeWidth="0.8"
          opacity="0.5"
        />
        {/* Cockpit glare */}
        <ellipse
          cx="42"
          cy="35"
          rx="7"
          ry="5"
          fill="#ffffff"
          opacity="0.18"
          transform="rotate(-15, 42, 35)"
        />

        {/* Fuselage detail stripes */}
        <rect
          x="68"
          y="27"
          width="1.5"
          height="30"
          fill={accent}
          opacity="0.4"
        />
        <rect
          x="75"
          y="27"
          width="1.5"
          height="30"
          fill={accent}
          opacity="0.25"
        />

        {/* ── LANDING GEAR ── */}
        {/* Left strut */}
        <line
          x1="65"
          y1="58"
          x2="58"
          y2="72"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="90"
          y1="58"
          x2="97"
          y2="72"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Cross-brace */}
        <line
          x1="63"
          y1="65"
          x2="92"
          y2="65"
          stroke={accent}
          strokeWidth="1.2"
          opacity="0.5"
        />
        {/* Skids */}
        <rect x="48" y="71" width="60" height="4" fill={color} rx="2" />
        <rect
          x="48"
          y="71"
          width="60"
          height="4"
          fill="url(#bodyGrad)"
          rx="2"
        />

        {/* ── MAIN ROTOR MAST ── */}
        <rect x="79" y="19" width="4" height="8" fill="#222" />
        <circle cx="81" cy="19" r="4" fill={accent} />

        {/* ── MAIN ROTOR (4 blades, animated) ── */}
        <motion.g
          style={{ transformOrigin: "81px 19px" }}
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: isPlaying ? 0.18 : 0.4,
            ease: "linear",
          }}
        >
          {/* Blade 1 */}
          <ellipse
            cx="114"
            cy="19"
            rx="33"
            ry="4"
            fill={accent}
            opacity="0.9"
          />
          {/* Blade 2 */}
          <ellipse cx="48" cy="19" rx="33" ry="4" fill={dim} opacity="0.9" />
          {/* Blade 3 */}
          <ellipse
            cx="81"
            cy="-14"
            rx="4"
            ry="33"
            fill={accent}
            opacity="0.7"
          />
          {/* Blade 4 */}
          <ellipse cx="81" cy="52" rx="4" ry="33" fill={dim} opacity="0.7" />
        </motion.g>

        {/* ── EXHAUST FLAME (visible when playing) ── */}
        {isPlaying && (
          <motion.ellipse
            cx="28"
            cy="44"
            rx="12"
            ry="5"
            fill="url(#exhaustGrad)"
            animate={{
              rx: [12, 18, 10, 16, 12],
              opacity: [0.9, 1, 0.6, 1, 0.9],
              cx: [28, 22, 26, 20, 28],
            }}
            transition={{ repeat: Infinity, duration: 0.2, ease: "linear" }}
            filter="url(#glow)"
          />
        )}
      </svg>

      {/* Outer plasma trail (CSS layer) */}
      {isPlaying && !isCrashed && (
        <motion.div
          className="absolute"
          style={{
            left: -40,
            top: "38%",
            width: 50,
            height: 18,
            borderRadius: 999,
            background: `radial-gradient(ellipse, ${accent}88 0%, ${color}44 50%, transparent 100%)`,
          }}
          animate={{
            scaleX: [1, 1.8, 0.9, 1.5, 1],
            opacity: [0.8, 1, 0.5, 1, 0.8],
          }}
          transition={{ repeat: Infinity, duration: 0.18 }}
        />
      )}
    </motion.div>
  );
};

interface AviatorWidgetView extends WidgetView {
  text16?: string;
  text18?: string;
}

// =============================================================
// MAIN COMPONENT
// =============================================================
const RetroAviatorCrash: FC<AviatorWidgetView> = ({
  widget_id,
  link_id,
  theme_primary,
  theme_secondary,
  theme_accent,
  theme_line_height,
  text1,
  text2,
  text3,
  text4,
  text5,
  text8,
  text10,
  text11,
  text16,
  text18,
  promos,
  original_url = "",
  content_expired,
  content_language = CONTENT_LANGUAGE_ENUM.ENGLISH,
  terms_link,
  terms_text,
  preview_mode,
  preview_state_override,
}) => {
  // Hooks
  const {
    visitor_index,
    visitor_index_loading,
    is_rate_limited,
    is_interaction_disabled,
  } = useGetVisitorIndex();
  const { element_ref, is_fullscreen, toggle_fullscreen, is_mobile, is_ios } =
    useFullscreen();
  const { selected_index, select_promo_loading, select_promo_error } =
    usePromoAutoSelect({
      widget_id,
      link_id,
      preview_mode,
      content_expired,
      promos_length: promos.length,
      skip_fetch: is_interaction_disabled || visitor_index_loading,
    });
  const { is_sold_out } = usePromoSoldOut(promos);
  const { send_interaction_event } = useSubmitWidgetEvents(preview_mode);

  const {
    is_winning_modal_open,
    is_losing_modal_open,
    is_completed,
    lead_data,
    trigger_game_result,
    handle_post_game_submit,
    set_is_winning_modal_open,
    set_is_losing_modal_open,
  } = useGameSession({
    widget_id,
    promos,
    selected_index,
    on_close_cleanup: is_fullscreen ? toggle_fullscreen : undefined,
    auto_skip_delay: 4000,
  });

  const { play, stop } = useAudio(
    useMemo(
      () => ({
        win: { src: "/ui/win.mp3", volume: 0.4, loop: false },
        lose: { src: "/ui/lose.mp3", volume: 0.3, loop: false },
        playing: { src: "/ui/playing.mp3", volume: 0.5, loop: true },
        crash: { src: "/ui/lose.mp3", volume: 0.6, loop: false },
      }),
      [],
    ),
  );

  // Game State
  const [email, set_email] = useState("");
  const [terms_accepted, set_terms_accepted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [gameState, setGameState] = useState<
    "idle" | "playing" | "ejected" | "crashed" | "too_cold"
  >("idle");
  const [temperature, setTemperature] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Heat rate varies each game: 0.4–1.4 units per tick (50ms) → full heat in ~4–14 sec
  const heatRateRef = useRef(0.4 + Math.random() * 1.0);
  // Pulse rate adds random micro-variance to feel organic
  const tickRef = useRef(0);

  // Optimal eject zone: 55–80 degrees
  const OPTIMAL_MIN = 55;
  const OPTIMAL_MAX = 80;

  usePreviewStateOverride({
    preview_mode,
    preview_state_override,
    on_start_state: () => setGameState("idle"),
    on_game_state: () => setGameState("playing"),
    on_win_state: () => set_is_winning_modal_open(true),
    on_lose_state: () => set_is_losing_modal_open(true),
  });

  const executeGame = useCallback(() => {
    if (is_interaction_disabled || is_completed || content_expired) return;

    setGameState("playing");
    setTemperature(0);
    tickRef.current = 0;
    // Randomise heat rate each session so players can't memorise timing
    heatRateRef.current = 0.4 + Math.random() * 1.0;
    play("playing");
    send_interaction_event(widget_id, selected_index ?? 0, promos);

    gameLoopRef.current = setInterval(() => {
      tickRef.current += 1;
      // Add organic micro-variance every ~10 ticks
      const jitter = tickRef.current % 10 === 0 ? (Math.random() - 0.5) * 0.3 : 0;
      setTemperature((prev) => {
        const next = Math.min(100, prev + heatRateRef.current + jitter);
        if (next >= 100) {
          handleCrash();
          return 100;
        }
        return next;
      });
    }, 50);
  }, [
    is_interaction_disabled,
    is_completed,
    content_expired,
    selected_index,
    promos,
  ]);

  const startGame = useCallback(() => {
    if (is_interaction_disabled || is_completed || content_expired) return;
    setShowRules(true);
  }, [is_interaction_disabled, is_completed, content_expired]);

  const handleEject = useCallback(() => {
    if (gameState !== "playing") return;
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    stop("playing");

    const t = temperature;

    if (t >= OPTIMAL_MIN && t <= OPTIMAL_MAX) {
      // ✅ OPTIMAL ZONE — win
      play("win");
      setGameState("ejected");
      setShowConfetti(true);
      setTimeout(() => set_is_winning_modal_open(true), 1500);
    } else {
      // ❌ Too cold or in danger zone without crashing — still a loss
      play("crash");
      setGameState("too_cold");
      setTimeout(() => set_is_losing_modal_open(true), 1200);
    }
  }, [gameState, temperature]);

  const handleCrash = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    stop("playing");
    play("crash");
    setGameState("crashed");

    setTimeout(() => {
      set_is_losing_modal_open(true);
    }, 1500);
  }, []);

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  return (
    <WidgetBaseContainer ref={element_ref} is_fullscreen={is_fullscreen}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#000814] to-[#001d3d] overflow-hidden">
        {/* Background Grid / Stars */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Moving Clouds/Dust */}
        <AnimatePresence>
          {gameState === "playing" &&
            [0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute bg-white/5 rounded-full blur-2xl"
                style={{
                  width: 200,
                  height: 100,
                  left: "110%",
                  top: `${20 + i * 30}%`,
                }}
                animate={{ x: "-200vw" }}
                transition={{
                  repeat: Infinity,
                  duration: 2 + i,
                  ease: "linear",
                }}
              />
            ))}
        </AnimatePresence>
      </div>

      <WidgetFullscreenToggle
        is_fullscreen={is_fullscreen}
        on_toggle={toggle_fullscreen}
        theme_primary={theme_primary!}
        is_mobile={is_mobile}
        is_ios={is_ios}
      />

      {showConfetti && (
        <WidgetConfetti
          text={text4}
          colors={[theme_primary!, theme_secondary!, theme_accent!]}
          duration={5}
          on_animation_end={() => setShowConfetti(false)}
        />
      )}

      {is_completed && (
        <WidgetSuccessOverlay
          theme_primary={theme_primary!}
          theme_secondary={theme_secondary!}
          customer={lead_data}
          message={text11 || ""}
        />
      )}

      {(select_promo_error || is_rate_limited) && (
        <WidgetErrorOverlay
          error_type={is_rate_limited ? "RESERVED" : "GENERIC"}
          original_url={original_url}
          theme_primary={theme_primary!}
          theme_secondary={theme_secondary!}
          content_language={content_language}
        />
      )}

      <WidgetLayoutContent
        theme_primary={theme_primary!}
        theme_secondary={theme_secondary!}
        theme_accent={theme_accent}
        theme_line_height={theme_line_height}
        content_expired={content_expired}
        widget_visitor_index={visitor_index ?? 0}
      >
        <div className="relative w-full h-full flex flex-col items-center pt-8 px-6">
          <WidgetHeadings
            title={text1}
            sub_title={text2}
            theme_primary={theme_primary!}
            theme_line_height={parseFloat(theme_line_height!)}
          />

          <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
          {/* Temperature Gauge */}
          {(gameState === "playing" || gameState === "ejected" || gameState === "crashed" || gameState === "too_cold") && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 right-4 flex flex-col gap-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black tracking-[0.25em] text-white/40 uppercase">ENGINE TEMP</span>
                <span className="text-[9px] font-mono font-bold" style={{
                  color: temperature < OPTIMAL_MIN ? theme_accent
                    : temperature <= OPTIMAL_MAX ? "#22c55e"
                    : "#ef4444"
                }}>
                  {temperature < OPTIMAL_MIN ? "TOO COLD"
                    : temperature <= OPTIMAL_MAX ? "OPTIMAL ZONE"
                    : "DANGER"}
                </span>
              </div>

              {/* Segmented Bar */}
              <div className="relative w-full h-4 bg-white/5 overflow-hidden flex gap-px">
                {Array.from({ length: 40 }).map((_, i) => {
                  const segPct = (i / 40) * 100;
                  const isLit = segPct <= temperature;
                  const inOptimal = segPct >= OPTIMAL_MIN && segPct <= OPTIMAL_MAX;
                  const inDanger  = segPct > OPTIMAL_MAX;
                  return (
                    <motion.div
                      key={i}
                      className="flex-1 h-full"
                      animate={isLit ? { opacity: [1, 0.7, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 0.3, delay: i * 0.01 }}
                      style={{
                        backgroundColor: isLit
                          ? inOptimal ? "#22c55e"
                            : inDanger ? "#ef4444"
                            : theme_accent
                          : "transparent",
                        border: `1px solid ${isLit
                          ? inOptimal ? "#16a34a"
                            : inDanger ? "#dc2626"
                            : `${theme_accent}88`
                          : "#ffffff11"}`,
                      }}
                    />
                  );
                })}

                {/* Optimal zone bracket overlay */}
                <div
                  className="absolute top-0 bottom-0 border-x-2 border-green-400/60 pointer-events-none"
                  style={{
                    left: `${OPTIMAL_MIN}%`,
                    width: `${OPTIMAL_MAX - OPTIMAL_MIN}%`,
                    backgroundColor: "#22c55e08",
                  }}
                />
              </div>

              {/* Zone Labels */}
              <div className="relative w-full h-3">
                <span className="absolute text-[7px] font-mono text-white/20 uppercase" style={{ left: "0%" }}>COLD</span>
                <span className="absolute text-[7px] font-mono text-green-400/60 uppercase -translate-x-1/2" style={{ left: `${(OPTIMAL_MIN + OPTIMAL_MAX) / 2}%` }}>EJECT ZONE</span>
                <span className="absolute text-[7px] font-mono text-red-400/60 uppercase -translate-x-full" style={{ left: "100%" }}>OVERHEAT</span>
              </div>
            </motion.div>
          )}

            <motion.div
              animate={
                gameState === "playing"
                  ? {
                      y: [0, -(temperature / 20), (temperature / 40), -(temperature / 30), 0],
                      rotate: [0, -(temperature / 50), (temperature / 50), 0],
                    }
                  : gameState === "ejected"
                    ? { x: "200%", y: "-100%", rotate: -20 }
                    : {}
              }
              transition={
                gameState === "playing"
                  ? { repeat: Infinity, duration: Math.max(0.4, 2 - temperature / 80) }
                  : { duration: 1 }
              }
              className="z-10 mt-16"
            >
              {(gameState === "playing" ||
                gameState === "idle" ||
                gameState === "crashed" ||
                gameState === "too_cold") && (
                <RetroHelicopter
                  color={theme_primary!}
                  accent={theme_accent!}
                  isCrashed={gameState === "crashed"}
                  isPlaying={gameState === "playing"}
                />
              )}
            </motion.div>

            {/* Eject Animation */}
            <AnimatePresence>
              {gameState === "ejected" && (
                <motion.div
                  initial={{ y: 0, opacity: 1, scale: 1 }}
                  animate={{ y: -400, x: -100, rotate: 360 }}
                  className="absolute z-20"
                >
                  <div className="w-8 h-12 bg-white/90 rounded-t-full shadow-[0_0_20px_#fff]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full pb-10 flex flex-col items-center gap-6">
            <AnimatePresence mode="wait">
              {gameState === "playing" ? (
                <motion.button
                  key="eject"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEject}
                  className="w-full py-6 rounded-3xl font-black text-2xl italic tracking-tighter text-white"
                  style={{
                    backgroundColor:
                      temperature >= OPTIMAL_MIN && temperature <= OPTIMAL_MAX
                        ? "#16a34a"  // Green in optimal zone
                        : temperature > OPTIMAL_MAX
                        ? `#ef4444`  // Red in danger
                        : theme_primary,  // Default
                    boxShadow:
                      temperature >= OPTIMAL_MIN && temperature <= OPTIMAL_MAX
                        ? "0 0 30px #16a34a66"
                        : temperature > OPTIMAL_MAX
                        ? "0 0 30px #ef444466"
                        : `0 0 20px ${theme_primary}44`,
                    transition: "background-color 0.3s, box-shadow 0.3s",
                  }}
                >
                  {temperature >= OPTIMAL_MIN && temperature <= OPTIMAL_MAX
                    ? "⚡ EJECT NOW!"
                    : temperature > OPTIMAL_MAX
                    ? "🔥 EJECT NOW!"
                    : "EJECT NOW!"}
                </motion.button>
              ) : gameState === "idle" && !is_completed ? (
                <motion.div
                  key="start"
                  className="w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    onClick={startGame}
                    disabled={select_promo_loading || is_interaction_disabled}
                    className="w-full py-6 rounded-3xl font-black text-2xl italic tracking-tighter text-white shadow-xl transition-all active:scale-95 disabled:opacity-50"
                    style={{
                      backgroundColor: theme_primary,
                      boxShadow: `0 0 40px ${theme_primary}66`,
                      border: `2px solid ${theme_accent}`,
                    }}
                  >
                    {select_promo_loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full mx-auto"
                      />
                    ) : (
                      text3
                    )}
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <p className="text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase text-center">
              {gameState === "playing" ? text16 : text5}
            </p>
          </div>
        </div>
      </WidgetLayoutContent>

      {/* Rules Popup */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-end justify-center bg-[#000814]/85 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full bg-[#000d1a] border-t-2 p-6 flex flex-col gap-5"
              style={{
                borderColor: theme_accent,
                boxShadow: `0 -20px 60px ${theme_accent}22`,
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-8"
                  style={{ backgroundColor: theme_accent }}
                />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">
                    CLASSIFIED
                  </p>
                  <h3
                    className="text-xl font-black italic uppercase tracking-tighter"
                    style={{ color: theme_accent }}
                  >
                    PRE-FLIGHT BRIEFING
                  </h3>
                </div>
              </div>

              {/* Rules */}
              <div className="space-y-3">
                {[
                  {
                    icon: "01",
                    label: "WARM THE ENGINES",
                    desc: "Temperature rises every second. Watch the bar above.",
                  },
                  {
                    icon: "02",
                    label: "EJECT ZONE: 55–80°",
                    desc: "Hit EJECT when the bar is in the GREEN zone to win",
                  },
                  {
                    icon: "03",
                    label: "TOO COLD = FAIL",
                    desc: "Eject below 55° and the engines stall — no reward",
                  },
                  {
                    icon: "04",
                    label: "OVERHEAT = CRASH",
                    desc: "Wait past 100° and the system burns out completely",
                  },
                ].map((rule) => (
                  <div key={rule.icon} className="flex items-start gap-3">
                    <span
                      className="text-[10px] font-black italic tabular-nums mt-0.5 shrink-0"
                      style={{ color: theme_primary }}
                    >
                      {rule.icon}
                    </span>
                    <div>
                      <p
                        className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: theme_accent }}
                      >
                        {rule.label}
                      </p>
                      <p className="text-[10px] font-mono text-white/40 leading-snug">
                        {rule.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowRules(false)}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-white/40 border border-white/10 active:scale-95 transition-transform"
                >
                  ABORT
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setShowRules(false);
                    executeGame();
                  }}
                  className="flex-[2] py-3 text-sm font-black italic uppercase tracking-tighter text-black"
                  style={{ backgroundColor: theme_accent }}
                >
                  CONFIRM MISSION ▶
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Win/Lose Popups */}
      <AnimatePresence>
        {(is_winning_modal_open || is_losing_modal_open) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-[#000814]/90 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm bg-black border-2 p-8 flex flex-col items-center"
              style={{
                borderColor: is_winning_modal_open
                  ? theme_accent
                  : theme_primary,
                boxShadow: `0 0 40px ${is_winning_modal_open ? theme_accent : theme_primary}33`,
              }}
            >
              <h2
                className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-center"
                style={{
                  color: is_winning_modal_open ? "#22c55e" : theme_primary,
                }}
              >
                {is_winning_modal_open ? "OPTIMAL EJECT!" : "MISSION FAILED"}
              </h2>
              <p className="text-xs font-mono text-white/60 mb-8 text-center uppercase tracking-widest">
                {is_winning_modal_open
                  ? `TEMPERATURE LOCKED: ${temperature.toFixed(0)}° — PERFECT EJECT`
                  : temperature >= 100
                    ? `OVERHEAT AT ${temperature.toFixed(0)}° — ENGINE DESTROYED`
                    : `EJECTED AT ${temperature.toFixed(0)}° — ENGINE TOO COLD`}
              </p>

              {is_winning_modal_open ? (
                <div className="w-full space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {text8}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => set_email(e.target.value)}
                      placeholder="ENTER EMAIL"
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 font-mono text-sm outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      checked={terms_accepted}
                      onChange={(e) => set_terms_accepted(e.target.checked)}
                      className="mt-1"
                    />
                    <p className="text-[10px] leading-tight text-white/40 uppercase">
                      {terms_text}{" "}
                      {terms_link && (
                        <a
                          href={terms_link}
                          target="_blank"
                          className="underline"
                        >
                          [READ]
                        </a>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handle_post_game_submit(email, terms_accepted)
                    }
                    className="w-full py-4 font-black italic uppercase tracking-tighter text-black mt-4 active:scale-95 transition-transform"
                    style={{ backgroundColor: theme_accent }}
                  >
                    {text10}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    set_is_losing_modal_open(false);
                    setGameState("idle");
                  }}
                  className="w-full py-4 font-black italic uppercase tracking-tighter text-white mt-4 border-2 active:scale-95 transition-transform"
                  style={{ borderColor: theme_primary }}
                >
                  RETRY MISSION
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </WidgetBaseContainer>
  );
};

export default RetroAviatorCrash;
