import {
  COLLECTION_METHOD_ENUM,
  COLLECTION_METHOD_PLACEMENT_ENUM,
  CONTENT_LANGUAGE_ENUM,
  type WidgetView,
} from "@blizcc/ui";

export const SCHEMA: WidgetView = {
  // ---- Identity ----
  widget_id: "fun-email-subscribe",
  link_id: "mock_link",
  slug: "subscribe-and-win",

  // ---- Theme ----
  theme_primary: "#7c3aed",
  theme_secondary: "#4b5563",
  theme_accent: "#f472b6",
  theme_line_height: "1.4",

  // ---- Content ----
  text1: "Stay in the Loop",                    // Heading
  text2: "Join our newsletter and get exclusive perks!",  // Sub-heading
  text3: "Subscribe",                           // CTA Button / Submit Button
  text4: "You're In!",                          // Success Title
  text5: "Enter your email below",              // Input Placeholder
  text7: "Join Now",                            // Overlay Heading (unused)
  text8: "Email Address",                       // Input Label
  text10: "Subscribe Now",                      // Secondary Submit (unused)
  text11: "Check your inbox for a surprise!",    // Success Description
  text14: "Please enter a valid email",         // Validation Error

  // ---- Data & Config ----
  promos: [],
  content_language: CONTENT_LANGUAGE_ENUM.ENGLISH,
  collection_method: COLLECTION_METHOD_ENUM.EMAIL,
  collection_method_placement: COLLECTION_METHOD_PLACEMENT_ENUM.BEFORE_PLAY,
  preview_mode: false,
  content_expired: false,
  short_url: "",
  original_url: "",
  terms_text: "By subscribing, you agree to our privacy policy.",
  terms_link: "https://example.com/privacy",
};
