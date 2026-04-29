/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { type FC, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// =============================================================
// @blizcc/ui — UI Components & Enums
// =============================================================
import {
  // Layout
  WidgetBaseContainer,
  WidgetLayoutContent,
  WidgetDecorations,
  WidgetHeadings,
  WidgetFullscreenToggle,
  WidgetConfetti,

  // Overlays
  WidgetSuccessOverlay,
  WidgetErrorOverlay,

  // Enums
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
import { SCHEMA } from "./fun-email-subscribe-retro-schema";

// =============================================================
// RETRO WIDGET VARIANT
// =============================================================
const FunEmailSubscribeRetro: FC<WidgetView> = ({
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
  text11,
  text14,
  promos,
  original_url = "",
  content_expired,
  content_language = CONTENT_LANGUAGE_ENUM.ENGLISH,
  terms_link,
  terms_text,
  preview_mode,
  preview_state_override,
}) => {
  // ===========================================================
  // STEP 1: VISITOR IDENTITY
  // ===========================================================
  const {
    visitor_index,
    visitor_index_loading,
    is_rate_limited,
    is_interaction_disabled,
  } = useGetVisitorIndex();

  // ===========================================================
  // STEP 2: FULLSCREEN
  // ===========================================================
  const { element_ref, is_fullscreen, toggle_fullscreen, is_mobile, is_ios } =
    useFullscreen();

  // ===========================================================
  // STEP 3: PRIZE SELECTION
  // ===========================================================
  const { selected_index, select_promo_loading, select_promo_error } =
    usePromoAutoSelect({
      widget_id,
      link_id,
      preview_mode,
      content_expired,
      promos_length: promos.length,
      skip_fetch: is_interaction_disabled || visitor_index_loading,
    });

  usePromoSoldOut(promos);

  // ===========================================================
  // STEP 5: AUDIO
  // ===========================================================
  const audio_config = useMemo(
    () => ({
      win: { src: "/ui/win.mp3", volume: 0.4, loop: false },
      lose: { src: "/ui/lose.mp3", volume: 0.3, loop: false },
      playing: { src: "/ui/playing.mp3", volume: 0.5, loop: false },
    }),
    [],
  );

  const { play } = useAudio(audio_config);

  // ===========================================================
  // STEP 6: EVENT TRACKING
  // ===========================================================
  const { send_interaction_event } = useSubmitWidgetEvents(preview_mode);

  // ===========================================================
  // STEP 7: GAME SESSION orchestrator
  // ===========================================================
  const { is_completed, lead_data, handle_pre_game_submit, set_is_completed } =
    useGameSession({
      widget_id,
      promos,
      selected_index,
      on_close_cleanup: is_fullscreen ? toggle_fullscreen : undefined,
      auto_skip_delay: 4000,
    });

  // ===========================================================
  // STEP 8: PREVIEW STATE & OVERRIDES
  // ===========================================================
  const [show_confetti, set_show_confetti] = useState(false);

  usePreviewStateOverride({
    preview_mode,
    preview_state_override,
    on_start_state: () => {},
    on_game_state: () => {},
    on_win_state: () => {
      set_is_completed(true);
    },
    on_lose_state: () => {
      set_is_completed(true);
    },
  });

  // ===========================================================
  // STEP 9: RETRO FORM LOGIC
  // ===========================================================
  const [email, set_email] = useState("");
  const [email_error, set_email_error] = useState("");
  const [terms_accepted, set_terms_accepted] = useState(false);
  const [terms_error, set_terms_error] = useState(false);

  const validate_email = (val: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val);
  };

  const handle_subscribe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      let has_error = false;

      if (!validate_email(email)) {
        set_email_error(text14 || "INVALID PROTOCOL");
        has_error = true;
      } else {
        set_email_error("");
      }

      if (!terms_accepted) {
        set_terms_error(true);
        has_error = true;
      } else {
        set_terms_error(false);
      }

      if (has_error) return;

      try {
        await handle_pre_game_submit(email, terms_accepted);
        send_interaction_event(widget_id, selected_index ?? 0, promos);

        set_show_confetti(true);
        play("win");
      } catch (err) {
        console.error("Subscription failed", err);
      }
    },
    [
      email,
      terms_accepted,
      handle_pre_game_submit,
      widget_id,
      selected_index,
      promos,
      send_interaction_event,
      play,
      text14,
    ],
  );

  // ===========================================================
  // RENDER
  // ===========================================================
  return (
    <WidgetBaseContainer ref={element_ref} is_fullscreen={is_fullscreen}>
      {/* Background Layer: Retro Grid & Glow */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ backgroundColor: "#000000" }}
      >
        {/* Retro Grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(${theme_primary} 1px, transparent 1px), linear-gradient(90deg, ${theme_primary} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            transform: "perspective(500px) rotateX(60deg) translateY(-100px)",
            transformOrigin: "top",
          }}
        />
        
        {/* Glow Spheres */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 animate-pulse"
          style={{ backgroundColor: theme_primary }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 animate-pulse"
          style={{ backgroundColor: theme_secondary, animationDelay: "1s" }}
        />

        {/* Scanlines Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
            backgroundSize: "100% 4px, 3px 100%",
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

      {show_confetti && (
        <WidgetConfetti
          text={text4}
          colors={[theme_primary!, theme_secondary!, theme_accent!]}
          duration={5}
          on_animation_end={() => {
            set_show_confetti(false);
            setTimeout(() => {
              set_is_completed(true);
            }, 2000);
          }}
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
        widget_display_usage={0}
        widget_visit_usage={0}
        widget_visitor_index={visitor_index ?? 0}
      >
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-6">
          <AnimatePresence mode="wait">
            {!is_completed && (
              <motion.div
                key="retro-form"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="w-full max-w-sm flex flex-col items-center"
              >
                {/* Header with CRT Flicker */}
                <motion.div 
                  className="w-full text-center mb-10"
                  animate={{ opacity: [1, 0.9, 1, 0.8, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <h1 
                    className="text-4xl font-black italic uppercase tracking-tighter mb-2"
                    style={{ 
                      color: theme_secondary,
                      textShadow: `3px 3px 0px ${theme_primary}, -1px -1px 0px ${theme_accent}`
                    }}
                  >
                    {text1}
                  </h1>
                  <p 
                    className="text-xs font-mono uppercase tracking-[0.2em] opacity-80"
                    style={{ color: "#ffffff" }}
                  >
                    {text2}
                  </p>
                </motion.div>

                <form onSubmit={handle_subscribe} className="w-full space-y-8">
                  <div className="space-y-6">
                    {/* Retro Input */}
                    <div className="relative">
                      <div 
                        className="absolute -inset-1 blur-sm opacity-50"
                        style={{ backgroundColor: email_error ? "#ef4444" : theme_secondary }}
                      />
                      <div 
                        className="relative bg-black border-2 transition-all"
                        style={{ 
                          borderColor: email_error ? "#ef4444" : theme_primary,
                          boxShadow: `4px 4px 0px ${email_error ? "#ef4444" : theme_primary}`
                        }}
                      >
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => set_email(e.target.value)}
                          placeholder={text5}
                          className="w-full px-4 py-4 bg-transparent outline-none text-white font-mono placeholder:opacity-30 placeholder:uppercase"
                        />
                      </div>
                      <AnimatePresence>
                        {email_error && (
                          <motion.p
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="absolute -bottom-6 left-0 text-[10px] font-mono text-red-500 uppercase italic"
                          >
                            {`> ERROR: ${email_error}`}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Retro Checkbox */}
                    <motion.div 
                      className="flex items-center space-x-3 px-1"
                      animate={terms_error ? { x: [-2, 2, -2, 2, 0] } : {}}
                    >
                      <div 
                        className="w-6 h-6 border-2 cursor-pointer flex items-center justify-center transition-colors bg-black"
                        style={{ 
                          borderColor: terms_error ? "#ef4444" : theme_secondary,
                          boxShadow: `2px 2px 0px ${terms_error ? "#ef4444" : theme_secondary}`
                        }}
                        onClick={() => {
                          set_terms_accepted(!terms_accepted);
                          if (!terms_accepted) set_terms_error(false);
                        }}
                      >
                        {terms_accepted && (
                          <div 
                            className="w-3 h-3 animate-pulse"
                            style={{ backgroundColor: theme_primary }}
                          />
                        )}
                      </div>
                      <div 
                        className="text-[10px] font-mono leading-none cursor-pointer select-none uppercase tracking-wider"
                        style={{ color: terms_error ? "#ef4444" : "#ffffff" }}
                        onClick={() => {
                          set_terms_accepted(!terms_accepted);
                          if (!terms_accepted) set_terms_error(false);
                        }}
                      >
                        {terms_text}{" "}
                        {terms_link && (
                          <a
                            href={terms_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-bold"
                            style={{ color: theme_secondary }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            [READ DATA]
                          </a>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Retro Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 2, y: 2 }}
                    whileTap={{ scale: 0.98, x: 4, y: 4 }}
                    type="submit"
                    disabled={select_promo_loading}
                    className="group relative w-full"
                  >
                    <div 
                      className="absolute inset-0 bg-white translate-x-2 translate-y-2 opacity-20"
                    />
                    <div 
                      className="relative w-full py-5 font-black text-xl italic uppercase tracking-tighter transition-transform active:translate-x-1 active:translate-y-1"
                      style={{
                        backgroundColor: theme_primary,
                        color: "#000000",
                        boxShadow: `0 0 20px ${theme_primary}44`
                      }}
                    >
                      {select_promo_loading ? "PROCESSING..." : text3}
                    </div>
                  </motion.button>
                </form>

                {/* Footer Deco */}
                <div className="mt-12 flex space-x-2">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div 
                      key={i}
                      className="w-2 h-2"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      style={{ backgroundColor: i % 2 === 0 ? theme_primary : theme_secondary }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </WidgetLayoutContent>
    </WidgetBaseContainer>
  );
};

export default FunEmailSubscribeRetro;
