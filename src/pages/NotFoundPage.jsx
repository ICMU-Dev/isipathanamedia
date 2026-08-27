import React from "react";
import { useNavigate } from "react-router-dom";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mb-16">
        {/* Icon & 404 Status */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-theme-accent/20 blur-2xl rounded-full"></div>
          <div className="relative p-6 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-sm">
            <FileQuestion
              size={64}
              className="text-theme-accent /80 stroke-[1.5]"
            />
          </div>
        </div>

        <h1 className="text-6xl font-konexy md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 tracking-tighter mb-4 drop-shadow-xl">
          404
        </h1>

        <h2 className="text-xl font-konexy md:text-2xl  text-white/90  tracking-widest uppercase mb-6">
          Signal Lost
        </h2>

        <p className="text-white/80 text-sm md:text-base leading-relaxed mb-10 font-mono">
          The quadrant you are trying to access does not exist or has been
          restricted. Verify your coordinates and try again, or return to the
          main hub.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl text-white/80 transition-all duration-300 backdrop-blur-sm">
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="font-mono text-xs tracking-[0.2em] uppercase">
              Go Back
            </span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-theme-accent/10 hover:bg-theme-accent/20 border border-theme-accent/20 hover:border-theme-accent/40 rounded-2xl text-theme-accent  transition-all duration-300 shadow-[0_0_15px_rgba(0,255,0,0.1)] hover:shadow-[0_0_25px_rgba(0,255,0,0.2)]">
            <Home
              size={16}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="font-mono text-xs tracking-[0.2em] uppercase">
              Main Hub
            </span>
          </button>
        </div>
      </div>

      {/* Footer terminal text */}
      <div className="absolute bottom-8 left-0 w-full text-center">
        <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/60">
          Proprietary Framework // Error_Code_404
        </span>
      </div>
    </div>
  );
}

export default NotFoundPage;
