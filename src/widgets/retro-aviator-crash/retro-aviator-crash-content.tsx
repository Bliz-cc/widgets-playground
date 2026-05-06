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
// @blizcc/ui — Standard Interfaces
// =============================================================
import {
  type DynamicWidgetView,
  WidgetHeadings,
  WidgetLayoutContent,
} from "@blizcc/ui";

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

// =============================================================
// MAIN COMPONENT
// =============================================================
export const RetroAviatorContent: FC<DynamicWidgetView> = (props) => {
  const {
    theme_primary,
    theme_accent,
    theme_secondary,
    theme_line_height,
    text1,
    text2,
    text3,
    text5,
    text16,
    text18,
    widget_visitor_index,
    is_rules_accepted,
    show_winning_popup,
    show_losing_popup,
    show_rules_popup,
    play_audio,
    stop_audio,
    preview_state_override,
    fetch_promo_idx,
  } = props;

  // Game State
  const [gameState, setGameState] = useState<
    "idle" | "playing" | "ejected" | "crashed" | "missed"
  >("idle");
  const [altitude, setAltitude] = useState(1);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedRef = useRef(0);

  // Target altitude from marketer prop (text16), e.g. "844.84" → 844.84
  const targetAltitude = useMemo(
    () => Math.max(10, parseFloat(text16 ?? "500") || 500),
    [text16],
  );
  // Win window: ±3% of target, minimum ±5 units
  const tolerance = useMemo(
    () => Math.max(5, targetAltitude * 0.03),
    [targetAltitude],
  );
  const winMin = useMemo(
    () => targetAltitude - tolerance,
    [targetAltitude, tolerance],
  );
  const winMax = useMemo(
    () => targetAltitude + tolerance,
    [targetAltitude, tolerance],
  );
  // Progress toward target (0–1), capped at 1
  const progress = Math.min(1, altitude / (targetAltitude + tolerance));
  const inWinZone = altitude >= winMin && altitude <= winMax;

  useEffect(() => {
    if (preview_state_override) {
      if (
        preview_state_override === "idle" ||
        preview_state_override === "playing"
      ) {
        setGameState(preview_state_override as any);
      }
    }
  }, [preview_state_override]);

  const handleCrash = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    stop_audio("playing");
    play_audio("lose");
    setGameState("crashed");

    setTimeout(() => {
      show_losing_popup();
    }, 1500);
  }, [stop_audio, play_audio, show_losing_popup]);

  const executeGame = useCallback(async () => {
    setGameState("playing");
    setAltitude(1);

    const durationTicks = (6000 + Math.random() * 8000) / 50;
    speedRef.current = targetAltitude / durationTicks;

    play_audio("playing");

    // Fetch result
    await fetch_promo_idx();

    gameLoopRef.current = setInterval(() => {
      setAltitude((prev) => {
        const next = +(prev + speedRef.current).toFixed(2);
        if (next > winMax) {
          handleCrash();
          return next;
        }
        return next;
      });
    }, 50);
  }, [targetAltitude, winMax, play_audio, fetch_promo_idx, handleCrash]);

  const startGame = useCallback(() => {
    if (!is_rules_accepted) {
      show_rules_popup();
      return;
    }
    executeGame();
  }, [is_rules_accepted, executeGame]);

  const handleEject = useCallback(() => {
    if (gameState !== "playing") return;
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    stop_audio("playing");

    if (inWinZone) {
      play_audio("win");
      setGameState("ejected");
      setTimeout(() => show_winning_popup(), 1500);
    } else {
      play_audio("lose");
      setGameState("missed");
      setTimeout(() => show_losing_popup(), 1200);
    }
  }, [
    gameState,
    inWinZone,
    stop_audio,
    play_audio,
    show_winning_popup,
    show_losing_popup,
  ]);

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  //  CASE 1. game starts once rules are accepted from parent component
  useEffect(() => {
    if (is_rules_accepted && gameState === "idle") {
      executeGame();
    }
  }, [is_rules_accepted, gameState, executeGame]);

  return (
    <>
      {/* Game Specific Background covering the whole BaseContainer */}
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

      <WidgetLayoutContent
        theme_primary={theme_primary!}
        theme_secondary={theme_secondary!}
        theme_accent={theme_accent}
        theme_line_height={theme_line_height}
        content_expired={false}
        widget_visitor_index={widget_visitor_index ?? 0}
      >
        <div className="relative w-full h-full flex flex-col items-center pt-8 px-6">
          <WidgetHeadings
            title={text1}
            sub_title={text2}
            theme_primary={theme_primary!}
            theme_line_height={parseFloat(theme_line_height!)}
          />

          <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
            {/* Altitude Display */}
            {gameState !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-2 left-2 right-2 flex flex-col gap-2"
              >
                {/* Live altitude counter + target */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[8px] font-black tracking-[0.25em] text-white/30 uppercase">
                      {text18 ?? "ALTITUDE"}
                    </p>
                    <motion.p
                      className="text-4xl font-black italic tabular-nums leading-none"
                      style={{
                        color: inWinZone
                          ? "#22c55e"
                          : altitude > winMax
                            ? "#ef4444"
                            : theme_accent,
                        textShadow: inWinZone ? "0 0 20px #22c55e" : "none",
                      }}
                      animate={inWinZone ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 0.4 }}
                    >
                      {altitude.toFixed(2)}
                    </motion.p>
                  </div>

                  {/* Target badge */}
                  <div className="text-right">
                    <p className="text-[8px] font-black tracking-[0.25em] text-white/30 uppercase">
                      TARGET
                    </p>
                    <p
                      className="text-xl font-black italic tabular-nums"
                      style={{ color: theme_accent }}
                    >
                      {targetAltitude.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Proximity bar */}
                <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: inWinZone
                        ? "#22c55e"
                        : altitude > winMax
                          ? "#ef4444"
                          : theme_accent,
                    }}
                  />
                  {/* Win zone bracket */}
                  <div
                    className="absolute top-0 bottom-0 border-x-2 border-green-400/70 pointer-events-none"
                    style={{
                      left: `${(winMin / (targetAltitude + tolerance)) * 100}%`,
                      width: `${((winMax - winMin) / (targetAltitude + tolerance)) * 100}%`,
                      backgroundColor: "#22c55e0a",
                    }}
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              animate={
                gameState === "playing"
                  ? {
                      y: [
                        0,
                        -(altitude / targetAltitude) * 12,
                        (altitude / targetAltitude) * 6,
                        0,
                      ],
                      rotate: [
                        0,
                        -(altitude / targetAltitude) * 3,
                        (altitude / targetAltitude) * 3,
                        0,
                      ],
                    }
                  : gameState === "ejected"
                    ? { x: "200%", y: "-100%", rotate: -20 }
                    : {}
              }
              transition={
                gameState === "playing"
                  ? { repeat: Infinity, duration: Math.max(0.5, 2 - progress) }
                  : { duration: 1 }
              }
              className="z-10 mt-16"
            >
              <RetroHelicopter
                color={theme_primary!}
                accent={theme_accent!}
                isCrashed={gameState === "crashed"}
                isPlaying={gameState === "playing"}
              />
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
                  className="w-full py-6 rounded-3xl font-black text-2xl italic text-white"
                  style={{
                    backgroundColor: inWinZone
                      ? "#16a34a"
                      : altitude > winMax
                        ? "#ef4444"
                        : theme_primary,
                    boxShadow: inWinZone
                      ? "0 0 30px #16a34a88"
                      : `0 0 20px ${theme_primary}44`,
                  }}
                >
                  {inWinZone ? "⚡ EJECT NOW!" : "EJECT NOW!"}
                </motion.button>
              ) : gameState === "idle" ? (
                <motion.button
                  key="start"
                  onClick={startGame}
                  className="w-full py-6 rounded-3xl font-black text-2xl italic text-white shadow-xl"
                  style={{
                    backgroundColor: theme_primary,
                    boxShadow: `0 0 40px ${theme_primary}66`,
                    border: `2px solid ${theme_accent}`,
                  }}
                >
                  {text3}
                </motion.button>
              ) : null}
            </AnimatePresence>
            <p className="text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase text-center">
              {gameState === "playing" ? text16 : text5}
            </p>
          </div>
        </div>
      </WidgetLayoutContent>
    </>
  );
};

export default RetroAviatorContent;
