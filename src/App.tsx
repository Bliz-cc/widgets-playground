import { SpinningWheelGame } from "./widgets/spinning-wheel-game/spinning-wheel-game-content";
import { GAME_CONFIG } from "./widgets/spinning-wheel-game/spinning-wheel-game-schema";
import { BASE_SCHEMA } from "./utils/base-schema";
import DynamicWidgetWrapper from "./wrapper";

const SCHEMA = {
  ...BASE_SCHEMA,
  ...GAME_CONFIG,
  widget_id: "spinning-wheel-game",
};

const Game = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-slate-100">
      <DynamicWidgetWrapper
        {...SCHEMA}
        Component={SpinningWheelGame}
      />
    </div>
  );
};

export default Game;
