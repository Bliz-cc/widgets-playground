import {
  COLLECTION_METHOD_ENUM,
  COLLECTION_METHOD_PLACEMENT_ENUM,
  CONTENT_LANGUAGE_ENUM,
  type WidgetView,
} from "@blizcc/ui";

export const SCHEMA: WidgetView = {
  widget_id: "mma-power-strike",
  link_id: "mock_link",
  slug: "power-strike",
  theme_primary: "#dc2626",   // Fighter Red
  theme_secondary: "#1c1917", // Dark Mat
  theme_accent: "#fbbf24",    // Gold Belt
  theme_line_height: "1.2",
  text1: "POWER STRIKE",
  text2: "Hit the KO zone for maximum damage!",
  text3: "STRIKE!",
  text4: "K.O.!",
  text5: "Wait for the power meter to enter the RED zone",
  text7: "STEP INTO THE RING",
  text8: "Fighter email",
  text10: "CLAIM PRIZE",
  text11: "Your belt is on its way.",
  text14: "Invalid entry",
  terms_text: "I accept the fight rules and terms.",
  terms_link: "https://example.com/mma-terms",
  promos: [],
  content_language: CONTENT_LANGUAGE_ENUM.ENGLISH,
  collection_method: COLLECTION_METHOD_ENUM.EMAIL,
  collection_method_placement: COLLECTION_METHOD_PLACEMENT_ENUM.AFTER_PLAY,
  preview_mode: false,
  content_expired: false,
  short_url: "",
  original_url: "",
};
