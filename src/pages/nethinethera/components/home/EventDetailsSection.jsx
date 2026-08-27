import React from 'react';

const EventDetailsSection = () => {
  const details = [
    { label: "Date", value: "[ Awaiting Transmission ]", sub: "Schedule Pending Confirmation" },
    { label: "Time", value: "[ Sync Required ]", sub: "Chronology Locked" },
    { label: "Venue", value: "[ Coordinates Unknown ]", sub: "Location Data Encrypted" },
    { label: "Chief Guest", value: "[ Classified ]", sub: "Identity Verification Pending" }
  ];

  return (
    <section className="py-24 md:py-32 px-4 md:px-6 max-w-7xl mx-auto relative z-10 border-t border-white/[0.06] ">
      <div className="text-center mb-16">
        <h2 className="font-vhs text-3xl md:text-4xl text-white/90 tracking-tight">
          EVENT COORDINATES
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {details.map((detail, idx) => (
          <div key={idx} className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-sm text-center flex flex-col items-center justify-center min-h-[200px] hover:border-white/20 hover:-translate-y-1 transition-all duration-500 group">
            <span className="font-mono text-[10px] tracking-[0.2em] text-theme-accent /60 uppercase mb-5 group-hover:text-theme-accent  transition-colors">
              {detail.label}
            </span>
            <span className="font-vhs text-lg md:text-xl text-white/50 mb-3 tracking-wide group-hover:text-white/100 transition-all duration-500">
              {detail.value}
            </span>
            <span className="font-mono text-[10px] tracking-widest text-white/60 uppercase opacity-60">
              {detail.sub}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EventDetailsSection;
