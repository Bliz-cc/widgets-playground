import { SpinningWheelGame } from "./widgets/spinning-wheel-game/spinning-wheel-game-content";
import { SCHEMA } from "./widgets/spinning-wheel-game/spinning-wheel-game-schema";
import { TEMPLATE_PROMOS } from "./utils/promos";
import DynamicWidgetWrapper from "./wrapper";

const Game = () => {
  return (
    <DynamicWidgetWrapper
      {...SCHEMA}
      promos={TEMPLATE_PROMOS}
      Component={SpinningWheelGame}
    />
  );
};

export default Game;
