/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { type FC, useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WidgetBaseContainer, WidgetLayoutContent, WidgetHeadings,
  WidgetFullscreenToggle, WidgetConfetti, WidgetSuccessOverlay,
  WidgetErrorOverlay, CONTENT_LANGUAGE_ENUM,
} from "@blizcc/ui";
import {
  useGetVisitorIndex, useFullscreen, usePromoAutoSelect, usePromoSoldOut,
  useGameSession, usePreviewStateOverride, useAudio, useSubmitWidgetEvents,
} from "@blizcc/ui";
import type { WidgetView } from "@blizcc/ui";

// ---- Game Constants ----
const GAME_WIDTH = 300;
const GAME_HEIGHT = 400;
const BASKET_WIDTH = 80;
const ITEM_SIZE = 40;
const SPAWN_RATE = 1000; // ms
const FALL_SPEED = 3; // px per tick (16ms)
const WIN_COUNT = 3;

interface CaughtItem {
  id: number;
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface FallingItem extends CaughtItem {
  x: number;
  y: number;
}

const ITEM_POOL = [
  { label: "Summer Tee", value: "20% OFF", icon: "👕", color: "#f43f5e" },
  { label: "Cool Shades", value: "15% OFF", icon: "🕶️", color: "#3b82f6" },
  { label: "Beach Hat", value: "10% OFF", icon: "👒", color: "#10b981" },
  { label: "Sunscreen", value: "5% OFF", icon: "🧴", color: "#f59e0b" },
  { label: "Flip Flops", value: "BOGO", icon: "🩴", color: "#8b5cf6" },
];

const DiscountCatcherBundle: FC<WidgetView> = ({
  widget_id, link_id, theme_primary, theme_secondary, theme_accent, theme_line_height,
  text1, text2, text3, text4, text5, text8, text10, text11,
  promos, original_url = "", content_expired,
  content_language = CONTENT_LANGUAGE_ENUM.ENGLISH,
  terms_link, terms_text, preview_mode, preview_state_override,
}) => {
  const { visitor_index, visitor_index_loading, is_rate_limited, is_interaction_disabled } = useGetVisitorIndex();
  const { element_ref, is_fullscreen, toggle_fullscreen, is_mobile, is_ios } = useFullscreen();
  const { selected_index, select_promo_loading, select_promo_error } = usePromoAutoSelect({
    widget_id, link_id, preview_mode, content_expired,
    promos_length: promos.length,
    skip_fetch: is_interaction_disabled || visitor_index_loading,
  });
  usePromoSoldOut(promos);
  const { send_interaction_event } = useSubmitWidgetEvents(preview_mode);
  const { is_completed, lead_data, handle_pre_game_submit } = useGameSession({
    widget_id, promos, selected_index,
    on_close_cleanup: is_fullscreen ? toggle_fullscreen : undefined,
  });

  const { play } = useAudio(useMemo(() => ({
    catch: { src: "/ui/catch.mp3", volume: 0.5, loop: false },
    win: { src: "/ui/win.mp3", volume: 0.5, loop: false },
  }), []));

  // ---- Game State ----
  const [phase, setPhase] = useState<"idle" | "playing" | "result">("idle");
  const [basketX, setBasketX] = useState(50); // 0-100%
  const [items, setItems] = useState<FallingItem[]>([]);
  const [caught, setCaught] = useState<CaughtItem[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const gameLoopRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<number | null>(null);
  const basketXRef = useRef(basketX);

  // Constants in % units
  const BASKET_WIDTH_PCT = 25;
  const ITEM_SIZE_PCT = 12;
  const FALL_SPEED_PCT = 0.8; // % per tick

  usePreviewStateOverride({
    preview_mode, preview_state_override,
    on_start_state: () => resetGame(),
    on_game_state: () => startGame(),
    on_win_state: () => { setPhase("result"); setShowResult(true); },
  });

  const resetGame = () => {
    setPhase("idle");
    setItems([]);
    setCaught([]);
    setBasketX(50 - BASKET_WIDTH_PCT / 2);
  };

  const startGame = useCallback(() => {
    if (is_interaction_disabled || is_completed || content_expired) return;
    setPhase("playing");
    setItems([]);
    setCaught([]);
    send_interaction_event(widget_id, selected_index ?? 0, promos);
  }, [is_interaction_disabled, is_completed, content_expired, selected_index, promos]);

  useEffect(() => {
    basketXRef.current = basketX;
  }, [basketX]);

  // Game Loop
  useEffect(() => {
    if (phase !== "playing") {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      return;
    }

    const update = () => {
      setItems((prevItems) => {
        const nextItems: FallingItem[] = [];
        let newlyCaught: CaughtItem | null = null;

        for (const item of prevItems) {
          const nextY = item.y + FALL_SPEED_PCT;

          // Check Collision with Basket (Basket is at ~85% Y)
          const basketTop = 85;
          const basketBottom = 92;
          if (
            nextY + ITEM_SIZE_PCT >= basketTop &&
            nextY <= basketBottom &&
            item.x + ITEM_SIZE_PCT >= basketXRef.current &&
            item.x <= basketXRef.current + BASKET_WIDTH_PCT
          ) {
            newlyCaught = { ...item };
            play("catch");
            continue;
          }

          if (nextY < 100) {
            nextItems.push({ ...item, y: nextY });
          }
        }

        if (newlyCaught) {
          setCaught((prevCaught) => {
            const nextCaught = [...prevCaught, newlyCaught!];
            if (nextCaught.length >= WIN_COUNT) {
              setPhase("result");
              play("win");
              setShowConfetti(true);
              setTimeout(() => setShowResult(true), 1000);
            }
            return nextCaught;
          });
        }

        return nextItems;
      });

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);

    spawnTimerRef.current = window.setInterval(() => {
      const template = ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)];
      const newItem: FallingItem = {
        ...template,
        id: Date.now() + Math.random(),
        x: Math.random() * (100 - ITEM_SIZE_PCT),
        y: -ITEM_SIZE_PCT,
      };
      setItems((prev) => [...prev, newItem]);
    }, 1000);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [phase]);

  const handleMove = (clientX: number, containerRect: DOMRect) => {
    const xPx = clientX - containerRect.left;
    const xPct = (xPx / containerRect.width) * 100 - BASKET_WIDTH_PCT / 2;
    setBasketX(Math.max(0, Math.min(100 - BASKET_WIDTH_PCT, xPct)));
  };

  return (
    <WidgetBaseContainer ref={element_ref} is_fullscreen={is_fullscreen}>
      {/* Playful Background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)" }}>
        <div className="absolute inset-0 opacity-10"
             style={{ backgroundImage: `radial-gradient(${theme_primary} 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />
      </div>

      <WidgetFullscreenToggle is_fullscreen={is_fullscreen} on_toggle={toggle_fullscreen}
        theme_primary={theme_primary!} is_mobile={is_mobile} is_ios={is_ios}/>
      
      {showConfetti && <WidgetConfetti text={text4} colors={[theme_primary!, theme_accent!, "#ffffff"]}
        duration={5} on_animation_end={() => setShowConfetti(false)}/>}

      {is_completed && <WidgetSuccessOverlay theme_primary={theme_primary!} theme_secondary={theme_secondary!}
        customer={lead_data} message={text11 || ""}/>}

      {(select_promo_error || is_rate_limited) && <WidgetErrorOverlay
        error_type={is_rate_limited ? "RESERVED" : "GENERIC"} original_url={original_url}
        theme_primary={theme_primary!} theme_secondary={theme_secondary!} content_language={content_language}/>}

      <WidgetLayoutContent theme_primary={theme_primary!} theme_secondary={theme_secondary!}
        theme_accent={theme_accent} theme_line_height={theme_line_height}
        content_expired={content_expired} widget_visitor_index={visitor_index ?? 0}>
        
        <div className="relative w-full h-full flex flex-col items-center px-4 pt-6 pb-4">
          <WidgetHeadings title={text1} sub_title={text2}
            theme_primary={theme_primary!} theme_line_height={parseFloat(theme_line_height!)}/>

          {/* Caught Summary */}
          <div className="flex gap-2 mt-2 mb-4 h-12">
            {Array.from({ length: WIN_COUNT }).map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-xl bg-white/5 overflow-hidden">
                {caught[i] ? (
                  <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}>
                    {caught[i].icon}
                  </motion.span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Game Area */}
          <div 
            className="relative flex-1 w-full bg-black/20 rounded-2xl border border-white/5 overflow-hidden cursor-none touch-none"
            onMouseMove={(e) => handleMove(e.clientX, e.currentTarget.getBoundingClientRect())}
            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
          >
            {phase === "idle" && !is_completed && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 rounded-full font-black text-lg uppercase tracking-wider text-white shadow-xl"
                  style={{ backgroundColor: theme_primary, boxShadow: `0 0 20px ${theme_primary}66` }}>
                  {text3}
                </motion.button>
                <p className="mt-4 text-[10px] text-white/40 uppercase tracking-[0.2em]">{text5}</p>
              </div>
            )}

            {/* Falling Items */}
            <AnimatePresence>
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="absolute pointer-events-none flex flex-col items-center"
                  style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${ITEM_SIZE_PCT}%` }}
                >
                  <span className="text-2xl sm:text-3xl drop-shadow-lg">{item.icon}</span>
                  <div className="text-[7px] font-black bg-black/60 px-1 rounded text-white whitespace-nowrap mt-1">
                    {item.value}
                  </div>
                </div>
              ))}
            </AnimatePresence>

            {/* Basket */}
            <motion.div 
              className="absolute bottom-6 h-12 rounded-xl flex items-center justify-center text-3xl z-10"
              animate={{ x: `${basketX}%` }}
              transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.5 }}
              style={{ width: `${BASKET_WIDTH_PCT}%`, backgroundColor: `${theme_primary}44`, border: `2px solid ${theme_primary}`, boxShadow: `0 0 15px ${theme_primary}44` }}
            >
              🛒
              <div className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2" style={{ borderColor: theme_primary }}>
                {caught.length}
              </div>
            </motion.div>
          </div>

          <p className="mt-4 text-[9px] font-mono uppercase tracking-[0.2em] text-white/20 text-center">
            Catch {WIN_COUNT} items to complete your bundle
          </p>
        </div>
      </WidgetLayoutContent>

      {/* Result / Lead Modal */}
      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm bg-slate-900 border-2 rounded-3xl p-8 flex flex-col items-center"
              style={{ borderColor: theme_accent, boxShadow: `0 0 40px ${theme_accent}33` }}>
              
              <div className="text-4xl mb-4">🎁</div>
              <h2 className="text-2xl font-black italic uppercase text-center mb-1 text-white">
                {text4}
              </h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest text-center mb-6">
                You built a custom bundle with {caught.length} items!
              </p>

              {/* Bundle Summary */}
              <div className="w-full bg-white/5 rounded-2xl p-4 mb-6 space-y-3">
                {caught.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-white/80">{item.label}</p>
                      <p className="text-[8px] font-bold" style={{ color: theme_accent }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full space-y-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={text8} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 font-mono text-sm text-white outline-none focus:border-white/30 transition-colors"/>
                
                <div className="flex items-start gap-3 px-1">
                  <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 w-4 h-4 accent-amber-400"/>
                  <p className="text-[10px] leading-snug text-white/50 uppercase">
                    {terms_text} {terms_link && <a href={terms_link} target="_blank" className="underline text-white">[READ]</a>}
                  </p>
                </div>

                <button onClick={() => handle_pre_game_submit(email, termsAccepted)}
                  className="w-full py-5 rounded-xl font-black italic text-xl uppercase tracking-tighter text-black shadow-xl active:scale-95 transition-transform"
                  style={{ background: `linear-gradient(to bottom, ${theme_accent}, #d97706)`, boxShadow: `0 10px 25px -5px ${theme_accent}66` }}>
                  {text10}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </WidgetBaseContainer>
  );
};

export default DiscountCatcherBundle;
