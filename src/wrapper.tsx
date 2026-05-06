/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  type FC,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  WidgetBaseContainer,
  WidgetFullscreenToggle,
  WidgetConfetti,
  WidgetSuccessOverlay,
  WidgetErrorOverlay,
  WidgetUnifiedResultModal,
  WidgetRulesAcceptModal,
  useGetVisitorIndex,
  useFullscreen,
  useGameRules,
  usePromoAutoSelect,
  useGameSession,
  usePreviewStateOverride,
  useAudio,
  useSubmitWidgetEvents,
  WidgetEventType,
} from "@blizcc/ui";
import type { WidgetView, DynamicWidgetView } from "@blizcc/ui";

interface WrapperProps extends WidgetView {
  Component: FC<DynamicWidgetView>;
}

const DynamicWidgetWrapper: FC<WrapperProps> = (props) => {
  const { Component, ...config } = props;

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
  } = useGameRules(config.preview_mode);

  // ===========================================================
  // STEP 4: PRIZE SELECTION
  // ===========================================================
  const {
    selected_index,
    select_promo_loading,
    selected_promo,
    select_promo_error,
  } = usePromoAutoSelect({
    widget_id: config.widget_id,
    link_id: config.link_id,
    preview_mode: config.preview_mode,
    content_expired: config.content_expired,
    promos_length: config.promos.length,
    skip_fetch: is_interaction_disabled || visitor_index_loading,
  });

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
  } = useSubmitWidgetEvents(config.preview_mode);

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
    widget_id: config.widget_id,
    promos: config.promos,
    selected_index,
    on_close_cleanup: is_fullscreen ? toggle_fullscreen : undefined,
    auto_skip_delay: 4000,
  });

  // ===========================================================
  // STEP 8: PREVIEW STATE & OVERRIDES
  // ===========================================================
  const [show_confetti, set_show_confetti] = useState(false);

  usePreviewStateOverride({
    preview_mode: config.preview_mode,
    preview_state_override: config.preview_state_override,
    on_win_state: () => {
      set_is_winning_modal_open(true);
    },
    on_lose_state: () => {
      set_is_losing_modal_open(true);
    },
  });

  // ===========================================================
  // STEP 9: DYNAMIC PROPS MAPPING
  // ===========================================================

  const winningIndexResolveRef = useRef<((idx: number) => void) | null>(null);

  useEffect(() => {
    if (selected_index !== null && winningIndexResolveRef.current) {
      winningIndexResolveRef.current(selected_index);
      winningIndexResolveRef.current = null;
    }
  }, [selected_index]);

  const fetch_winning_index = useCallback(async () => {
    if (selected_index !== null) return selected_index;
    return new Promise<number>((resolve) => {
      winningIndexResolveRef.current = resolve;
    });
  }, [selected_index]);

  const dynamicProps: DynamicWidgetView = {
    ...config,
    widget_visitor_index: visitor_index ?? 0,
    is_rules_accepted: has_accepted_rules,
    require_rules_consent: () => set_is_rules_accept_modal_open(true),
    fetch_winning_index,
    show_winning_popup: () => {
      const is_winning =
        selected_index !== null && !config.promos[selected_index]?.is_default;
      if (is_winning) {
        set_show_confetti(true);
      } else {
        trigger_game_result();
      }
    },
    show_losing_popup: () => {
      trigger_game_result();
    },
    track_event: (event, payload) => {
      if (event === WidgetEventType.WIDGET_INTERACTION) {
        send_interaction_event(
          config.widget_id,
          selected_index ?? 0,
          config.promos,
        );
      } else if (event === WidgetEventType.WIDGET_CONSENT_GAME_START) {
        send_consent_game_start(config.widget_id);
      } else if (event === WidgetEventType.WIDGET_INTERACTION_FINISHED) {
        send_interaction_finished_event(
          config.widget_id,
          selected_index ?? 0,
          config.promos,
        );
      }
    },
    play_audio: (track) => play(track),
    stop_audio: (track) => stop(track),
  };

  // ===========================================================
  // RENDER
  // ===========================================================
  return (
    <WidgetBaseContainer ref={element_ref} is_fullscreen={is_fullscreen}>
      {/* Component is responsible for its own layout and background */}
      <Component {...dynamicProps} />

      <WidgetFullscreenToggle
        is_fullscreen={is_fullscreen}
        on_toggle={toggle_fullscreen}
        theme_primary={config.theme_primary!}
        is_mobile={is_mobile}
        is_ios={is_ios}
      />

      {show_confetti && selected_index !== null && (
        <WidgetConfetti
          text={config.promos[selected_index]?.title}
          colors={[
            config.theme_primary!,
            config.theme_secondary!,
            config.theme_accent!,
          ]}
          duration={3}
          on_animation_end={() => {
            set_show_confetti(false);
            trigger_game_result();
          }}
        />
      )}

      {is_completed && (
        <WidgetSuccessOverlay
          theme_primary={config.theme_primary!}
          theme_secondary={config.theme_secondary!}
          customer={lead_data}
          message={config.text11 || ""}
        />
      )}

      {(select_promo_error || is_rate_limited) && (
        <WidgetErrorOverlay
          error_type={is_rate_limited ? "RESERVED" : "GENERIC"}
          original_url={config.original_url}
          theme_primary={config.theme_primary!}
          theme_secondary={config.theme_secondary!}
          content_language={config.content_language}
        />
      )}

      <WidgetUnifiedResultModal
        is_open={is_winning_modal_open || is_losing_modal_open}
        on_close={handle_close}
        promo={
          selected_index !== null ? config.promos[selected_index] : undefined
        }
        theme_primary={config.theme_primary!}
        theme_secondary={config.theme_secondary!}
        theme_accent={config.theme_accent}
        theme_line_height={config.theme_line_height}
        content_language={config.content_language}
        collection_method={config.collection_method}
        collection_method_placement={config.collection_method_placement}
        loading={select_promo_loading}
        on_submit={(data) =>
          handle_post_game_submit(data.value, data.terms_accepted)
        }
        modal_title={config.text4}
        input_label={config.text8}
        submit_button_text={config.text10}
        validation_error_text={config.text14}
        terms_text={config.terms_text}
        terms_link={config.terms_link}
        selection_method={config.selection_method}
        widget_display_usage={config.widget_display_usage}
        widget_visit_usage={config.widget_visit_usage}
        widget_visitor_index={visitor_index ?? 0}
        selected_promo={selected_promo}
        on_round_id_copy={handle_claim_win_id}
        on_round_id_fetch={() => {
          send_interaction_finished_event(
            config.widget_id,
            selected_index ?? 0,
            config.promos,
          );
        }}
      />

      {!config.content_expired && (
        <WidgetRulesAcceptModal
          is_open={is_rules_accept_modal_open}
          on_accept={() => {
            send_consent_game_start(config.widget_id);
            handle_accept_rules();
          }}
          on_view_full_rules={handle_view_full_rules_from_accept}
          widget_rules={(config as any).widget_rules}
          engine_rules={(config as any).engine_rules}
          theme_primary={config.theme_primary!}
          theme_secondary={config.theme_secondary!}
          theme_accent={config.theme_accent}
          theme_line_height={config.theme_line_height}
          content_language={config.content_language}
        />
      )}
    </WidgetBaseContainer>
  );
};

export default DynamicWidgetWrapper;
