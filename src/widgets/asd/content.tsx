export const Content = () => {
  return (
    <div id="asd-container" className="p-8 border border-white/10 rounded-3xl shadow-2xl bg-black/40 backdrop-blur-xl text-white">
      <h1 className="text-3xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Widget: asd
      </h1>
      <p className="text-white/60 text-lg leading-relaxed">
        This is a premium, dynamically generated component for the unique key: 
        <span className="ml-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-blue-300 font-mono">
          asd
        </span>
      </p>
      
      <div className="mt-8 grid grid-cols-1 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer">
          <div className="text-sm uppercase tracking-widest text-white/40 mb-1">Status</div>
          <div className="text-green-400 font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            Active and Ready
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
