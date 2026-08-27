import { motion } from "framer-motion";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { NumberTicker } from "../ui/number-ticker";
import PrimaryButton from "../ui/PrimaryButton";
const AboutSection = () => {
  const content = useMemo(
    () => ({
      subtitle: "Voice of Isipathana",
      title: "About Us",
      description:
        "For a quarter of a century, the Isipathana Media has been a cornerstone of our school's vibrant culture, capturing and sharing the stories that shape our community.",
      features: [
        {
          icon: "Users",
          title: "+ Members",
          desc: "A dynamic force of storytellers.",
          value: 600,
        },
        { icon: "Award", title: "+ Years", desc: "Of excellence.", value: 25 },
        {
          icon: "Camera",
          title: "+ Events",
          desc: "Covered annually with precision.",
          value: 1000,
        },
      ],
    }),
    [],
  );

  return (
    <section
      id="about"
      className="flex overflow-hidden min-h-[100dvh] relative flex-col justify-center text-white bg-[#010104] py-24 md:py-32">
      <div className="container relative z-10 px-4 mx-auto md:px-6 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl w-full text-center md:space-y-16">
          <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col gap-3 items-center">
              <h2 className="text-primary-neon tracking-[0.8em] uppercase text-[10px] font-black opacity-60">
                {content.subtitle}
              </h2>
              <div className="w-12 h-px bg-primary-neon/40"></div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter uppercase leading-[0.9]">
              {content.title}
            </h1>

            <p className="mx-auto max-w-2xl text-base font-light leading-relaxed text-gray-400 md:text-xl lg:text-2xl mt-8">
              {content.description}
            </p>
          </div>

          <div className="flex flex-col gap-12 items-center md:gap-16 ">
            <div className="grid grid-cols-3 gap-8 md:gap-16 lg:gap-24 w-full max-w-4xl border-t border-white/[0.06]  pt-12">
              {content.features?.map((feature, i) => (
                <div key={i} className="space-y-3 group text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white transition-colors group-hover:text-primary-neon">
                    <NumberTicker
                      value={feature.value}
                      className="text-white"
                    />
                    {feature.title.split(" ")[0]}
                  </div>
                  <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white/70 transition-colors">
                    {feature.desc}
                  </div>
                </div>
              ))}
            </div>

            <PrimaryButton to="/about">
              Discover Our Story
            </PrimaryButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
