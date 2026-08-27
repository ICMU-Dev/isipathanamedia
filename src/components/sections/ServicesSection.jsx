import { motion } from "framer-motion";
import React from "react";
import { Link } from "react-router-dom";
import {
  Mic2,
  ArrowRight,
  Image as ImageIcon,
  PenLine,
  PlayCircleIcon,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import serviceAnnouncingImg from "../../assets/landing-page/serv-1.jpg";
import serviceScriptingImg from "../../assets/landing-page/serv-2.jpg";
import serviceTechnicalImg from "../../assets/landing-page/serv-3.jpg";

const permanentServices = [
  {
    id: "service-announcing",
    title: "Announcing & Compering",
    description:
      "Bringing life to events with professional voice-over, live compering, and expert announcing services.",
    assetKey: "service_announcing_img",
    icon: Mic2,
    defaultImg: serviceAnnouncingImg,
    color: "from-emerald-500/20 to-emerald-500/0",
    glow: "group-hover:shadow-emerald-500/20",
  },
  {
    id: "service-scripting",
    title: "Scripting & Content",
    description:
      "Crafting compelling narratives, creative scripts, and digital content that resonates with your audience.",
    assetKey: "service_scripting_img",
    icon: PenLine,
    defaultImg: serviceScriptingImg,
    color: "from-blue-500/20 to-blue-500/0",
    glow: "group-hover:shadow-blue-500/20",
  },
  {
    id: "service-technical",
    title: "Technical Support",
    description:
      "Seamless technical execution, live-stream management, and high-end multimedia production.",
    assetKey: "service_technical_img",
    icon: PlayCircleIcon,
    defaultImg: serviceTechnicalImg,
    color: "from-purple-500/20 to-purple-500/0",
    glow: "group-hover:shadow-purple-500/20",
  },
];

const ServicesSection = () => {
  const { assets } = useData();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 36, scale: 0.97 },
    visible: {
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section
      id="services"
      className="relative min-h-[100dvh] py-24 md:py-32 flex items-center bg-black overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary-neon/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-primary-neon/5 blur-3xl rounded-full pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="section-container relative z-10 w-full">
        <div className="max-w-4xl mx-auto mb-16 text-center space-y-6">
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-3">
            <span className="text-primary-neon text-[10px] font-bold uppercase tracking-[0.6em]">
              Our Expertise
            </span>
            <div className="w-12 h-px bg-primary-neon/40" />
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold text-white tracking-tighter uppercase leading-[0.9]">
            What we do
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {permanentServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              image={assets[service.assetKey] || service.defaultImg}
              variants={itemVariants}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

const ServiceCard = ({ service, image, variants }) => (
  <motion.div
    variants={variants}
    className="group relative min-h-[460px] rounded-2xl overflow-hidden bg-zinc-900 border border-white/[0.06]  hover:border-white/20 transition-all duration-500">
    {/* Background Image with Overlay */}
    <div className="absolute inset-0 z-0">
      {image ? (
        <img
          src={image}
          alt={service.title}
          className="w-full h-full object-cover opacity-20 grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-40"
        />
      ) : (
        <div className="w-full h-full bg-zinc-800 flex items-center justify-center opacity-10">
          <ImageIcon size={64} />
        </div>
      )}
      <div
        className={`absolute inset-0 bg-gradient-to-t via-black/40 to-transparent ${service.color} opacity-60 group-hover:opacity-80 transition-opacity`}
      />
      <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
    </div>

    {/* Content */}
    <div className="relative z-10 h-full p-8 flex flex-col justify-end">
      <div className="mb-auto">
        <div
          className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-primary-neon group-hover:bg-primary-neon group-hover:text-black transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(0,255,0,0.3)]`}>
          <service.icon size={28} strokeWidth={1.5} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-3xl font-bold text-white tracking-tight leading-tight group-hover:text-primary-neon transition-colors duration-500">
          {service.title}
        </h3>
        <p className="text-sm text-zinc-400 font-medium leading-relaxed uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
          {service.description}
        </p>
      </div>
    </div>
  </motion.div>
);

export default ServicesSection;
