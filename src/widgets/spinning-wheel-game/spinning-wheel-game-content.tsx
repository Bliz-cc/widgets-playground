/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type FC,
} from "react";
import {
  m,
  LazyMotion,
  domAnimation,
  useMotionValue,
  useTransform,
  animate,
  type AnimationPlaybackControls,
} from "framer-motion";

// =============================================================
// @blizcc/ui — Standard Interfaces only
// =============================================================
import {
  type DynamicWidgetView,
  WidgetHeadings,
  WidgetLayoutContent,
} from "@blizcc/ui";

// ==================== SUB-COMPONENTS ====================

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ==================== MAIN COMPONENT ====================

export const SpinningWheelGame: FC<DynamicWidgetView> = (props) => {
  const {
    theme_primary = "#8fb69a",
    theme_secondary = "#808ba7",
    theme_accent = "#f3cbc1",
    theme_line_height = "1.2",
    promos = [],
    text1,
    text2,
    text3,
    text5,
    widget_visitor_index,
    preview_state_override,

    // Wrapper-provided lifecycle methods
    is_rules_accepted,
    show_rules_popup,
    fetch_promo_idx,
    show_winning_popup,
    show_losing_popup,
    play_audio,
    stop_audio,
  } = props;

  console.log("show rules", show_rules_popup);
  console.log("is rules accepted", is_rules_accepted);
  console.log("game props", props);

  // Segment colors from schema (passed as extra props)
  const p = props as any;
  const segmentColors = useMemo(
    () => [
      p.color1 || "#8fb69a",
      p.color2 || "#808ba7",
      p.color3 || "#f3cbc1",
      p.color4 || "#8fb69a",
      p.color5 || "#8fb69a",
      p.color6 || "#808ba7",
      p.color7 || "#f3cbc1",
      p.color8 || "#808ba7",
    ],
    [
      p.color1,
      p.color2,
      p.color3,
      p.color4,
      p.color5,
      p.color6,
      p.color7,
      p.color8,
    ],
  );

  // ==================== Game State ====================
  const [gameState, setGameState] = useState<"idle" | "playing">("idle");
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);

  const wheelRotation = useMotionValue(0);
  const wheelRotateStr = useTransform(wheelRotation, (v) => `${v}deg`);
  const gameAnimControls = useRef<AnimationPlaybackControls | undefined>(
    undefined,
  );

  const itemAngle = 360 / (promos.length || 1);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameAnimControls.current) gameAnimControls.current.stop();
    };
  }, []);

  // Preview override
  useEffect(() => {
    if (preview_state_override === "idle") setGameState("idle");
    if (preview_state_override === "playing") setGameState("playing");
  }, [preview_state_override]);

  // ==================== Wheel Stop Logic ====================
  const stopAtIndex = useCallback(
    (finalIndex: number) => {
      if (gameAnimControls.current) gameAnimControls.current.stop();

      const minRotation = 1800; // 5 full forced spins
      const segmentCenter = finalIndex * itemAngle + itemAngle / 2;
      const currentRot = wheelRotation.get();
      const remainder = currentRot % 360;

      // Land the target segment dead-center at top
      const targetBase = currentRot - remainder + minRotation;
      const targetRotation = targetBase + (360 - segmentCenter);

      gameAnimControls.current = animate(wheelRotation, targetRotation, {
        duration: 4.5,
        ease: [0.32, 0.95, 0.45, 1],
        onComplete: () => {
          stop_audio("playing");
          setIsSpinning(false);
          setHasSpun(true);

          const wonPromo = promos[finalIndex];
          const isWinning = wonPromo && !wonPromo.is_default;

          console.log("final index:", finalIndex);
          console.log("won promo:", wonPromo);
          console.log("is winning:", isWinning);

          if (isWinning) {
            play_audio("win");
            show_winning_popup();
          } else {
            play_audio("lose");
            show_losing_popup();
          }
        },
      });
    },
    [
      itemAngle,
      promos,
      play_audio,
      stop_audio,
      show_winning_popup,
      show_losing_popup,
    ],
  );

  // ==================== Execute Spin ====================
  const executeSpin = useCallback(async () => {
    if (isSpinning || hasSpun) return;

    setGameState("playing");
    play_audio("playing");
    setIsSpinning(true);
    const winningIndex = await fetch_promo_idx();
    console.log("winning idx:", winningIndex);
    stopAtIndex(winningIndex ?? 0);
  }, [isSpinning, hasSpun, play_audio, fetch_promo_idx, stopAtIndex]);

  // ==================== Start Handler ====================
  const handleStart = useCallback(() => {
    if (!is_rules_accepted) {
      show_rules_popup();
      return;
    }
    executeSpin();
  }, [is_rules_accepted, show_rules_popup, executeSpin]);

  // Auto-start once rules accepted
  useEffect(() => {
    if (is_rules_accepted && gameState === "idle") {
      executeSpin();
    }
  }, [is_rules_accepted, gameState, executeSpin]);

  const handleWheelClick = useCallback(() => {
    if (gameState === "idle") {
      handleStart();
      return;
    }
    executeSpin();
  }, [gameState, handleStart, executeSpin]);

  // ==================== Idle Slow Spin ====================
  useEffect(() => {
    let idleControls: AnimationPlaybackControls | undefined;
    if (!isSpinning && !hasSpun) {
      idleControls = animate(wheelRotation, wheelRotation.get() + 360, {
        duration: 50,
        ease: "linear",
        repeat: Infinity,
      });
    }
    return () => {
      if (idleControls) idleControls.stop();
    };
  }, [isSpinning, hasSpun, wheelRotation]);

  // ==================== Conic Gradient ====================
  const conicGradientStops = useMemo(() => {
    if (!promos.length) return "";
    return promos
      .map((_, i) => {
        const start = i * itemAngle;
        const end = (i + 1) * itemAngle;
        return `${segmentColors[i % segmentColors.length]} ${start}deg ${end}deg`;
      })
      .join(", ");
  }, [promos, itemAngle, segmentColors]);

  const renderPrizeText = (prizeText: string) => {
    if (!prizeText || prizeText.trim() === "")
      return <span className="block">Try Again</span>;
    const words = prizeText.trim().split(/\s+/);
    return (
      <div className="flex flex-col items-center justify-center gap-[2px]">
        {words.map((word, idx) => (
          <span key={idx} className="block break-all max-w-full">
            {word}
          </span>
        ))}
      </div>
    );
  };

  // ==================== Render ====================
  return (
    <LazyMotion features={domAnimation}>
      <WidgetLayoutContent
        theme_primary={theme_primary}
        theme_secondary={theme_secondary}
        theme_accent={theme_accent}
        theme_line_height={theme_line_height}
        content_expired={false}
        widget_visitor_index={widget_visitor_index ?? 0}
      >
        {/* ── Light Premium Background ── */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, #ffffff 0%, #f0faf4 40%, #fef6f2 100%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(ellipse at 50% 20%, ${theme_accent}55 0%, transparent 60%)`,
            }}
          />
          {/* dot grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(${theme_primary} 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        {/* ── Main Content ── */}
        <div className="relative z-10 w-full h-full flex flex-col items-center overflow-hidden">
          {/* Headings */}
          <div className="shrink-0 text-center w-full max-w-lg pt-6 px-4 mb-2 z-10">
            <WidgetHeadings
              title={text1}
              sub_title={text2}
              theme_primary={theme_primary}
              theme_line_height={parseFloat(theme_line_height || "1.5")}
            />
          </div>

          {/* Wheel Area */}
          <m.div
            animate={
              gameState === "idle"
                ? { scale: [0.98, 1.03, 0.98] }
                : { scale: 1 }
            }
            transition={
              gameState === "idle"
                ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.5 }
            }
            onClick={handleWheelClick}
            className={`relative flex-1 flex justify-center items-center ${isSpinning ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="relative w-[290px] h-[290px] sm:w-[320px] sm:h-[320px]">
              {/* Pointer Arrow */}
              <div
                style={{ zIndex: 50 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 drop-shadow-xl pointer-events-none"
              >
                <svg
                  width="46"
                  height="54"
                  viewBox="0 0 46 54"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M23 52 L4 12 Q23 -4 42 12 Z"
                    fill={theme_primary}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M23 48 L8 14 Q23 0 38 14 Z"
                    fill="rgba(0,0,0,0.12)"
                  />
                </svg>
              </div>

              {/* Outer Ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: `0 0 0 4px #FFFFFF, 0 0 0 10px ${theme_primary}, 0 0 0 14px #FFFFFF, inset 0 6px 20px rgba(0,0,0,0.15)`,
                }}
              >
                {/* Spinning Wheel */}
                <m.div
                  className="absolute inset-0 rounded-full overflow-hidden"
                  style={{
                    willChange: "transform",
                    rotate: wheelRotateStr,
                    background: `conic-gradient(${conicGradientStops})`,
                  }}
                >
                  {promos.map((promo, index) => {
                    const edgeAngle = index * itemAngle;
                    const centerAngle = edgeAngle + itemAngle / 2;
                    return (
                      <React.Fragment key={index}>
                        {/* Slice divider */}
                        {promos.length > 1 && (
                          <div
                            className="absolute top-0 left-1/2 w-[2px] sm:w-[3px] bg-white h-[50%] origin-bottom z-0 opacity-90"
                            style={{
                              transform: `translateX(-50%) rotate(${edgeAngle}deg)`,
                            }}
                          />
                        )}
                        {/* Prize label */}
                        <div
                          className="absolute top-0 left-1/2 h-[50%] flex flex-col justify-start items-center origin-bottom pt-5 sm:pt-6 pb-2 z-10"
                          style={{
                            width: `${Math.max(20, Math.min(45, (360 / promos.length) * 1.2))}%`,
                            transform: `translateX(-50%) rotate(${centerAngle}deg)`,
                          }}
                        >
                          <div className="relative z-0 font-bold text-white text-center leading-tight text-[11px] sm:text-[13px] drop-shadow-md px-1">
                            {renderPrizeText(promo.prize || "")}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </m.div>
              </div>

              {/* Center GO Button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                <button
                  disabled={isSpinning || gameState === "idle"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWheelClick();
                  }}
                  className={`w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full flex justify-center items-center uppercase font-black text-sm tracking-wider transition-all duration-200 ${
                    isSpinning || gameState === "idle"
                      ? "opacity-80"
                      : "hover:scale-105 active:scale-95 cursor-pointer"
                  }`}
                  style={{
                    background: theme_primary,
                    boxShadow: `0 0 0 4px #ffffff, 0 8px 16px rgba(0,0,0,0.3)`,
                    color: "#ffffff",
                  }}
                >
                  {isSpinning ? (
                    <LoadingSpinner />
                  ) : (
                    <span className="drop-shadow-md">GO</span>
                  )}
                </button>
              </div>
            </div>
          </m.div>

          {/* Start Overlay — shown when idle */}
          {gameState === "idle" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-10 px-6">
              <div
                className="w-full max-w-sm rounded-3xl p-6 flex flex-col items-center gap-4 shadow-2xl"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(16px)",
                  border: `1.5px solid ${theme_primary}33`,
                }}
              >
                <p
                  className="text-sm font-semibold text-center opacity-60"
                  style={{ color: theme_secondary }}
                >
                  {text5 || "Tap below to spin the wheel!"}
                </p>
                <button
                  onClick={handleStart}
                  className="w-full py-4 rounded-2xl font-black text-lg italic text-white uppercase tracking-tighter shadow-lg transition-transform active:scale-95 hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${theme_primary}, ${theme_accent})`,
                    boxShadow: `0 6px 24px ${theme_primary}55`,
                  }}
                >
                  {text3 || "Spin Now"}
                </button>
              </div>
            </div>
          )}
        </div>
      </WidgetLayoutContent>
    </LazyMotion>
  );
};

export default SpinningWheelGame;
