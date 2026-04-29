// Standard Variant
import FunEmailSubscribe from "./widgets/fun-email-subscribe/fun-email-subscribe-content";
import { SCHEMA as STANDARD_SCHEMA } from "./widgets/fun-email-subscribe/fun-email-subscribe-schema";

// Retro Variant
import FunEmailSubscribeRetro from "./widgets/fun-email-subscribe-retro/fun-email-subscribe-retro-content";
import { SCHEMA as RETRO_SCHEMA } from "./widgets/fun-email-subscribe-retro/fun-email-subscribe-retro-schema";

// Retro Aviator Variant
import RetroAviatorCrash from "./widgets/retro-aviator-crash/retro-aviator-crash-content";
import { SCHEMA as AVIATOR_SCHEMA } from "./widgets/retro-aviator-crash/retro-aviator-crash-schema";

import {
  WidgetPlayground,
  type WidgetDefinition,
} from "./components/WidgetPlayground";

const WIDGETS: WidgetDefinition[] = [
  {
    id: "standard",
    name: "Standard Email",
    Component: FunEmailSubscribe,
    schema: STANDARD_SCHEMA,
  },
  {
    id: "retro",
    name: "Retro Quest",
    Component: FunEmailSubscribeRetro,
    schema: RETRO_SCHEMA,
  },
  {
    id: "aviator",
    name: "Retro Aviator",
    Component: RetroAviatorCrash,
    schema: AVIATOR_SCHEMA,
  },
];

const App = () => {
  return <WidgetPlayground widgets={WIDGETS} />;
};

export default App;
