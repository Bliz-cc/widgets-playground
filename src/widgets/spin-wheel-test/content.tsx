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
  WidgetStartOverlay,
  WidgetUnifiedResultModal,
  WidgetRulesAcceptModal,

  // Enums
  CONTENT_LANGUAGE_ENUM,
  COLLECTION_METHOD_ENUM,
  COLLECTION_METHOD_PLACEMENT_ENUM,
} from "@blizcc/ui";

// =============================================================
// @blizcc/ui — Hooks
// =============================================================
import {
  useGetVisitorIndex,
  useFullscreen,
  useGameRules,
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
import { SCHEMA } from "./schema";

// =============================================================
// MOCK RULES (Localized hints for the Rules Modal)
// =============================================================
const WIDGET_RULES = {
  [CONTENT_LANGUAGE_ENUM.ENGLISH]: {
    what_it_is: "A high-speed interactive template widget.",
    how_to_play: "Tap the screen repeatedly to reach the goal.",
  },
  [CONTENT_LANGUAGE_ENUM.RUSSIAN]: {
    what_it_is: "Высокоскоростной интерактивный виджет-шаблон.",
    how_to_play: "Многократно нажимайте на экран, чтобы достичь цели.",
  },
};

const ENGINE_RULES = {
  [CONTENT_LANGUAGE_ENUM.ENGLISH]:
    "Prizes are awarded via a transparent Round-Robin algorithm.",
  [CONTENT_LANGUAGE_ENUM.RUSSIAN]:
    "Призы присуждаются с помощью прозрачного алгоритма Round-Robin.",
};

// =============================================================
// WIDGET TEMPLATE COMPONENT
// =============================================================
const SpinWheelTest: FC<WidgetView> = ({
  widget_id,
  link_id,
  theme_primary,
  theme_secondary,
  theme_accent = SCHEMA.theme_accent,
  theme_line_height = SCHEMA.theme_line_height,
  text1,
  text2,
  text3,
  text4,
  text5,
  text7,
  text8,
  text10,
  text11,
  text14,
  promos,
  original_url = "",
  selection_method,
  content_expired,
  content_language = CONTENT_LANGUAGE_ENUM.ENGLISH,
  collection_method = COLLECTION_METHOD_ENUM.PHONE,
  collection_method_placement = COLLECTION_METHOD_PLACEMENT_ENUM.AFTER_PLAY,
  terms_link,
  terms_text,
  widget_display_usage,
  widget_visit_usage,
  preview_mode,
  preview_state_override,
}) => {
  console.log('promos:', promos);
  console.log('title', text1, text2);

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
  // STEP 3: GAME RULES GATE
  // ===========================================================
  const {
    is_rules_accept_modal_open,
    has_accepted_rules,
    handle_accept_rules,
    set_is_rules_accept_modal_open,
    handle_view_full_rules_from_accept,
  } = useGameRules(preview_mode);

  // ===========================================================
  // STEP 4: PRIZE SELECTION
  // ===========================================================
  const {
    selected_index,
    select_promo_loading,
    selected_promo,
    select_promo_error,
  } = usePromoAutoSelect({
    widget_id,
    link_id,
    preview_mode,
    content_expired,
    promos_length: promos.length,
    skip_fetch: is_interaction_disabled || visitor_index_loading,
  });

  const { is_sold_out } = usePromoSoldOut(promos);

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

  const { play, stop } = useAudio(audio_config);

  // ===========================================================
  // STEP 6: EVENT TRACKING
  // ===========================================================
  const {
    send_interaction_event,
    send_consent_game_start,
    send_interaction_finished_event,
  } = useSubmitWidgetEvents(preview_mode);

  // ===========================================================
  // STEP 7: GAME SESSION orchestrator
  // ===========================================================
  const {
    is_winning_modal_open,
    is_losing_modal_open,
    is_completed,
    lead_data,
    trigger_game_result,
    handle_post_game_submit,
    handle_pre_game_submit,
    handle_claim_win_id,
    handle_close,
    set_is_winning_modal_open,
    set_is_losing_modal_open,
  } = useGameSession({
    widget_id,
    promos,
    selected_index,
    on_close_cleanup: is_fullscreen ? toggle_fullscreen : undefined,
    auto_skip_delay: 4000,
  });

  // ===========================================================
  // STEP 8: PREVIEW STATE & OVERRIDES
  // ===========================================================
  const [game_state, set_game_state] = useState<"idle" | "playing">("idle");
  const [show_confetti, set_show_confetti] = useState(false);

  usePreviewStateOverride({
    preview_mode,
    preview_state_override,
    on_start_state: () => set_game_state("idle"),
    on_game_state: () => set_game_state("playing"),
    on_win_state: () => {
      set_game_state("playing");
      set_is_winning_modal_open(true);
    },
    on_lose_state: () => {
      set_game_state("playing");
      set_is_losing_modal_open(true);
    },
  });

  // ===========================================================
  // STEP 9: GAME MECHANICS
  // ===========================================================
  const execute_game = useCallback(() => {
    if (
      selected_index === null ||
      is_interaction_disabled ||
      is_completed ||
      content_expired
    )
      return;

    set_game_state("playing");
    play("playing");
    send_interaction_event(widget_id, selected_index, promos);

    // Simulate 2-second animation
    setTimeout(() => {
      stop("playing");
      const is_winning = !promos[selected_index]?.is_default;

      if (is_winning) {
        play("win");
        set_show_confetti(true);
      } else {
        play("lose");
        trigger_game_result();
      }
    }, 2000);
  }, [
    selected_index,
    is_interaction_disabled,
    is_completed,
    content_expired,
    play,
    stop,
    trigger_game_result,
  ]);

  const handle_start = useCallback(() => {
    if (
      content_expired ||
      is_completed ||
      is_sold_out ||
      is_interaction_disabled
    )
      return;
    if (!has_accepted_rules) {
      set_is_rules_accept_modal_open(true);
      return;
    }
    execute_game();
  }, [
    content_expired,
    is_completed,
    is_sold_out,
    is_interaction_disabled,
    has_accepted_rules,
    execute_game,
  ]);

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

      {show_confetti && selected_index !== null && (
        <WidgetConfetti
          text={promos[selected_index]?.title}
          colors={[theme_primary!, theme_secondary!, theme_accent!]}
          duration={3}
          on_animation_end={() => {
            set_show_confetti(false);
            trigger_game_result();
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
        widget_display_usage={widget_display_usage}
        widget_visit_usage={widget_visit_usage}
        widget_visitor_index={visitor_index ?? 0}
      >
        <div className="relative w-full h-full flex flex-col items-center">
          <div className="w-full text-center px-4 pt-6 pb-4 z-10">
            <WidgetHeadings
              title={text1}
              sub_title={text2}
              theme_primary={theme_primary!}
              theme_line_height={parseFloat(theme_line_height!)}
            />
          </div>

          <div className="flex-1 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              {game_state === "idle" ? (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-48 h-48 rounded-full border-4 border-dashed flex items-center justify-center text-lg font-bold text-center p-4"
                  style={{ borderColor: theme_primary, color: theme_primary }}
                >
                  {text5}
                </motion.div>
              ) : (
                <motion.div
                  key="playing"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: 3, ease: "linear" }}
                  className="w-48 h-48 rounded-full border-8 flex items-center justify-center"
                  style={{ borderColor: theme_primary }}
                />
              )}
            </AnimatePresence>
          </div>

          <WidgetStartOverlay
            is_open={game_state === "idle"}
            show_start={!is_completed}
            on_start={handle_start}
            loading={select_promo_loading || is_interaction_disabled}
            sold_out={is_sold_out}
            expired={content_expired}
            theme_primary={theme_primary!}
            theme_secondary={theme_secondary!}
            theme_accent={theme_accent}
            content_language={content_language}
            cta={text7}
            label={text3}
            instruction={text5}
            method={selection_method}
            plays={widget_display_usage}
            rank={visitor_index ?? undefined}
            promos={promos}
          />
        </div>
      </WidgetLayoutContent>

      <WidgetUnifiedResultModal
        is_open={is_winning_modal_open || is_losing_modal_open}
        on_close={handle_close}
        promo={selected_index !== null ? promos[selected_index] : undefined}
        theme_primary={theme_primary!}
        theme_secondary={theme_secondary!}
        theme_accent={theme_accent}
        theme_line_height={theme_line_height}
        content_language={content_language}
        collection_method={collection_method}
        collection_method_placement={collection_method_placement}
        loading={select_promo_loading}
        on_submit={(data) =>
          handle_post_game_submit(data.value, data.terms_accepted)
        }
        modal_title={text4}
        input_label={text8}
        submit_button_text={text10}
        validation_error_text={text14}
        terms_text={terms_text}
        terms_link={terms_link}
        selection_method={selection_method}
        widget_display_usage={widget_display_usage}
        widget_visit_usage={widget_visit_usage}
        widget_visitor_index={visitor_index ?? 0}
        selected_promo={selected_promo}
        on_round_id_copy={handle_claim_win_id}
        on_round_id_fetch={() => {
          send_interaction_finished_event(widget_id, selected_index, promos);
        }}
      />

      {!content_expired && (
        <WidgetRulesAcceptModal
          is_open={is_rules_accept_modal_open}
          on_accept={() => {
            send_consent_game_start(widget_id);
            handle_accept_rules();
            execute_game();
          }}
          on_view_full_rules={handle_view_full_rules_from_accept}
          widget_rules={WIDGET_RULES}
          engine_rules={ENGINE_RULES}
          theme_primary={theme_primary!}
          theme_secondary={theme_secondary!}
          theme_accent={theme_accent}
          theme_line_height={theme_line_height}
          content_language={content_language}
        />
      )}
    </WidgetBaseContainer>
  );
};

export default SpinWheelTest;
