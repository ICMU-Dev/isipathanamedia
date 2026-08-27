import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Newspaper, Calendar } from "lucide-react";
import ImageWithLoader from "../ui/ImageWithLoader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedBg from "../ui/AnimatedBg";
import { useData } from "../../context/DataContext";
import iconLogo from "../../assets/image.png";

gsap.registerPlugin(ScrollTrigger);

const getExcerpt = (item) => {
  const content = item.content || item.description || "";
  return String(content).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const NewsSection = () => {
  const { news, isLoadingNews } = useData();
  const sectionRef = useRef(null);

  // Show the three most recent public articles or updates together.
  const recentNews = news
    ?.filter((n) => n.status === "published" && n.visibility === "public")
    ?.sort((a, b) => new Date(b.date) - new Date(a.date))
    ?.slice(0, 3) || [];

  useEffect(() => {
    if (!isLoadingNews && recentNews.length > 0) {
      const ctx = gsap.context(() => {
        gsap.from(".news-header > *", {
          y: 30,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".news-header",
            start: "top 80%",
          },
        });

        gsap.from(".news-card", {
          y: 40,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".news-grid",
            start: "top 75%",
          },
        });
      }, sectionRef);

      return () => ctx.revert();
    }
  }, [isLoadingNews, recentNews]);

  return (
    <section
      ref={sectionRef}
      id="news"
      className="relative py-24 md:py-32 text-white bg-[#010104] overflow-hidden min-h-[100dvh] flex flex-col justify-center"
    >
      <AnimatedBg variant="news" />

      <div className="container relative z-10 px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="news-header flex flex-col md:flex-row items-center justify-between gap-6 mb-16 border-b border-white/[0.06]  pb-8">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-theme-accent  tracking-[0.4em] uppercase text-xs font-black">
              Latest Updates
            </h2>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter uppercase leading-none">
              News & Articles
            </h1>
          </div>
          
          <Link
            to="/news"
            className="group flex items-center gap-3 px-6 py-3 bg-white/[0.03] hover:bg-theme-accent text-white hover:text-black rounded-full borderborder-white/[0.06]  hover:border-theme-accent transition-all duration-300 font-bold uppercase tracking-widest text-xs"
          >
            <span>View All News</span>
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-black/20 group-hover:translate-x-1 transition-transform">
              <ArrowRight size={12} />
            </div>
          </Link>
        </div>

        {/* Status Handling */}
        {isLoadingNews && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-white/5 border-t-theme-accent rounded-full animate-spin"></div>
            <p className="text-xs uppercase tracking-widest text-theme-accent /80 font-bold animate-pulse">
              Loading Updates...
            </p>
          </div>
        )}

        {/* Posts Grid */}
        {!isLoadingNews && recentNews.length > 0 && (
          <div className="news-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentNews.map((item) => (
              <Link 
                to={`/news/${item.id}`} 
                key={item.id}
                className="news-card group relative rounded-2xl bg-[#09090b] border border-white/[0.06]  overflow-hidden hover:border-white/[0.2] transition-colors duration-500 flex flex-col h-full"
              >
                {/* Image Container */}
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <ImageWithLoader 
                      src={item.image} 
                      alt={item.title}
                      imageClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/5 text-[9px] font-bold uppercase tracking-widest text-white">
                    {item.type === "update" ? "Update" : item.category || "Article"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-theme-accent  transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/50 line-clamp-3 mb-6 font-light leading-relaxed">
                    {getExcerpt(item)}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/[0.06] ">
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                      <Calendar size={12} />
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-theme-accent group-hover:text-black transition-colors">
                      <ArrowRight size={10} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoadingNews && recentNews.length === 0 && (
          <div className="text-center py-24 text-white/40 uppercase tracking-widest font-bold text-sm bg-white/[0.02] rounded-3xl border border-white/[0.06] ">
            No recent news articles published yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
