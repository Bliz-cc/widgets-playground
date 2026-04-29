import {
  COLLECTION_METHOD_ENUM,
  COLLECTION_METHOD_PLACEMENT_ENUM,
  CONTENT_LANGUAGE_ENUM,
  type WidgetView,
} from "@blizcc/ui";

export const SCHEMA: WidgetView = {
  // ---- Identity ----
  widget_id: "fun-email-subscribe-retro",
  link_id: "mock_link",
  slug: "try-your-luck",

  // ---- Theme ----
  theme_primary: "#ff00ff", // Retro Magenta
  theme_secondary: "#00ffff", // Cyber Cyan
  theme_accent: "#ffff00", // 8-bit Yellow
  theme_line_height: "1.2",

  // ---- Content ----
  text1: "JOIN THE QUEST",                    // Heading
  text2: "Level up your inbox with daily loot!",  // Sub-heading
  text3: "INSERT COIN",                        // CTA Button
  text4: "WINNER!",                // Win Modal Title
  text5: "Enter your email address",                     // Instruction
  text7: "READY PLAYER ONE?",                  // Overlay Heading
  text8: "Your coordinates (email)",               // Input Label
  text10: "DATA SECURED!",         // Post-submit
  text11: "Check your neural link (inbox) soon",       // Success Desc
  text14: "INVALID PROTOCOL",     // Validation Error
  terms_text: "I ACCEPT THE QUEST TERMS",
  terms_link: "https://example.com/retro-terms",

  // ---- Data & Config ----
  promos: [],
  content_language: CONTENT_LANGUAGE_ENUM.ENGLISH,
  collection_method: COLLECTION_METHOD_ENUM.EMAIL,
  collection_method_placement: COLLECTION_METHOD_PLACEMENT_ENUM.BEFORE_PLAY,
  preview_mode: false,
  content_expired: false,
  short_url: "",
  original_url: "",
};
