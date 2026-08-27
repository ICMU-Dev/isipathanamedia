import { motion } from "framer-motion";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Award, Camera } from "lucide-react";
import gsap from "gsap";
import Footer from "../../components/ui/Footer";
import SEO from "../../components/SEO";

// Real image paths from public subdirectories
const aboutImages = [
  "IMG-20260223-WA0026.jpg",
  "IMG-20260223-WA0032.jpg",
  "IMG-20260223-WA0058.jpg",
  "IMG-20260223-WA0059.jpg",
  "IMG-20260223-WA0060.jpg",
  "IMG-20260223-WA0063.jpg",
  "IMG-20260223-WA0064.jpg",
  "IMG-20260223-WA0065.jpg",
].map((img) => `/about/${img}`);

const sandhwaniImages = [
  "IMG-20260223-WA0024.jpg",
  "IMG-20260223-WA0025.jpg",
  "IMG-20260223-WA0027.jpg",
  "IMG-20260223-WA0028.jpg",
  "IMG-20260223-WA0029.jpg",
  "IMG-20260223-WA0030.jpg",
  "IMG-20260223-WA0031.jpg",
  "IMG-20260223-WA0037.jpg",
].map((img) => `/sandhwani/${img}`);

const nethinetheraImages = [
  "IMG-20260223-WA0033.jpg",
  "IMG-20260223-WA0034.jpg",
  "IMG-20260223-WA0035.jpg",
  "IMG-20260223-WA0036.jpg",
  "IMG-20260223-WA0040.jpg",
  "IMG-20260223-WA0042.jpg",
  "IMG-20260223-WA0044.jpg",
  "IMG-20260223-WA0052.jpg",
].map((img) => `/nethinethera/${img}`);

const stats = [
  { value: "600+", label: "Members", icon: <Users size={18} /> },
  { value: "25+", label: "Years of Service", icon: <Award size={18} /> },
  {
    value: "1000+",
    label: "Events Covered Annually",
    icon: <Camera size={18} />,
  },
];

const SeamlessMasonryCollage = ({ images, side = "right" }) => {
  return (
    <div
      className={`columns-1 md:columns-2 lg:columns-2 gap-0 relative ${side === "right" ? "md:pl-0" : "md:pr-0"}`}>
      {images.slice(0, 10).map((src, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{
            scale: 1.05,
            zIndex: 20,
            transition: { duration: 0.4 },
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.05,
            ease: "easeOut",
          }}
          viewport={{ once: true }}
          className="relative overflow-hidden group break-inside-avoid">
          <img
            src={src}
            alt={`Portfolio item ${i + 1}`}
            className="w-full h-auto block transition-all [transition-duration:1.5s] grayscale-[0.2] group-hover:grayscale-0"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=500";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </motion.div>
      ))}
    </div>
  );
};

