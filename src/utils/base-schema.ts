import {
  COLLECTION_METHOD_ENUM,
  COLLECTION_METHOD_PLACEMENT_ENUM,
  CONTENT_LANGUAGE_ENUM,
  type WidgetView,
} from "@blizcc/ui";

/**
 * BASE_SCHEMA — Platform-level defaults.
 *
 * These are fields required by the WidgetView interface but are
 * owned by the platform (backend/runtime). Developers do NOT need
 * to touch these when building a new game widget.
 *
 * In production, these values are populated by the backend API.
 * In the playground, they are provided here as sane defaults.
 */
export const BASE_SCHEMA: WidgetView = {
  // ---- Identity (populated by backend in production) ----
  widget_id: "dev-widget",
  link_id: "mock_link",
  slug: "try-your-luck",

  // ---- Platform Config ----
  content_language: CONTENT_LANGUAGE_ENUM.ENGLISH,
  collection_method: COLLECTION_METHOD_ENUM.PHONE,
  collection_method_placement: COLLECTION_METHOD_PLACEMENT_ENUM.AFTER_PLAY,

  // ---- Runtime Flags ----
  preview_mode: false,
  content_expired: false,

  // ---- URLs ----
  short_url: "",
  original_url: "",

  // ---- Promos (injected at runtime) ----
  promos: [],

  // ---- Terms (set per campaign) ----
  terms_text: "I accept the terms and conditions.",
  terms_link: "https://example.com/terms",

  // ---- Prize Instructions ----
  prize_claim_instructions: [],
  theme_primary: "",
  theme_secondary: "",
  theme_line_height: "",
};
