import {
  COLLECTION_METHOD_ENUM,
  COLLECTION_METHOD_PLACEMENT_ENUM,
  CONTENT_LANGUAGE_ENUM,
  type WidgetView,
} from "@blizcc/ui";

export const SCHEMA: WidgetView = {
  // ---- Identity ----
  widget_id: "spinning-wheel-game",
  link_id: "mock_link",
  slug: "spin-to-win",

  // ---- Theme ----
  theme_primary: "#8fb69a",
  theme_secondary: "#808ba7",
  theme_accent: "#f3cbc1",
  theme_line_height: "1.2",

  // ---- Segment Colors ----
  color1: "#8fb69a",
  color2: "#808ba7",
  color3: "#f3cbc1",
  color4: "#8fb69a",
  color5: "#8fb69a",
  color6: "#808ba7",
  color7: "#f3cbc1",
  color8: "#808ba7",

  // ---- Content ----
  text1: "SPIN TO WIN",
  text2: "Spin the wheel to reveal your prize",
  text3: "Spin now",
  text4: "Congratulations!",
  text5: "Tap start to play",
  text7: "Ready to play?",
  text8: "Your phone",
  text10: "Thanks for submitting!",
  text11: "We'll send your prize to",
  text14: "Enter valid phone number",

  // ---- Data & Config ----
  promos: [],
  content_language: CONTENT_LANGUAGE_ENUM.ENGLISH,
  collection_method: COLLECTION_METHOD_ENUM.PHONE,
  collection_method_placement: COLLECTION_METHOD_PLACEMENT_ENUM.AFTER_PLAY,
  preview_mode: false,
  content_expired: false,
  short_url: "",
  original_url: "",
  terms_text: "I accept the terms and conditions.",
  terms_link: "https://example.com/terms",
  prize_claim_instructions: [],
};
