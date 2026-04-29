/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { type FC, useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WidgetBaseContainer,
  WidgetLayoutContent,
  WidgetHeadings,
  WidgetFullscreenToggle,
  WidgetConfetti,
  WidgetSuccessOverlay,
  CONTENT_LANGUAGE_ENUM,
} from "@blizcc/ui";
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
import type { WidgetView } from "@blizcc/ui";

const FUEL_TYPES = [
  { id: "premium", label: "PREMIUM 95", color: "#10b981", price: "1.42" },
  { id: "diesel", label: "DIESEL", color: "#f59e0b", price: "1.28" },
  { id: "super", label: "SUPER 98", color: "#3b82f6", price: "1.56" },
];

const FuelPumpChallenge: FC<WidgetView> = ({
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
  promos,
  original_url = "",
  content_expired,
  text16,
  text18, // Target litres & Label
  content_language = CONTENT_LANGUAGE_ENUM.ENGLISH,
  terms_link,
  terms_text,
  preview_mode,
  preview_state_override,
}) => {
  const { visitor_index, visitor_index_loading, is_interaction_disabled } =
    useGetVisitorIndex();
  const { element_ref, is_fullscreen, toggle_fullscreen, is_mobile, is_ios } =
    useFullscreen();
  const { selected_index } = usePromoAutoSelect({
    widget_id,
    link_id,
    preview_mode,
    content_expired,
    promos_length: promos.length,
    skip_fetch: is_interaction_disabled || visitor_index_loading,
  });
  usePromoSoldOut(promos);
  const { send_interaction_event } = useSubmitWidgetEvents(preview_mode);
  const { is_completed, lead_data, handle_pre_game_submit } = useGameSession({
    widget_id,
    promos,
    selected_index,
    on_close_cleanup: is_fullscreen ? toggle_fullscreen : undefined,
  });

  const { play, stop } = useAudio(
    useMemo(
      () => ({
        pump: { src: "/ui/pumping.mp3", volume: 0.4, loop: true },
        win: { src: "/ui/win.mp3", volume: 0.5, loop: false },
        lose: { src: "/ui/lose.mp3", volume: 0.5, loop: false },
      }),
      [],
    ),
  );

  // ---- Game State ----
  const [phase, setPhase] = useState<
    "setup" | "playing" | "failed" | "success"
  >("setup");
  const [selectedFuel, setSelectedFuel] = useState(FUEL_TYPES[0]);
  const [litres, setLitres] = useState(0);
  const [isPumping, setIsPumping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const targetAmount = useMemo(() => parseFloat(text16 ?? "13.00"), [text16]);
  const tolerance = 0.05; // ±0.05 litres window

  const intervalRef = useRef<number | null>(null);
  const litresRef = useRef(0);
  const isPumpingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  usePreviewStateOverride({
    preview_mode,
    preview_state_override,
    on_start_state: () => {
      setPhase("setup");
      setLitres(0);
      litresRef.current = 0;
    },
    on_game_state: () => {
      setPhase("playing");
      setLitres(0);
      litresRef.current = 0;
    },
    on_win_state: () => {
      setPhase("success");
      setLitres(targetAmount);
      litresRef.current = targetAmount;
    },
  });

  const startPumping = () => {
    if (phase !== "playing" || isPumpingRef.current) return;
    isPumpingRef.current = true;
    setIsPumping(true);
    play("pump");

    intervalRef.current = window.setInterval(() => {
      litresRef.current = +(litresRef.current + 0.03).toFixed(2);
      setLitres(litresRef.current);

      // Auto stop if overfilled to prevent infinite pumping
      if (litresRef.current >= targetAmount + 2) {
        stopPumping(litresRef.current);
      }
    }, 30);
  };

  const stopPumping = (forcedValue?: number) => {
    if (!isPumpingRef.current) return;
    isPumpingRef.current = false;
    setIsPumping(false);
    stop("pump");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    handleFinish(forcedValue !== undefined ? forcedValue : litresRef.current);
  };

  const handleFinish = (finalLitres: number) => {
    const diff = Math.abs(finalLitres - targetAmount);
    // Add Number.EPSILON to handle floating point precision cleanly
    if (diff <= tolerance + Number.EPSILON) {
      play("win");
      setShowConfetti(true);
      setPhase("success");
    } else {
      play("lose");
      setPhase("failed");
    }
  };

  const startGame = () => {
    setPhase("playing");
    setLitres(0);
    litresRef.current = 0;
    send_interaction_event(widget_id, selected_index ?? 0, promos);
  };

  const resetPump = () => {
    setPhase("setup");
    setLitres(0);
    litresRef.current = 0;
  };

  // UI Derived State
  const isFailed = phase === "failed";
  const isSuccess = phase === "success";
  const ledColor = isFailed
    ? "text-red-500"
    : isSuccess
      ? "text-amber-400"
      : "text-[#33ff00]";
  const ledGlow = isFailed
    ? "drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
    : isSuccess
      ? "drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]"
      : "drop-shadow-[0_0_10px_rgba(51,255,0,0.8)]";
  const ledBorder = isFailed
    ? "border-red-500/30"
    : isSuccess
      ? "border-amber-400/30"
      : "border-[#33ff00]/30";

  const formattedLitres = litres.toFixed(2);
  const [whole, decimal] = formattedLitres.split(".");

  const saleAmount = (litres * parseFloat(selectedFuel.price)).toFixed(2);
  const [saleWhole, saleDecimal] = saleAmount.split(".");

  return (
    <WidgetBaseContainer ref={element_ref} is_fullscreen={is_fullscreen}>
      <div className="absolute inset-0 bg-slate-950">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(${theme_primary}33 1px, transparent 1px), linear-gradient(90deg, ${theme_primary}33 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
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
          colors={[theme_primary!, theme_accent!, "#ffffff"]}
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

      <WidgetLayoutContent
        theme_primary={theme_primary!}
        theme_secondary={theme_secondary!}
        theme_accent={theme_accent}
        theme_line_height={theme_line_height}
        content_expired={content_expired}
        widget_visitor_index={visitor_index ?? 0}
      >
        <div className="relative w-full h-full flex flex-col items-center px-4 pt-6 pb-4">
          <WidgetHeadings
            title={text1}
            sub_title={text2}
            theme_primary={theme_primary!}
            theme_line_height={parseFloat(theme_line_height!)}
          />

          {/* Epic Vintage Gas Pump Body */}
          <div className="mt-4 w-full max-w-[22rem] mx-auto bg-slate-200 rounded-t-[50px] rounded-b-[30px] border-[12px] border-slate-300 shadow-[0_30px_60px_rgba(0,0,0,0.6)] p-4 flex flex-col gap-4 relative z-10">
            {/* LED Display Screen */}
            <div className="bg-[#050a08] border-[6px] border-slate-700 rounded-2xl p-5 shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative flex flex-col font-mono select-none overflow-hidden">
              {/* Glass Reflection */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rotate-45 pointer-events-none rounded-full blur-2xl" />

              {/* Top Row: Sale */}
              <div
                className={`flex justify-between items-end border-b pb-2 mb-2 ${ledBorder} transition-colors duration-300`}
              >
                <span
                  className={`text-sm opacity-60 tracking-widest ${ledColor} font-bold transition-colors duration-300`}
                >
                  SALE $
                </span>
                <span
                  className={`text-3xl font-bold ${ledColor} ${ledGlow} transition-colors duration-300`}
                >
                  ${saleWhole}
                  <span className="text-xl">.{saleDecimal}</span>
                </span>
              </div>

              {/* Middle Row: Litres */}
              <div
                className={`flex justify-between items-end border-b pb-2 mb-2 ${ledBorder} transition-colors duration-300`}
              >
                <span
                  className={`text-sm opacity-60 tracking-widest ${ledColor} font-bold transition-colors duration-300`}
                >
                  {text18 ?? "LITRES"}
                </span>
                <div className="flex items-baseline">
                  <span
                    className={`text-6xl font-black ${ledColor} ${ledGlow} tracking-tighter transition-colors duration-300`}
                  >
                    {whole}
                  </span>
                  <span
                    className={`text-4xl font-bold ${ledColor} ${ledGlow} tracking-tighter mb-1 transition-colors duration-300`}
                  >
                    .{decimal}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Target */}
              <div className="flex justify-between items-center text-xs pt-1 font-bold opacity-80">
                <span className={`${ledColor} transition-colors duration-300`}>
                  {selectedFuel.price} $/L
                </span>
                <span className={`${ledColor} transition-colors duration-300`}>
                  TARGET: {targetAmount.toFixed(2)}
                </span>
              </div>

              {/* Status Overlays */}
              <AnimatePresence>
                {isFailed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-red-500/10 animate-pulse flex flex-col items-center justify-center backdrop-blur-[1.5px]"
                  >
                    <div className="bg-red-950/90 border-y-4 border-red-500 w-full py-3 flex flex-col items-center shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                      <span className="text-red-500 text-2xl font-black tracking-widest drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] uppercase">
                        {litres > targetAmount ? "OVERFILL" : "UNDERFILL"}
                      </span>
                      <span className="text-red-300 text-[10px] font-bold tracking-widest mt-1">
                        DIFF: {Math.abs(litres - targetAmount).toFixed(2)} L
                      </span>
                    </div>
                  </motion.div>
                )}
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-amber-500/10 animate-pulse flex flex-col items-center justify-center backdrop-blur-[1.5px]"
                  >
                    <div className="bg-amber-950/90 border-y-4 border-amber-400 w-full py-3 flex flex-col items-center shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                      <span className="text-amber-400 text-3xl font-black tracking-widest drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] uppercase">
                        EXACT HIT!
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fuel Selectors */}
            <div className="bg-slate-300 p-2 rounded-2xl flex gap-2 justify-between border-t-4 border-l-4 border-slate-400 border-b-2 border-r-2 border-slate-100 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]">
              {FUEL_TYPES.map((fuel) => (
                <button
                  key={fuel.id}
                  onClick={() => phase === "setup" && setSelectedFuel(fuel)}
                  disabled={phase !== "setup"}
                  className={`flex-1 p-2 rounded-xl border-b-[6px] flex flex-col items-center transition-all ${
                    selectedFuel.id === fuel.id
                      ? "bg-slate-100 border-slate-300 translate-y-[4px] border-b-[2px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] grayscale-0"
                      : "bg-slate-50 border-slate-300 shadow-[0_4px_0_rgba(0,0,0,0.1)] opacity-70 hover:opacity-100"
                  }`}
                >
                  <div
                    className="w-full h-2 rounded-full mb-1.5 shadow-inner"
                    style={{ backgroundColor: fuel.color }}
                  />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                    {fuel.label}
                  </span>
                  <span className="text-sm font-black text-slate-800">
                    {fuel.price}
                  </span>
                </button>
              ))}
            </div>

            {/* Action Area */}
            <div className="mt-1 relative h-auto min-h-[6rem]">
              {phase === "setup" && (
                <motion.button
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={startGame}
                  className="w-full h-24 rounded-[1.5rem] bg-gradient-to-b from-blue-500 to-blue-700 border-b-[8px] border-blue-900 active:border-b-[0px] active:translate-y-[8px] transition-all duration-75 flex flex-col items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.3)] text-white font-black text-xl uppercase tracking-widest px-4 text-center leading-tight"
                >
                  {text3}
                </motion.button>
              )}

              {phase === "playing" && (
                <motion.button
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onMouseDown={() => startPumping()}
                  onMouseUp={() => stopPumping()}
                  onMouseLeave={() => stopPumping()}
                  onTouchStart={() => startPumping()}
                  onTouchEnd={() => stopPumping()}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-32 rounded-[2rem] bg-gradient-to-b from-red-500 to-red-700 border-b-[12px] border-red-900 active:border-b-[0px] active:translate-y-[12px] transition-all duration-75 flex flex-col items-center justify-center touch-none select-none shadow-[0_20px_30px_rgba(0,0,0,0.4)]"
                >
                  <span className="text-5xl font-black text-white uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                    PUMP
                  </span>
                  <span className="text-xs font-bold text-red-200 uppercase mt-2 drop-shadow-sm px-4 text-center">
                    {text5}
                  </span>
                </motion.button>
              )}

              {phase === "failed" && (
                <motion.button
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={resetPump}
                  className="w-full h-24 rounded-[1.5rem] bg-gradient-to-b from-slate-600 to-slate-800 border-b-[8px] border-slate-950 active:border-b-[0px] active:translate-y-[8px] transition-all duration-75 flex flex-col items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.3)] text-white font-black text-xl uppercase tracking-widest"
                >
                  TRY AGAIN
                </motion.button>
              )}

              {phase === "success" && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-slate-100 p-5 rounded-2xl border-4 border-slate-300 shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)] flex flex-col gap-4"
                >
                  <div className="text-center text-emerald-600 font-black text-2xl uppercase tracking-tight flex items-center justify-center gap-2">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    {text4}
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={text8}
                    className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all placeholder:text-slate-400"
                  />

                  <label className="flex items-start gap-2 px-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                    />
                    <span className="text-[10px] leading-tight text-slate-500 font-bold uppercase">
                      {terms_text}{" "}
                      {terms_link && (
                        <a
                          href={terms_link}
                          target="_blank"
                          className="text-emerald-600 underline ml-1"
                        >
                          [READ]
                        </a>
                      )}
                    </span>
                  </label>

                  <button
                    onClick={() => handle_pre_game_submit(email, termsAccepted)}
                    className="w-full py-4 rounded-xl font-black text-xl uppercase tracking-tighter text-white bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_6px_0_#047857] active:shadow-[0_0px_0_#047857] active:translate-y-[6px]"
                  >
                    {text10}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </WidgetLayoutContent>
    </WidgetBaseContainer>
  );
};

export default FuelPumpChallenge;
