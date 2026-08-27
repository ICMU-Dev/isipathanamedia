import React from "react";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import highlightImage from "../../assets/landing-page/nethinethera.jpg";
const SpotlightSection = () => {
  const content = {
    subtitle: "The Spotlight",
    title: "Nethinethera",
    description:
      "Nethinethera, organized by the Isipathana College Media Unit, is an annual convergence of media excellence. It serves as a flagship platform where talent meets professional insight, fostering the next generation of storytellers and trilingual media specialists.",
  };

  return (
    <section
      id="spotlight"
      className="overflow-hidden relative flex flex-col justify-center h-[100dvh] text-white bg-ambient">
      {/* Immersive Parallax Background Text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.01] select-none pointer-events-none">
        <div className="text-[25vw] font-black font-palingu2">fk;sfkf;r</div>
      </div>

      <div className="container flex relative z-10 flex-col flex-1 justify-center px-4 mx-auto md:px-6 lg:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-8 items-center lg:grid-cols-2 md:gap-12">
            <div className="space-y-6 md:space-y-8 animate-fade-in-right">
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-8 h-px bg-primary-neon/40"></div>
                  <h2 className="text-primary-neon tracking-[0.5em] uppercase text-[10px] font-black">
                    {content.subtitle}
                  </h2>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[0.85] tracking-tighter uppercase">
                  {content.title}
                </h1>
              </div>

              <p className="max-w-xl text-base font-light leading-relaxed text-gray-400 md:text-lg">
                {content.description}
              </p>

              <div className="pt-6 md:pt-10">
                <Link
                  to="/nethinethera"
                  className="group relative inline-flex items-center gap-4 px-8 md:px-12 py-4 md:py-6 bg-white text-dark font-black rounded-2xl text-[10px] uppercase tracking-[0.4em] transition-all hover:scale-[1.05] active:scale-95 overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-700 ease-out translate-y-full bg-primary-neon group-hover:translate-y-0"></div>
                  <span className="flex relative z-10 gap-4 items-center font-black">
                    Enter Experience
                    <ArrowRight
                      size={20}
                      className="transition-transform duration-500 group-hover:translate-x-3"
                    />
                  </span>
                </Link>
              </div>
            </div>

            <div className="hidden relative animate-fade-in-left lg:block">
              <div className="relative z-10 p-2 glass rounded-2xl border border-white/5 shadow-3xl group">
                <div className="rounded-2xl overflow-hidden relative aspect-video">
                  <img
                    src={highlightImage}
                    alt="Nethinethera Event"
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform [transition-duration:2s] ease-out opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t via-transparent opacity-60 transition-opacity duration-1000 from-dark/90 to-primary-neon/10 group-hover:opacity-40"></div>
                  <div className="absolute inset-0 opacity-0 blur-3xl transition-opacity duration-1000 pointer-events-none bg-primary-neon/5 group-hover:opacity-100"></div>
                </div>

                <div className="absolute bottom-10 left-10 z-20">
                  <div className="flex gap-6 items-center text-white transition-transform duration-700 group-hover:translate-x-4">
                    <div className="flex justify-center items-center w-14 h-14 rounded-2xl border shadow-2xl backdrop-blur-sm bg-primary-neon/20 border-primary-neon/30 text-primary-neon shadow-primary-neon/20">
                      <Star size={28} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">
                        Signature
                      </p>
                      <p className="text-xl font-black tracking-tight uppercase">
                        Event of the Year
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Atmospheric Elements
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary-neon/10 rounded-full blur-[100px] animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-primary-neon/5 rounded-full blur-[120px]"></div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Visual Element */}
      <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-96 h-96 bg-primary-neon/5 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
    </section>
  );
};

export default SpotlightSection;
