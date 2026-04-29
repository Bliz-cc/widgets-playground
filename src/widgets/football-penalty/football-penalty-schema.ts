import {
  COLLECTION_METHOD_ENUM,
  COLLECTION_METHOD_PLACEMENT_ENUM,
  CONTENT_LANGUAGE_ENUM,
  type WidgetView,
} from "@blizcc/ui";

export const SCHEMA: WidgetView = {
  widget_id: "football-penalty",
  link_id: "mock_link",
  slug: "penalty-kick",
  theme_primary: "#16a34a",   // Pitch Green
  theme_secondary: "#052e16", // Dark Stadium
  theme_accent: "#ffffff",    // Ball White
  theme_line_height: "1.2",
  text1: "PENALTY KICK",
  text2: "Outsmart the goalkeeper — pick your spot!",
  text3: "SHOOT!",
  text4: "GOAL!",
  text5: "Watch the keeper — shoot when they dive the wrong way",
  text7: "TAKE THE PENALTY",
  text8: "Your email",
  text10: "CLAIM REWARD",
  text11: "Your reward is heading your way!",
  text14: "Invalid email",
  terms_text: "I accept the penalty rules and terms.",
  terms_link: "https://example.com/football-terms",
  promos: [],
  content_language: CONTENT_LANGUAGE_ENUM.ENGLISH,
  collection_method: COLLECTION_METHOD_ENUM.EMAIL,
  collection_method_placement: COLLECTION_METHOD_PLACEMENT_ENUM.AFTER_PLAY,
  preview_mode: false,
  content_expired: false,
  short_url: "",
  original_url: "",
};
