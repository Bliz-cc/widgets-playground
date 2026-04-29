// Standard Variant
import FunEmailSubscribe from "./widgets/fun-email-subscribe/fun-email-subscribe-content";
import { SCHEMA as STANDARD_SCHEMA } from "./widgets/fun-email-subscribe/fun-email-subscribe-schema";

// Retro Quest Variant
import FunEmailSubscribeRetro from "./widgets/fun-email-subscribe-retro/fun-email-subscribe-retro-content";
import { SCHEMA as RETRO_SCHEMA } from "./widgets/fun-email-subscribe-retro/fun-email-subscribe-retro-schema";

// Retro Aviator
import RetroAviatorCrash from "./widgets/retro-aviator-crash/retro-aviator-crash-content";
import { SCHEMA as AVIATOR_SCHEMA } from "./widgets/retro-aviator-crash/retro-aviator-crash-schema";

// MMA Power Strike
import MmaPowerStrike from "./widgets/mma-power-strike/mma-power-strike-content";
import { SCHEMA as MMA_SCHEMA } from "./widgets/mma-power-strike/mma-power-strike-schema";

// Football Penalty
import FootballPenalty from "./widgets/football-penalty/football-penalty-content";
import { SCHEMA as FOOTBALL_SCHEMA } from "./widgets/football-penalty/football-penalty-schema";

// Anime Mystery Case
import AnimeMysteryCase from "./widgets/anime-mystery-case/anime-mystery-case-content";
import { SCHEMA as ANIME_SCHEMA } from "./widgets/anime-mystery-case/anime-mystery-case-schema";

import { WidgetPlayground, type WidgetDefinition } from "./components/WidgetPlayground";

const WIDGETS: WidgetDefinition[] = [
  { id: "standard",  name: "Fun Email Subscribe",    Component: FunEmailSubscribe,    schema: STANDARD_SCHEMA },
  { id: "retro",     name: "Retro Quest",            Component: FunEmailSubscribeRetro, schema: RETRO_SCHEMA },
  { id: "aviator",   name: "Retro Aviator Crash",    Component: RetroAviatorCrash,    schema: AVIATOR_SCHEMA },
  { id: "mma",       name: "MMA Power Strike",       Component: MmaPowerStrike,       schema: MMA_SCHEMA },
  { id: "football",  name: "Football Penalty Kick",  Component: FootballPenalty,      schema: FOOTBALL_SCHEMA },
  { id: "anime",     name: "Anime Mystery Case",     Component: AnimeMysteryCase,     schema: ANIME_SCHEMA },
];

const App = () => <WidgetPlayground widgets={WIDGETS} />;

export default App;
