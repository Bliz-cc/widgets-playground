/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  type FC,
  useState,
  useCallback,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

// =============================================================
// @blizcc/ui — Standard Interfaces
// =============================================================
import {
  type DynamicWidgetView,
  WidgetHeadings,
  WidgetLayoutContent,
} from "@blizcc/ui";

// =============================================================
// WIDGET TEMPLATE COMPONENT
// =============================================================
export const WidgetTemplate: FC<DynamicWidgetView> = (props) => {
  const {
    theme_primary,
    theme_accent,
    theme_secondary,
    theme_line_height,
    text1,
    text2,
    text3,
    text5,
    widget_visitor_index,
    is_rules_accepted,
    show_winning_popup,
    show_losing_popup,
    show_rules_popup,
    play_audio,
    stop_audio,
    preview_state_override,
    fetch_promo_idx,
  } = props;

  // Game State
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
  
  // ===========================================================
  // PREVIEW OVERRIDES
  // ===========================================================
  useEffect(() => {
    if (preview_state_override) {
      if (preview_state_override === "idle" || preview_state_override === "playing") {
        setGameState(preview_state_override as any);
      }
    }
  }, [preview_state_override]);

  // ===========================================================
  // GAME LOGIC
  // ===========================================================
  const executeGame = useCallback(async () => {
    setGameState("playing");
    play_audio("playing");

    // 1. Fetch result from backend
    // This marks the session as started on the server
    const winningIndex = await fetch_promo_idx();
    console.log("Winning Index:", winningIndex);

    // 2. Simulate animation
    setTimeout(() => {
      stop_audio("playing");
      
      // 3. Determine outcome (mock logic based on winningIndex)
      // If winningIndex corresponds to a default promo, it's a loss
      const isWin = winningIndex !== null; // Simplified for template
      
      if (isWin) {
        play_audio("win");
        setGameState("finished");
        show_winning_popup();
      } else {
        play_audio("lose");
        setGameState("idle");
        show_losing_popup();
      }
    }, 2000);
  }, [fetch_promo_idx, play_audio, stop_audio, show_winning_popup, show_losing_popup]);

  const startGame = useCallback(() => {
    if (!is_rules_accepted) {
      show_rules_popup();
      return;
    }
    executeGame();
  }, [is_rules_accepted, show_rules_popup, executeGame]);

  // CASE 1. Auto-start game once rules are accepted from parent component
  useEffect(() => {
    if (is_rules_accepted && gameState === "idle") {
      executeGame();
    }
  }, [is_rules_accepted, gameState, executeGame]);

  return (
    <WidgetLayoutContent
      theme_primary={theme_primary!}
      theme_secondary={theme_secondary!}
      theme_accent={theme_accent}
      theme_line_height={theme_line_height}
      content_expired={false}
      widget_visitor_index={widget_visitor_index ?? 0}
    >
      <div className="relative w-full h-full flex flex-col items-center pt-8 px-6">
        {/* Standard Widget Headings */}
        <WidgetHeadings
          title={text1}
          sub_title={text2}
          theme_primary={theme_primary!}
          theme_line_height={parseFloat(theme_line_height!)}
        />

        {/* Game Area */}
        <div className="flex-1 w-full flex items-center justify-center">
           <AnimatePresence mode="wait">
            {gameState === "idle" ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-48 h-48 rounded-full border-4 border-dashed flex items-center justify-center text-center p-4"
                style={{ borderColor: theme_primary, color: theme_primary }}
              >
                <p className="font-bold uppercase tracking-widest">{text5 || "Ready?"}</p>
              </motion.div>
            ) : (
              <motion.div
                key="playing"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-32 h-32 border-t-4 rounded-full"
                style={{ borderTopColor: theme_accent }}
              />
            )}
           </AnimatePresence>
        </div>

        {/* Action Button */}
        <div className="w-full pb-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startGame}
            disabled={gameState === "playing"}
            className="w-full py-6 rounded-3xl font-black text-2xl italic text-white uppercase tracking-tighter shadow-xl"
            style={{ 
              backgroundColor: theme_primary,
              opacity: gameState === "playing" ? 0.5 : 1,
              boxShadow: `0 0 30px ${theme_primary}44`
            }}
          >
            {text3 || "Start Game"}
          </motion.button>
        </div>
      </div>
    </WidgetLayoutContent>
  );
};

export default WidgetTemplate;
