import {
  COLLECTION_METHOD_ENUM,
  COLLECTION_METHOD_PLACEMENT_ENUM,
  CONTENT_LANGUAGE_ENUM,
  type WidgetView,
} from "@blizcc/ui";

export const SCHEMA: WidgetView = {
  widget_id: "anime-mystery-case",
  link_id: "mock_link",
  slug: "mystery-case",
  theme_primary: "#a855f7",   // Anime Purple
  theme_secondary: "#0f0a1e", // Deep Void
  theme_accent: "#f0abfc",    // Sakura Pink
  theme_line_height: "1.2",
  text1: "MYSTERY CASE",
  text2: "Stop the reel on LEGENDARY to win!",
  text3: "OPEN CASE",
  text4: "LEGENDARY DROP!",
  text5: "Tap STOP when your item is in the window",
  text7: "READY YOUR SPIRIT?",
  text8: "Your email, traveller",
  text10: "CLAIM LOOT",
  text11: "Your legendary item is summoned.",
  text14: "Invalid email",
  terms_text: "I accept the summon terms and conditions.",
  terms_link: "https://example.com/anime-terms",
  promos: [],
  content_language: CONTENT_LANGUAGE_ENUM.ENGLISH,
  collection_method: COLLECTION_METHOD_ENUM.EMAIL,
  collection_method_placement: COLLECTION_METHOD_PLACEMENT_ENUM.AFTER_PLAY,
  preview_mode: false,
  content_expired: false,
  short_url: "",
  original_url: "",
};
