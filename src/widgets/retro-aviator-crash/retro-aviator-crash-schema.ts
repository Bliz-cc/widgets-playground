import { TEMPLATE_PROMOS } from "../../utils/promos";

/**
 * Retro Aviator Crash — Developer Schema
 *
 * Only define what your game needs:
 *   - Theme colors
 *   - Content strings (text labels)
 *   - Game config (altitude target, metric label)
 *   - Promos (prize pool)
 *   - Preview toggle
 *
 * Platform defaults (widget_id, collection config, terms, etc.)
 * are provided by BASE_SCHEMA and injected by the wrapper at runtime.
 */
export const GAME_CONFIG = {
  // ---- Theme ----
  theme_primary: "#ff4d00",   // Rocket Orange
  theme_secondary: "#000814", // Space Black
  theme_accent: "#00f2ff",    // Plasma Blue
  theme_line_height: "1.2",

  // ---- Content ----
  text1: "RETRO AVIATOR",                         // Heading
  text2: "Reach maximum altitude without crashing!", // Sub-heading
  text3: "LAUNCH MISSION",                         // CTA Button
  text4: "MISSION COMPLETE!",                      // Win Modal Title
  text5: "HOLD TO CLIMB, RELEASE TO EJECT",        // Instruction
  text7: "PREPARE FOR TAKE OFF",                   // Overlay Heading
  text8: "Neural ID (Email)",                      // Input Label
  text10: "SUBMIT FLIGHT LOG",                     // Post-submit
  text11: "Your loot is being processed.",         // Success Desc
  text14: "SYSTEM MALFUNCTION",                    // Validation Error

  // ---- Game Config ----
  // text16: target altitude the player must eject within (±3% win window)
  text16: "844.84",   // Target altitude — set this per campaign
  text18: "ALTITUDE", // Metric label shown above the counter

  // ---- Prize Pool ----
  promos: TEMPLATE_PROMOS,

  // ---- Dev Toggles ----
  preview_mode: false,

  // ---- Terms (game-specific) ----
  terms_text: "I accept the flight regulations and terms.",
  terms_link: "https://example.com/aviator-terms",
};
