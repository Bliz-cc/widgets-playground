import {
  COLLECTION_METHOD_ENUM,
  COLLECTION_METHOD_PLACEMENT_ENUM,
  CONTENT_LANGUAGE_ENUM,
  type WidgetView,
} from "@blizcc/ui";

export const SCHEMA: WidgetView = {
  // ---- Identity ----
  widget_id: "discount-catcher-bundle",
  link_id: "mock_link",
  slug: "discount-catcher",

  // ---- Theme ----
  theme_primary: "#f43f5e", // Rose 500
  theme_secondary: "#0f172a", // Slate 900
  theme_accent: "#fbbf24", // Amber 400
  theme_line_height: "1.2",

  // ---- Content ----
  text1: "DISCOUNT CATCHER",
  text2: "Catch falling deals to build your custom bundle!",
  text3: "START CATCHING",
  text4: "BUNDLE COMPLETE!",
  text5: "Move your basket to catch items",
  text8: "Enter Email to Claim Bundle",
  text10: "GET MY DISCOUNT",
  text11: "Check your inbox for the bundle code!",

  // ---- Data & Config ----
  promos: [],
  content_language: CONTENT_LANGUAGE_ENUM.ENGLISH,
  collection_method: COLLECTION_METHOD_ENUM.EMAIL,
  collection_method_placement: COLLECTION_METHOD_PLACEMENT_ENUM.AFTER_PLAY,
  preview_mode: false,
  content_expired: false,
  short_url: "",
  original_url: "",
  terms_text: "I agree to the terms and conditions.",
  terms_link: "https://example.com/terms",
};
