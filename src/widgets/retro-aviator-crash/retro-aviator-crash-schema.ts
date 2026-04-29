import {
  COLLECTION_METHOD_ENUM,
  COLLECTION_METHOD_PLACEMENT_ENUM,
  CONTENT_LANGUAGE_ENUM,
  type WidgetView,
} from "@blizcc/ui";

export const SCHEMA: WidgetView = {
  // ---- Identity ----
  widget_id: "retro-aviator-crash",
  link_id: "mock_link",
  slug: "try-your-luck",

  // ---- Theme ----
  theme_primary: "#ff4d00", // Rocket Orange
  theme_secondary: "#000814", // Space Black
  theme_accent: "#00f2ff", // Plasma Blue
  theme_line_height: "1.2",

  // ---- Content ----
  text1: "RETRO AVIATOR",                    // Heading
  text2: "Reach maximum altitude without crashing!",  // Sub-heading
  text3: "LAUNCH MISSION",                        // CTA Button
  text4: "MISSION COMPLETE!",                // Win Modal Title
  text5: "HOLD TO CLIMB, RELEASE TO EJECT",                     // Instruction
  text7: "PREPARE FOR TAKE OFF",                  // Overlay Heading
  text8: "Neural ID (Email)",               // Input Label
  text10: "SUBMIT FLIGHT LOG",         // Post-submit
  text11: "Your loot is being processed.",       // Success Desc
  text14: "SYSTEM MALFUNCTION",     // Validation Error
  text16: "FLYING...",              // Active state
  text18: "DISTANCE",                // Metric label

  // ---- Data & Config ----
  promos: [],
  content_language: CONTENT_LANGUAGE_ENUM.ENGLISH,
  collection_method: COLLECTION_METHOD_ENUM.EMAIL,
  collection_method_placement: COLLECTION_METHOD_PLACEMENT_ENUM.AFTER_PLAY,
  preview_mode: false,
  content_expired: false,
  short_url: "",
  original_url: "",
  terms_text: "I accept the flight regulations and terms.",
  terms_link: "https://example.com/aviator-terms",
};
