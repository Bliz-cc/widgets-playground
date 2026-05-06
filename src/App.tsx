import { RetroAviatorContent } from "./widgets/retro-aviator-crash/retro-aviator-crash-content";
import { SCHEMA } from "./widgets/retro-aviator-crash/retro-aviator-crash-schema";
import { TEMPLATE_PROMOS } from "./utils/promos";
import DynamicWidgetWrapper from "./wrapper";

const Game = () => {
  return (
    <DynamicWidgetWrapper
      {...SCHEMA}
      promos={TEMPLATE_PROMOS}
      Component={RetroAviatorContent}
    />
  );
};

export default Game;
