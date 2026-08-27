import React from 'react';

const AgendaPreviewSection = () => {
  const schedule = [
    { time: "08:30", title: "Arrival & Registry", state: "completed" },
    { time: "09:00", title: "System Initialization", state: "current" },
    { time: "10:30", title: "The Narrative Frame", state: "upcoming" },
    { time: "13:00", title: "Awards & Consensus", state: "upcoming" }
  ];

  return (
    <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto border-t border-white/[0.06]  relative z-10">
      <div className="flex flex-col md:flex-row gap-16 md:gap-24">
        {/* Header Block */}
        <div className="md:w-1/3 flex flex-col items-start">
          <h2 className="font-vhs text-4xl text-white/90 tracking-tight mb-4">
            REAL-TIME AGENDA
          </h2>
          <p className="font-sans text-white/60 leading-relaxed text-sm md:text-base mb-8">
            The event timeline is synchronized across all terminals. The full operational agenda will unlock sequentially during the event.
          </p>
          <button className="font-mono text-xs tracking-[0.2em] text-white/80 hover:text-white uppercase border-b border-white/20 pb-1 transition-colors">
            View Full Timeline
          </button>
        </div>

        {/* Timeline Block */}
        <div className="md:w-2/3 flex flex-col relative">
          <div className="absolute left-[39px] top-4 bottom-4 w-px bg-white/10" />
          
          {schedule.map((item, idx) => (
            <div key={idx} className="relative flex items-center gap-6 md:gap-10 py-6 group">
              {/* Status indicator */}
              <div className="w-20 font-mono text-xs text-right tracking-widest text-white/80 shrink-0">
                {item.time}
              </div>
              
              <div className={`w-3 h-3 rounded-full relative z-10 shrink-0 border 
                ${item.state === 'current' ? 'border-theme-accent bg-theme-accent/20 shadow-[0_0_10px_rgba(0,255,0,0.3)]' : 
                  item.state === 'completed' ? 'border-white/30 bg-white/20' : 'border-white/20 bg-neutral-950'}`} 
              />
              
              <div className="flex-1 p-6 md:p-8 border border-white/5 rounded-2xl bg-white/[0.02] backdrop-blur-sm group-hover:bg-white/[0.04] group-hover:border-white/20 group-hover:-translate-y-[2px] transition-all duration-500 flex items-center justify-between shadow-2xl">
                <span className={`font-sans text-base md:text-xl tracking-wide ${item.state === 'upcoming' ? 'text-white/70' : 'text-white/90'}`}>
                  {item.title}
                </span>
                {item.state === 'current' && (
                  <span className="font-mono text-[9px] text-theme-accent /80 uppercase tracking-widest border border-theme-accent/50 px-2 py-1 bg-theme-accent/20">
                    Live
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgendaPreviewSection;