const SectionHeader = ({ subtitle, title, titleAccent }) => (
  <div className="space-y-4 mb-8">
    <div className="flex items-center gap-3">
      <div className="w-8 h-px bg-primary-neon/50"></div>
      <p className="text-primary-neon text-[10px] uppercase tracking-[0.5em] font-black">
        {subtitle}
      </p>
    </div>
    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-white">
      {title} <br />
      <span className="text-primary-neon">{titleAccent}</span>
    </h2>
  </div>
);

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      gsap.from(".reveal-text", {
        y: 40,
        opacity: 0,
        duration: 1.5,
        stagger: 0.1,
        ease: "power4.out",
      });

      gsap.from(".stat-card", {
        opacity: 0,
        y: 20,
        duration: 1,
        stagger: 0.1,
        delay: 0.8,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-black text-white font-sans overflow-x-hidden">
      <SEO
        title="About Us"
        description="Learn about Isipathana College Media Unit (ICMU) – 25+ years of media excellence, 600+ members, 1000+ events covered annually. Discover Sandhwani trilingual competition and Nethinethera – the media day."
        path="/about"
        keywords="Isipathana College Media Unit, ICMU, isipathana media, icmu about, isipathana college official website, isipathana media unit history, Sandhwani media competition, Nethinethera, nethinethera the media day, school media Sri Lanka, Isipathana College Colombo, isipathana collegee media unit website"
      />
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-900/10 blur-[150px] opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-primary-neon/5 blur-[120px] opacity-30"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-40 px-6 lg:px-20 min-h-[100dvh] flex flex-col justify-center">
          <div className="container mx-auto max-w-7xl">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-white/60 hover:text-primary-neon text-[9px] uppercase tracking-[0.5em] font-bold mb-20 transition-all group">
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Return
            </Link>

            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center">
              <div className="space-y-12">
                <div className="space-y-3">
                  <p className="text-primary-neon text-[9px] uppercase tracking-[0.6em] font-black opacity-80 reveal-text">
                    Established 1999
                  </p>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tighter uppercase reveal-text text-white">
                    Legacy of <br />
                    <span className="text-primary-neon italic">Excellence</span>
                  </h1>
                </div>

                <div className="max-w-xl reveal-text space-y-8">
                  <p className="text-white/80 text-xl md:text-2xl leading-tight font-light italic border-l-4 border-primary-neon/40 pl-8">
                    "No Sacrifice, No Victory" — A creed that has defined our
                    journey for 26 years.
                  </p>
                  <div className="space-y-6 text-white/80 text-base md:text-lg leading-relaxed font-light text-justify">
                    <p>
                      For a quarter of a century, the Isipathana Media Unit has
                      been a cornerstone of our school's vibrant culture,
                      capturing and sharing the stories that shape our
                      community. With a proud history spanning 26 years, we have
                      grown into a dynamic team of over 400 dedicated members
                      who bring passion, creativity, and professionalism to
                      every project.
                    </p>
                    <p>
                      Each year, we cover more than 1000 events, ensuring that
                      every significant moment is documented and shared with our
                      community. As we celebrate this milestone, we look forward
                      to continuing our legacy of excellence, innovation, and
                      unwavering commitment to capturing the spirit of
                      Isipathana College.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="stat-card p-5 md:p-6 border border-white/[0.06]  bg-white/[0.02] rounded-2xl hover:border-primary-neon/30 hover:bg-white/[0.04] transition-all duration-700 group flex flex-col justify-between aspect-square lg:h-36">
                    <div className="text-primary-neon/30 group-hover:text-primary-neon transition-colors mb-2">
                      {React.cloneElement(stat.icon, { size: 16 })}
                    </div>
                    <div>
                      <p className="text-3xl md:text-4xl font-black text-white leading-none tracking-tighter uppercase">
                        {stat.value}
                      </p>
                      <p className="text-[8px] uppercase tracking-[0.3em] font-black text-white/70 mt-2 group-hover:text-primary-neon transition-colors">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Introduction Portfolio */}
        <section className="py-40 border-y border-white/[0.06]  bg-white/[0.01]">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-20 items-center">
              <div className="space-y-10">
                <SectionHeader
                  subtitle="The Foundation"
                  title="Introduction of the"
                  titleAccent="Media Unit"
                />
                <div className="space-y-6 text-white/70 text-lg leading-relaxed text-justify font-light">
                  <p>
                    Our unit provides comprehensive coverage for all college
                    activities, ranging from high-stakes rugby matches to
                    prestigious academic ceremonies. We utilize
                    industry-standard equipment and software, ensuring that
                    every student involved gains practical experience that
                    translates directly to professional media environments.
                  </p>
                  <div className="p-8 border border-white/[0.06]  bg-black rounded-2xl">
                    <p className="text-sm italic">
                      The voice of the Green Machine, capturing the spirit and
                      triumphs of Isipathana College through cinematic precision
                      and modern storytelling.
                    </p>
                  </div>
                </div>
              </div>
              <SeamlessMasonryCollage images={aboutImages} />
            </div>
          </div>
        </section>

        {/* Sandhwani Section */}
        <section className="py-40 px-6 lg:px-20 relative overflow-hidden">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-20 items-center">
              <div className="order-2 lg:order-1">
                <SeamlessMasonryCollage images={sandhwaniImages} side="left" />
              </div>
              <div className="space-y-10 order-1 lg:order-2">
                <div className="space-y-4 mb-8">
                  <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">
                    Sandhwani
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-px bg-primary-neon/50"></div>
                    <p className="text-primary-neon text-[10px] uppercase tracking-[0.3em] font-black">
                      All Island Inter-School Trilingual Media Competition
                    </p>
                  </div>
                </div>
                <div className="space-y-6 text-white/80 text-base leading-relaxed text-justify font-light">
                  <p>
                    Building upon a long-standing legacy of creative excellence,
                    Sandhwani has firmly solidified its position as the premier
                    national platform for youth media in Sri Lanka. This
                    landmark event was distinguished by its unprecedented scale,
                    successfully bridging the gap between classroom theory and
                    the rigorous standards of the professional media industry.
                  </p>
                  <p>
                    Demonstrating its immense regional influence, the
                    inter-school segment attracted a record-breaking turnout of
                    over 1,000 participants from diverse educational
                    backgrounds, while the internal school community showed
                    unwavering support with a dedicated participation of more
                    than 350 members.
                  </p>
                  <p className="text-white/60 text-sm">
                    The significance of Sandhwani was further amplified by the
                    presence and endorsement of Sri Lankan media giants, whose
                    involvement provided students with invaluable exposure to
                    real-world expertise and professional networking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>



        <Footer />
      </div>
    </div>
  );
};

export default AboutPage;

