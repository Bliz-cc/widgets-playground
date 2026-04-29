/* eslint-disable react-hooks/exhaustive-deps */
/**
 * ============================================================
 * BLIZ UI - Widget Integration Template
 * ============================================================
 *
 * PURPOSE:
 * This file serves as a reference template for developers who are
 * migrating existing game widget components to use the @blizcc/ui
 * library. It demonstrates the canonical patterns for:
 *
 *   1. Importing and composing UI components from @blizcc/ui
 *   2. Integrating library hooks (game session, visitor, fullscreen, etc.)
 *   3. Wiring up event tracking via useSubmitWidgetEvents
 *   4. Handling lead collection (pre/post game)
 *   5. Preview mode overrides for the Studio environment
 *
 * HOW TO USE:
 * Copy this file, rename the component, and replace the
 * "GAME MECHANICS" section with your specific animation/game logic.
 * All orchestration (hooks, modals, overlays) should remain unchanged.
 *
 * NAMING CONVENTIONS:
 * All hook returns and props follow snake_case as per the library guide.
 *
 * DEPENDENCIES:
 * - @blizcc/ui
 * - framer-motion (for game animations)
 */

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
import { SCHEMA } from "./fun-email-subscribe-schema";

// =============================================================
// WIDGET TEMPLATE COMPONENT
// =============================================================
const FunEmailSubscribe: FC<WidgetView> = ({
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
  // STEP 7: PREVIEW STATE & OVERRIDES
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
  // STEP 9: CUSTOM LEAD COLLECTION LOGIC
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
        set_email_error(text14 || "Please enter a valid email");
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
        // Reusing existing hook logic to submit lead
        await handle_pre_game_submit(email, terms_accepted);

        // Track event
        send_interaction_event(widget_id, selected_index ?? 0, promos);

        // Trigger success visuals (Completion is now deferred to on_animation_end)
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
      <WidgetDecorations
        theme_primary={theme_primary!}
        theme_secondary={theme_secondary!}
        theme_accent={theme_accent}
      />

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
        <div className="relative w-full h-full flex flex-col items-center justify-center px-6">
          <AnimatePresence mode="wait">
            {!is_completed && (
              <motion.div
                key="subscribe-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-sm flex flex-col items-center"
              >
                <div className="w-full text-center mb-8">
                  <WidgetHeadings
                    title={text1}
                    sub_title={text2}
                    theme_primary={theme_primary!}
                    theme_line_height={parseFloat(theme_line_height!)}
                  />
                </div>

                <form onSubmit={handle_subscribe} className="w-full space-y-6">
                  <div className="space-y-4">
                    <div className="relative group">
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        className="relative overflow-hidden rounded-2xl border-2 transition-all duration-300"
                        style={{
                          borderColor: email_error ? "#ef4444" : theme_primary,
                          boxShadow: email_error ? "0 0 0 1px #ef4444" : "none",
                        }}
                      >
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => set_email(e.target.value)}
                          placeholder={text5}
                          className="w-full px-5 py-4 bg-white outline-none text-lg placeholder:opacity-50"
                          style={{ color: theme_secondary }}
                        />
                        <div
                          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r transition-all duration-500 ease-out"
                          style={{
                            width: email ? "100%" : "0%",
                            backgroundImage: `linear-gradient(to right, ${theme_primary}, ${theme_accent})`,
                          }}
                        />
                      </motion.div>

                      <AnimatePresence>
                        {email_error && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute -bottom-6 left-2 text-xs font-medium text-red-500"
                          >
                            {email_error}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <motion.div
                        animate={terms_error ? { x: [-4, 4, -4, 4, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className="flex items-start space-x-3 px-2"
                      >
                        <div className="relative flex items-center justify-center mt-1">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              set_terms_accepted(!terms_accepted);
                              if (!terms_accepted) set_terms_error(false);
                            }}
                            className="w-5 h-5 rounded-md border-2 cursor-pointer flex items-center justify-center transition-colors overflow-hidden"
                            style={{
                              borderColor: terms_error
                                ? "#ef4444"
                                : theme_primary,
                              backgroundColor: terms_accepted
                                ? theme_primary
                                : "transparent",
                            }}
                          >
                            <AnimatePresence>
                              {terms_accepted && (
                                <motion.svg
                                  initial={{
                                    scale: 0,
                                    opacity: 0,
                                    rotate: -45,
                                  }}
                                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                  exit={{ scale: 0, opacity: 0, rotate: 45 }}
                                  className="w-3.5 h-3.5 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={4}
                                    d="M5 13l4 4L19 7"
                                  />
                                </motion.svg>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                        <div
                          className="text-[11px] leading-snug cursor-pointer select-none"
                          style={{
                            color: terms_error ? "#ef4444" : theme_secondary,
                          }}
                          onClick={() => {
                            set_terms_accepted(!terms_accepted);
                            if (!terms_accepted) set_terms_error(false);
                          }}
                        >
                          {terms_text ||
                            "By subscribing, you agree to our terms."}{" "}
                          {terms_link && (
                            <a
                              href={terms_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:opacity-80 transition-opacity font-bold ml-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Read more
                            </a>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={select_promo_loading}
                    className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-shadow hover:shadow-xl disabled:opacity-50"
                    style={{
                      backgroundColor: theme_primary,
                      backgroundImage: `linear-gradient(135deg, ${theme_primary} 0%, ${theme_accent} 100%)`,
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
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full mx-auto"
                      />
                    ) : (
                      text3
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </WidgetLayoutContent>
    </WidgetBaseContainer>
  );
};

export default FunEmailSubscribe;
