import { TEMPLATE_PROMOS } from "./utils/promos";
import SpinWheelTest from "./widgets/spin-wheel-test/content";
import { SCHEMA } from "./widgets/spin-wheel-test/schema";


const App = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <SpinWheelTest {...SCHEMA} promos={TEMPLATE_PROMOS} preview_mode={true} />
    </div>
  );
};

export default App;
