import {
  COLLECTION_METHOD_ENUM,
  COLLECTION_METHOD_PLACEMENT_ENUM,
  CONTENT_LANGUAGE_ENUM,
  type WidgetView,
} from "@blizcc/ui";

export const SCHEMA: WidgetView = {
  // ---- Identity ----
  widget_id: "fuel-pump-challenge",
  link_id: "mock_link",
  slug: "fuel-pump",

  // ---- Theme ----
  theme_primary: "#10b981", // Emerald 500
  theme_secondary: "#064e3b", // Emerald 900
  theme_accent: "#facc15", // Yellow 400
  theme_line_height: "1.2",

  // ---- Content ----
  text1: "FUEL PUMP CHALLENGE",
  text2: "Hit the exact target to win a reward!",
  text3: "SELECT FUEL TYPE",
  text4: "TANK FILLED!",
  text5: "HOLD THE NOZZLE TO FILL UP",
  text8: "Email to claim your fuel discount",
  text10: "GET MY REWARD",
  text11: "Check your email for the voucher!",
  
  // ---- Game Config ----
  text16: "13.00", // Target litres
  text18: "LITRES", // Label

  // ---- Data & Config ----
  promos: [],
  content_language: CONTENT_LANGUAGE_ENUM.ENGLISH,
  collection_method: COLLECTION_METHOD_ENUM.EMAIL,
  collection_method_placement: COLLECTION_METHOD_PLACEMENT_ENUM.AFTER_PLAY,
  preview_mode: false,
  content_expired: false,
  short_url: "",
  original_url: "",
  terms_text: "I accept the station rules and terms.",
  terms_link: "https://example.com/fuel-terms",
};
