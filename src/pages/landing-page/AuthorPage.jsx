import React, { useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  Clock,
  Play,
  ArrowRight,
  BadgeCheck,
  Hash,
  PenTool,
  BookOpen,
  EyeOff,
  Link as LinkIcon
} from "lucide-react";
import AnimatedBg from "../../components/ui/AnimatedBg";
import SEO from "../../components/SEO";
import ImageWithLoader from "../../components/ui/ImageWithLoader";
import iconLogo from "../../assets/image.png";
import loadingLogo from "../../assets/main-logos.png";
import { getPublicAuthorName, isInstitutionAuthor } from "../../utils/authorUtils";

const AuthorPage = () => {
  const { authorName: urlAuthorName } = useParams();
  const decodedAuthorName = decodeURIComponent(urlAuthorName || "");
  const { news, fetchNews, webUsers, fetchWebUsers, isFetching, loading } = useData();
  const { user } = useAuth();
  
  const userRole = user?.role?.toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'super_admin' || userRole === 'super-admin' || userRole === 'superadmin';

  const isLoadingNews = (isFetching || loading) && (!news || news.length === 0);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    Promise.all([fetchNews(true), fetchWebUsers()]);
  }, [fetchNews, fetchWebUsers]);

  const isICMU = isInstitutionAuthor(decodedAuthorName);
  const displayAuthorName = getPublicAuthorName(decodedAuthorName);

  const authorNews = useMemo(() => {
    return (news || [])
      .filter((n) => {
        const isOwnContent = user?.id === n.submitted_by;
        
        if (isAdmin || isOwnContent) {
           return true; 
        }
        return n.status === "published" && n.visibility === "public";
      })
      .filter((n) => {
        return isICMU
          ? isInstitutionAuthor(n.author)
          : getPublicAuthorName(n.author) === displayAuthorName;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [news, isICMU, displayAuthorName, isAdmin, user?.id]);

  const articles = authorNews.filter((n) => n.type !== "update");

  const getReadingTime = (content) => {
    const text = content ? content.replace(/<[^>]*>/g, "") : "";
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const authorInitials = displayAuthorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const ArticleCard = ({ item }) => {
    return (
      <div
        onClick={() => navigate(`/news/${item.id}`)}
        className="group cursor-pointer flex flex-col bg-white/[0.02] border border-white/[0.06]  rounded-3xl overflow-hidden hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 shadow-lg hover:shadow-2xl">
        <div className="relative w-full aspect-video overflow-hidden bg-[#050505]">
          <ImageWithLoader
            src={item.image}
            alt={item.title}
            imageClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
          />
        </div>
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold tracking-widest text-theme-accent  uppercase bg-theme-accent/10 px-3 py-1 rounded-full border border-theme-accent/20">
              {item.category || "News"}
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <h3 className="text-xl font-black text-white/90 group-hover:text-white leading-snug line-clamp-2 mb-4 tracking-tight">
            {item.title}
          </h3>

          <div className="mt-auto pt-6 border-t border-white/[0.06] flex items-center justify-between text-white/40 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Clock size={12} /> {getReadingTime(item.content)} MIN
              </span>
            </div>
            <span className="group-hover:text-theme-accent  transition-colors flex items-center gap-1.5">
              Read <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white font-sans relative pt-20 md:pt-28 pb-24 overflow-hidden">
      <SEO
        title={`${displayAuthorName} - Author Profile`}
        description={`Articles by ${displayAuthorName}`}
        path={`/author/${urlAuthorName}`}
      />
      <AnimatedBg variant="landing" />

      <div className="container mx-auto max-w-5xl relative z-10 px-4">
        {/* Navigation */}
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-white/50 hover:text-theme-accent  text-[10px] uppercase tracking-[0.3em] font-bold transition-colors mb-10 md:mb-16">
          <ArrowLeft size={14} /> Back to News
        </Link>

        {/* Author Header Profile */}
        <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.06] p-8 md:p-12 mb-16 overflow-hidden backdrop-blur-sm shadow-2xl">
          {/* Abstract Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-theme-accent/10 blur-[100px] rounded-full pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">
            {/* Author Avatar */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-black border-2 border-white/5 flex items-center justify-center overflow-hidden shadow-2xl rotate-0 transition-transform duration-500">
                {isICMU ? (
                  <img
                    src={iconLogo}
                    alt="ICMU Logo"
                    className="w-full h-full object-cover "
                  />
                ) : (
                  <span className="text-4xl md:text-5xl font-black text-white/50 tracking-tighter">
                    {authorInitials}
                  </span>
                )}
              </div>
              {isICMU && (
                <div className="absolute -bottom-2 -right-0 w-10 h-10 bg-theme-accent rounded-full flex items-center justify-center shadow-lg shadow-theme-accent/30 border-4 border-[#050505]">
                  <BadgeCheck size={20} className="text-black" />
                </div>
              )}
            </div>

            {/* Author Details */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]  mb-4 text-theme-accent  text-[10px] font-bold uppercase tracking-widest mx-auto md:mx-0 w-fit">
                <PenTool size={12} /> Writer Profile
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 leading-none">
                {displayAuthorName}
              </h1>
              <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-2xl font-light">
                {isICMU
                  ? "The official media unit of Isipathana College. Bringing you the latest news, updates, and stories from our institution directly to your screen."
                  : `A dedicated writer and contributor to the Isipathana College Media Unit, sharing unique perspectives and comprehensive coverage.`}
              </p>

              <div className="mt-8 flex items-center gap-6 justify-center md:justify-start">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">
                    {articles.length}
                  </span>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                    Articles Published
                  </span>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">100%</span>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                    Dedication
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Author's Articles Grid */}
        <div>
          <div className="flex items-center gap-3 mb-10 border-b border-white/[0.06] pb-6">
            <BookOpen className="text-theme-accent " size={24} />
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Published Works
            </h2>
          </div>

          {isLoadingNews ? (
            <div className="py-24 md:py-32 flex flex-col items-center justify-center min-h-[40vh] animate-in fade-in duration-700">
              <div className="relative w-16 h-16 md:w-20 md:h-20 mb-6">
                <img
                  src={loadingLogo}
                  alt="Loading..."
                  className="w-full h-full object-contain opacity-60 animate-pulse"
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] animate-pulse">
                  Loading Articles
                </h3>
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.06]  flex items-center justify-center mb-6">
                <PenTool size={24} className="text-white/20" />
              </div>
              <h3 className="text-xl font-bold text-white/80 mb-2">
                No articles found
              </h3>
              <p className="text-white/40 text-sm max-w-xs">
                This author hasn't published any full articles yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} item={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorPage;
