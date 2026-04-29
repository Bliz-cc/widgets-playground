import {
  COLLECTION_METHOD_ENUM,
  COLLECTION_METHOD_PLACEMENT_ENUM,
  CONTENT_LANGUAGE_ENUM,
  type WidgetView,
} from "@blizcc/ui";

export const SCHEMA: WidgetView = {
  // ---- Identity ----
  widget_id: "mbtes",
  link_id: "mock_link",
  slug: "try-your-luck",

  // ---- Theme ----
  theme_primary: "#7c3aed",
  theme_secondary: "#4b5563",
  theme_accent: "#f472b6",
  theme_line_height: "1.4",

  // ---- Content ----
  text1: "Play to Win",                    // Heading
  text2: "Try your luck and win prizes!",  // Sub-heading
  text3: "Play Now",                        // CTA Button
  text4: "Congratulations!",                // Win Modal Title
  text5: "Tap to play",                     // Instruction
  text7: "Ready to play?",                  // Overlay Heading
  text8: "Your phone number",               // Input Label
  text10: "Thanks for submitting!",         // Post-submit
  text11: "We'll send your prize to",       // Success Desc
  text14: "Enter a valid phone number",     // Validation Error

  // ---- Data & Config ----
  promos: [],
  content_language: CONTENT_LANGUAGE_ENUM.ENGLISH,
  collection_method: COLLECTION_METHOD_ENUM.PHONE,
  collection_method_placement: COLLECTION_METHOD_PLACEMENT_ENUM.AFTER_PLAY,
  preview_mode: false,
  content_expired: false,
  short_url: "",
  original_url: "",
};
