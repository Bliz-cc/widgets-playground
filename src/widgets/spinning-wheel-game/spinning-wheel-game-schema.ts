import { TEMPLATE_PROMOS } from "../../utils/promos";

/**
 * Spinning Wheel Game — Developer Schema
 *
 * Only define what your game needs:
 *   - Theme colors
 *   - Segment colors
 *   - Content strings (text labels)
 *   - Promos (wheel segments)
 *   - Preview toggle
 *
 * Platform defaults (widget_id, collection config, terms, etc.)
 * are provided by BASE_SCHEMA and injected by the wrapper at runtime.
 */
export const GAME_CONFIG = {
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
  text1: "SPIN TO WIN", // Heading
  text2: "Spin the wheel to win", // Sub-heading
  text3: "Spin now", // CTA button
  text4: "Congratulations!", // Win modal title
  text5: "Tap the button to start", // Instruction
  text7: "Ready to play?", // Start overlay heading
  text8: "Your phone", // Input label
  text10: "Thanks for submitting!", // Post-submit message
  text11: "We'll send your prize to", // Success description
  text14: "Enter valid phone number", // Validation error

  promos: TEMPLATE_PROMOS,
  // ---- Dev Toggles ----
  preview_mode: false,
};
