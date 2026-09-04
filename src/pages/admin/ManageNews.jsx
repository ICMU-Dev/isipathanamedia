import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DOMPurify from 'dompurify';
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  Search,
  CheckCircle,
  FileText,
  Clock,
  Link as LinkIcon,
  UserPen,
  MoreVertical,
  LayoutGrid,
  List as ListIcon,
  Columns3,
  CheckSquare,
  Square,
  Filter,
  X,
  Image as ImageIcon,
  Newspaper,
  Zap,
  Inbox,
  BadgeCheck,
  Hourglass,
  Ban,
  PenTool,
  Eye,
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  BarChart2,
  Copy,
  Check,
  ExternalLink,
  Globe,
  EyeOff,
  Smartphone,
  Laptop,
  FileEdit,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

import NewsListView from "../../components/admin/NewsListView";
import NewsBoardView from "../../components/admin/NewsBoardView";
import NewsCalendarView from "../../components/admin/NewsCalendarView";
import NewsGridView from "../../components/admin/NewsGridView";
import {
  resolveAuthorInfo,
} from "../../components/admin/NewsUtils";
import iconLogo from "../../assets/image.png";
import { MorphingModal } from "../../components/motion/morphing-modal";
import ImageWithLoader from "../../components/ui/ImageWithLoader";
import ContentSkeleton from "../../components/admin/ContentSkeleton";
import { useArticleAnalytics } from '../../hooks/admin/useArticleAnalytics';

const ManageNews = () => {
  const { analytics, loading: analyticsLoading, fetchAnalytics, clearAnalytics } = useArticleAnalytics();
  const {
    news,
    deleteNews,
    fetchNews,
    updateNews,
    deleteManyNews,
    updateManyNews,
    webUsers = [],
    fetchWebUsers,
    loading: isLoadingNews,
  } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { adminPath } = useParams();

  const userRole = user?.role?.toLowerCase();
  const isSuperAdmin =
    userRole === "super_admin" ||
    userRole === "super-admin" ||
    userRole === "superadmin";
  const isAdmin = isSuperAdmin || userRole === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(
    isAdmin ? "articles" : "published",
  ); // admins: articles, updates, pending. writers: published, pending, draft.
  const [viewMode, setViewMode] = useState("grid"); // 'grid', 'list', 'board'
  const [boardGroupBy, setBoardGroupBy] = useState("status"); // 'status', 'author'
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  
  // Needs Attention Modal State
  const [needsAttentionModal, setNeedsAttentionModal] = useState({ isOpen: false, id: null, message: "" });

  // Bulk Selection State
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterSubmitter, setFilterSubmitter] = useState("All");
  const [filterAuthor, setFilterAuthor] = useState("All");

  // Quick View State
  const [viewingArticle, setViewingArticle] = useState(null);
  const [modalView, setModalView] = useState("options");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchNews();
    if (fetchWebUsers) fetchWebUsers();
  }, [fetchNews, fetchWebUsers]);

  useEffect(() => {
    if (modalView === 'view' && viewingArticle?.id && viewingArticle.type !== 'update') {
      fetchAnalytics(viewingArticle.id);
    }
    return () => clearAnalytics();
  }, [modalView, viewingArticle?.id, viewingArticle?.type, fetchAnalytics, clearAnalytics]);

  const handleEdit = (id) => {
    const article = news.find(
      (n) => n.id === id || n.id?.toString() === id?.toString(),
    );
    if (article?.type?.toLowerCase() === "update") {
      navigate(`/${adminPath}/dashboard/news/edit-update/${id}`);
    } else {
      navigate(`/${adminPath}/dashboard/news/edit/${id}`);
    }
  };

  const handleDelete = async (id) => {
    const item = news.find((n) => n.id === id);
    if (!isAdmin && item?.submitted_by !== user?.id) {
      toast.error("You can only delete your own articles.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteNews(id);
      toast.success("Item deleted successfully.");
    }
  };

  const handleApprove = async (id) => {
    if (!isAdmin) {
      toast.error("Only admins can approve articles.");
      return;
    }
    if (window.confirm("Approve and publish this article?")) {
      await updateNews(id, {
        status: "published",
      });
      toast.success("Article published successfully.");
    }
  };

  const handleNeedsAttentionOpen = (id) => {
    if (!isAdmin) {
      toast.error("Only admins can review articles.");
      return;
    }
    setNeedsAttentionModal({ isOpen: true, id, message: "" });
  };

  const submitNeedsAttention = async () => {
    if (!needsAttentionModal.message.trim()) {
      toast.error("Please provide a review message.");
      return;
    }
    
    const article = news.find(n => n.id === needsAttentionModal.id);
    if (!article) return;
    
    const existingNotes = Array.isArray(article.review_notes) ? article.review_notes : [];
    const newNote = {
      by: user?.id,
      name: user?.name || user?.username || 'Admin',
      message: needsAttentionModal.message,
      at: new Date().toISOString()
    };
    
    await updateNews(needsAttentionModal.id, { 
      needs_attention: true,
      review_notes: [...existingNotes, newNote]
    });
    
    toast.info("Article returned for attention.");
    setNeedsAttentionModal({ isOpen: false, id: null, message: "" });
  };

  const handleResolveReview = async (id) => {
    if (isAdmin) return;

    await updateNews(id, {
      needs_attention: false,
      status: "pending",
    });
    toast.success("Changes submitted for review.");
    setViewingArticle(null);
    setTimeout(() => setModalView("options"), 300);
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Extract unique values for advanced filters
  const uniqueCategories = [
    "All",
    ...new Set(news.map((n) => n.category).filter(Boolean)),
  ];
  const uniqueSubmitters = [
    "All",
    ...new Set(news.map((n) => n.submitted_by).filter(Boolean)),
  ];
  const uniqueAuthors = [
    "All",
    ...new Set(news.map((n) => n.author).filter(Boolean)),
  ];

  // Filter based on tabs & search & advanced filters
  const filteredData = news.filter((item) => {
    // Draft privacy - nobody sees other people's drafts
    if (item.status === 'draft' && item.submitted_by !== user?.id) {
        return false;
    }
    
    // RBAC: Non-admins can only see their own submitted items
    if (!isAdmin && item.submitted_by !== user?.id) {
      return false;
    }

    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submitted_by?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterCategory !== "All" && item.category !== filterCategory)
      return false;
    if (filterSubmitter !== "All" && item.submitted_by !== filterSubmitter)
      return false;
    if (filterAuthor !== "All" && item.author !== filterAuthor) return false;

    if (activeTab === "articles") {
      return item.type !== "update" && item.status !== "pending" && !item.needs_attention;
    }
    if (activeTab === "updates") {
      return item.type === "update" && item.status !== "pending" && !item.needs_attention;
    }
    if (activeTab === "pending") {
      return item.status === "pending" || item.needs_attention === true;
    }
    if (activeTab === "published") {
      return item.status === "published";
    }
    // if (activeTab === "needs_attention") {
    //   return item.needs_attention === true;
    // }
    if (activeTab === "draft") {
      return item.status === "draft";
    }
    return true;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map((item) => item.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} items?`,
      )
    ) {
      await deleteManyNews(selectedIds);
      toast.success(`${selectedIds.length} items deleted.`);
      setSelectedIds([]);
      setIsSelecting(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Approve and publish ${selectedIds.length} items?`)) {
      await updateManyNews(selectedIds, {
        status: "published",
      });
      toast.success(`${selectedIds.length} items approved and published.`);
      setSelectedIds([]);
      setIsSelecting(false);
    }
  };

  if (isLoadingNews && news.length === 0) {
    return <ContentSkeleton />;
  }

  return (
    <div className="relative py-8 text-theme-primary space-y-6 md:space-y-8 font-sans max-w-7xl mx-auto  md:pt-8 md:px-8 pb-8">
      {/* Ambient Background Glow */}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center text-center sm:text-left justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-theme-primary">
            Content Manager
          </h1>
          <p className="text-xs sm:text-sm text-theme-primary opacity-50 mt-1 font-regular">
            Manage articles, updates, and approvals
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 w-full md:w-auto z-20">
          {isAdmin ? (
            <div className="relative w-full sm:w-auto flex justify-center sm:justify-end">
              <button
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                className="w-auto px-6 py-3 rounded-full bg-[var(--accent)] text-black hover:bg-theme-accent/90 font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(var(--accent-rgb),0.2)]">
                <Plus size={18} strokeWidth={3} /> <span>Create New</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate(`/${adminPath}/dashboard/news/create`)}
              className="w-auto px-6 py-3 rounded-full bg-[var(--accent)] text-black hover:bg-theme-accent/90 font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(var(--accent-rgb),0.2)]">
              <Plus size={18} strokeWidth={3} /> <span>Write Article</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col gap-4 border-b border-theme-base pb-4">
        {/* Search & Tools Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-primary/30"
              size={16}
            />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full admin-input border-theme bg-[var(--admin-border)]/20 rounded-2xl pl-11 pr-4 py-3 text-sm text-theme-primary focus:border-theme-accent/40 transition-colors shadow-inner"
            />
          </div>

          {/* View Toggles & Filters */}
          <div className="flex items-center overflow-x-auto hide-scrollbar bg-[var(--admin-border)]/50 border border-theme rounded-2xl p-1 gap-1 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-2xl transition-all ${viewMode === "grid" ? "bg-[var(--accent)] text-black shadow-sm" : "text-theme-primary opacity-40 hover:opacity-100 hover:bg-white/5"}`}
              title="Grid View">
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-2xl transition-all ${viewMode === "list" ? "bg-[var(--accent)] text-black shadow-sm" : "text-theme-primary opacity-40 hover:opacity-100 hover:bg-white/5"}`}
              title="List View">
              <ListIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-2 rounded-2xl transition-all ${viewMode === "board" ? "bg-[var(--accent)] text-black shadow-sm" : "text-theme-primary opacity-40 hover:opacity-100 hover:bg-white/5"}`}
              title="Board View">
              <Columns3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2 rounded-2xl transition-all ${viewMode === "calendar" ? "bg-[var(--accent)] text-black shadow-sm" : "text-theme-primary opacity-40 hover:opacity-100 hover:bg-white/5"}`}
              title="Calendar View">
              <Calendar size={16} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-2xl transition-all ${showFilters ? "bg-white/10 text-theme-primary" : "text-theme-primary opacity-40 hover:opacity-100 hover:bg-white/5"}`}
              title="Advanced Filters">
              <Filter size={16} />
            </button>
            <button
              onClick={() => {
                setIsSelecting(!isSelecting);
                setSelectedIds([]);
              }}
              className={`p-2 rounded-2xl transition-all ${isSelecting ? "bg-[var(--accent)] text-black" : "text-theme-primary opacity-40 hover:opacity-100 hover:bg-white/5"}`}
              title="Select Multiple">
              <CheckSquare size={16} />
            </button>

            {viewMode === "board" && (
              <>
                <div className="w-px h-4 bg-white/10 mx-1"></div>
                <div className="flex bg-theme-bg/20 rounded-2xl p-0.5">
                  <button
                    onClick={() => setBoardGroupBy("status")}
                    className={`px-3 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-colors ${boardGroupBy === "status" ? "bg-[var(--admin-border)] text-theme-primary" : "text-theme-primary/40 hover:text-theme-primary"}`}>
                    Status
                  </button>
                  <button
                    onClick={() => setBoardGroupBy("author")}
                    className={`px-3 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-colors ${boardGroupBy === "author" ? "bg-[var(--admin-border)] text-theme-primary" : "text-theme-primary/40 hover:text-theme-primary"}`}>
                    Author
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar bg-[var(--admin-border)]/30 border border-theme p-1 rounded-2xl w-full">
          {isAdmin ? (
            <>
              <button
                onClick={() => {
                  setActiveTab("articles");
                  setViewMode("grid");
                }}
                className={`relative flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors flex justify-center items-center gap-2 whitespace-nowrap ${
                  activeTab === "articles"
                    ? "text-theme-primary"
                    : "text-theme-primary/40 hover:text-theme-primary hover:bg-white/5"
                }`}>
                {activeTab === "articles" && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-admin-card shadow-sm border border-theme rounded-2xl"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Newspaper size={16} /> Articles
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("updates");
                  setViewMode("list");
                }}
                className={`relative flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors flex justify-center items-center gap-2 whitespace-nowrap ${
                  activeTab === "updates"
                    ? "text-theme-primary"
                    : "text-theme-primary/40 hover:text-theme-primary hover:bg-white/5"
                }`}>
                {activeTab === "updates" && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-admin-card shadow-sm border border-theme rounded-2xl"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Zap size={16} /> Updates
                </span>
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`relative flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors flex justify-center items-center gap-2 whitespace-nowrap ${
                  activeTab === "pending"
                    ? "text-theme-accent"
                    : "text-theme-primary/40 hover:text-[var(--accent)] hover:bg-white/5"
                }`}>
                {activeTab === "pending" && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-theme-accent/20 border border-theme-accent/10 shadow-sm rounded-2xl"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Inbox size={16} /> Review Queue
                  {news.filter((n) => n.status === "pending" || n.needs_attention).length > 0 && (
                    <span className="ml-1 bg-[var(--accent)] text-black px-1.5 py-0.5 rounded-full text-[10px] font-black">
                      {news.filter((n) => n.status === "pending" || n.needs_attention).length}
                    </span>
                  )}
                </span>
              </button>
              {/* <button
                onClick={() => setActiveTab("needs_attention")}
                className={`relative flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors flex justify-center items-center gap-2 whitespace-nowrap ${
                  activeTab === "needs_attention"
                    ? "text-[var(--accent)]"
                    : "text-theme-primary/40 hover:text-[var(--accent)] hover:bg-white/5"
                }`}>
                {activeTab === "needs_attention" && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-[var(--accent)]/10 border border-[var(--accent)]/10 shadow-sm rounded-2xl"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Ban size={16} /> Needs Attention
                </span>
              </button> */}
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab("published")}
                className={`relative flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors flex justify-center items-center gap-2 whitespace-nowrap ${
                  activeTab === "published"
                    ? "text-theme-primary"
                    : "text-theme-primary/40 hover:text-theme-primary hover:bg-white/5"
                }`}>
                {activeTab === "published" && (
                  <motion.div
                    layoutId="activeWriterTab"
                    className="absolute inset-0 bg-admin-card border border-white/[0.06] shadow-sm rounded-2xl"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <CheckCircle size={16} /> Published
                </span>
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`relative flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors flex justify-center items-center gap-2 whitespace-nowrap ${
                  activeTab === "pending"
                    ? "text-[var(--accent)]"
                    : "text-theme-primary/40 hover:text-[var(--accent)] hover:bg-white/5"
                }`}>
                {activeTab === "pending" && (
                  <motion.div
                    layoutId="activeWriterTab"
                    className="absolute inset-0 bg-theme-accent/ border border-white/[0.06] shadow-sm rounded-2xl"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Hourglass size={16} /> Review Queue
                </span>
              </button>
              <button
                onClick={() => setActiveTab("draft")}
                className={`relative flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors flex justify-center items-center gap-2 whitespace-nowrap ${
                  activeTab === "draft"
                    ? "text-[var(--accent)]"
                    : "text-theme-primary/40 hover:text-[var(--accent)] hover:bg-white/5"
                }`}>
                {activeTab === "draft" && (
                  <motion.div
                    layoutId="activeWriterTab"
                    className="absolute inset-0 bg-[var(--admin-card-bg)]   border border-theme shadow-sm rounded-2xl"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <PenTool size={16} /> Drafts
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[var(--admin-border)] border border-theme-base rounded-2xl animate-in slide-in-from-top-2">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-theme-primary opacity-40 font-bold mb-1.5 block">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full admin-input border-theme rounded-2xl px-3 py-2 text-sm bg-theme-card text-theme-primary">
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-theme-primary opacity-40 font-bold mb-1.5 block">
              Submitted By
            </label>
            <select
              value={filterSubmitter}
              onChange={(e) => setFilterSubmitter(e.target.value)}
              className="w-full admin-input border-theme rounded-2xl px-3 py-2 text-sm bg-theme-card text-theme-primary">
              {uniqueSubmitters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-theme-primary opacity-40 font-bold mb-1.5 block">
              Author (As)
            </label>
            <select
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e.target.value)}
              className="w-full admin-input border-theme rounded-2xl px-3 py-2 text-sm bg-theme-card text-theme-primary">
              {uniqueAuthors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content Area */}
      {filteredData.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center py-24 sm:py-32 px-4 rounded-2xl border border-theme bg-gradient-to-b from-white/[0.02] to-transparent overflow-hidden group">
          {/* Decorative Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--accent)] rounded-full blur-[100px] opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="relative w-24 h-24 mb-6">
            <div className="relative w-full h-full rounded-2xl bg-theme-bg/40 border border-theme backdrop-blur-sm flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
              {activeTab === "pending" ? (
                <CheckCircle
                  className="text-[var(--accent)] drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]"
                  size={32}
                />
              ) : (
                <Search
                  className="text-[var(--accent)] drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]"
                  size={32}
                />
              )}
            </div>
          </div>

          <h3 className="text-xl font-black tracking-tight text-theme-primary mb-2 relative z-10">
            {activeTab === "pending"
              ? "You're all caught up!"
              : "Nothing to see here"}
          </h3>
          <p className="text-xs text-muted opacity-50 text-theme-primary/40 max-w-sm text-center mb-8  relative z-10">
            {activeTab === "pending"
              ? "There are no articles waiting for approval right now. Sit back and relax."
              : "We couldn't find any items matching your criteria. Try adjusting your filters or start fresh."}
          </p>

          {activeTab !== "pending" && (
            <button
              onClick={() => navigate(`/${adminPath}/dashboard/news/create`)}
              className="relative z-10 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-theme text-theme-primary font-bold text-sm transition-all flex items-center gap-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] active:scale-95">
              <Plus size={16} /> Create New Article
            </button>
          )}
        </div>
      ) : viewMode === "list" ? (
        <NewsListView
          filteredData={filteredData}
          isSelecting={isSelecting}
          selectedIds={selectedIds}
          toggleSelection={toggleSelection}
          setViewingArticle={setViewingArticle}
          webUsers={webUsers}
          activeTab={activeTab}
          handleApprove={handleApprove}
          handleEdit={handleEdit}
          handleReject={handleNeedsAttentionOpen}
          handleDelete={handleDelete}
        />
      ) : viewMode === "board" ? (
        <NewsBoardView
          filteredData={filteredData}
          boardGroupBy={boardGroupBy}
          activeTab={activeTab}
          setViewingArticle={setViewingArticle}
          webUsers={webUsers}
          handleApprove={handleApprove}
          handleEdit={handleEdit}
          handleReject={handleNeedsAttentionOpen}
          handleDelete={handleDelete}
        />
      ) : viewMode === "calendar" ? (
        <NewsCalendarView
          filteredData={filteredData}
          isAdmin={isAdmin}
          activeTab={activeTab}
          setViewingArticle={setViewingArticle}
          webUsers={webUsers}
          handleApprove={handleApprove}
          handleEdit={handleEdit}
          handleReject={handleNeedsAttentionOpen}
          handleDelete={handleDelete}
        />
      ) : (
        <NewsGridView
          filteredData={filteredData}
          isSelecting={isSelecting}
          selectedIds={selectedIds}
          toggleSelection={toggleSelection}
          setViewingArticle={setViewingArticle}
          webUsers={webUsers}
          activeTab={activeTab}
          handleApprove={handleApprove}
          handleEdit={handleEdit}
          handleReject={handleNeedsAttentionOpen}
          handleDelete={handleDelete}
        />
      )}

      {/* Floating Action Bar for Bulk Selection */}
      {isSelecting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-theme-card border border-theme-base rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4 sm:gap-6 z-50 animate-in slide-in-from-bottom-10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-theme-primary">
              {selectedIds.length}
            </span>
            <span className="text-xs text-theme-primary opacity-50 uppercase tracking-widest font-bold hidden sm:inline">
              Selected
            </span>
          </div>
          <div className="w-px h-6 bg-[var(--admin-border)] opacity-80"></div>
          <button
            onClick={handleSelectAll}
            className="text-xs font-bold text-theme-primary opacity-70 hover:text-theme-primary transition-colors whitespace-nowrap">
            {selectedIds.length === filteredData.length &&
            filteredData.length > 0
              ? "Deselect All"
              : "Select All"}
          </button>
          <div className="flex gap-2">
            {activeTab === "pending" && (
              <button
                onClick={handleBulkApprove}
                disabled={selectedIds.length === 0}
                className="px-4 py-2 bg-[var(--accent)] text-black rounded-2xl text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-colors flex items-center gap-1">
                <CheckCircle size={14} /> Approve
              </button>
            )}
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="px-4 py-2 bg-theme-accent/ text-[var(--accent)] rounded-2xl text-xs font-bold hover:bg-theme-accent/ disabled:opacity-50 transition-colors flex items-center gap-1">
              <Trash2 size={14} /> Delete
            </button>
          </div>
          <button
            onClick={() => {
              setIsSelecting(false);
              setSelectedIds([]);
            }}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-theme-bg border border-theme-base flex items-center justify-center text-theme-primary opacity-50 hover:text-theme-primary hover:bg-[var(--admin-border)] hover:opacity-80 transition-colors shadow-lg">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Action Options Modal */}
      <MorphingModal
        viewId={viewingArticle ? `${viewingArticle.id}-${modalView}` : null}
        onClose={() => {
          setViewingArticle(null);
          setTimeout(() => setModalView("options"), 300);
        }}
        placement="responsive"
        className={modalView === "view" ? "sm:max-w-3xl lg:max-w-4xl" : "sm:max-w-md"}
      >
        <div className="w-full sm:min-w-[360px] bg-[var(--admin-card-bg,#121212)] border border-[var(--admin-border)] rounded-2xl overflow-hidden p-3 shadow-2xl">
          {modalView === "options" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-2 pb-2.5 mb-1 border-b border-[var(--admin-border)] pt-1">
                <h3 className="text-sm font-bold text-[var(--admin-text-primary)] truncate pr-4">
                  {viewingArticle?.title || "Manage Article"}
                </h3>
                <button
                  onClick={() => {
                    setViewingArticle(null);
                    setTimeout(() => setModalView("options"), 300);
                  }}
                  className="p-1.5 rounded-full bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* View Article Option */}
              <button
                onClick={() => setModalView("view")}
                className="w-full px-4 py-3 rounded-xl bg-[var(--admin-input-bg)] text-[var(--admin-text-primary)] hover:border-[var(--accent)]/30 border border-transparent text-sm font-medium transition-all flex items-center gap-3"
              >
                <Eye size={16} className="text-[var(--accent)]" /> <span>View Article Details</span>
              </button>

              {activeTab === "pending" ? (
                <>
                  {isAdmin && (
                    <button
                      onClick={() => setModalView("confirm-approve")}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--accent)] text-black text-sm font-bold hover:opacity-95 transition-all flex items-center gap-3 shadow-[0_2px_12px_rgba(var(--accent-rgb),0.2)]"
                    >
                      <CheckCircle size={16} /> <span>Approve & Publish</span>
                    </button>
                  )}
                  {!isAdmin && viewingArticle?.needs_attention && (
                    <button
                      onClick={() => handleResolveReview(viewingArticle.id)}
                      className="w-full px-4 py-3 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-400/25 text-sm font-bold transition-all flex items-center gap-3"
                    >
                      <CheckCircle size={16} /> <span>Resolve & Resubmit</span>
                    </button>
                  )}
                  {!isAdmin && (
                    <button
                      onClick={() => {
                        handleEdit(viewingArticle.id);
                        setViewingArticle(null);
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--admin-input-bg)] text-[var(--admin-text-primary)] hover:border-[var(--accent)]/40 border border-transparent text-sm font-medium transition-all flex items-center gap-3"
                    >
                      <Edit2 size={16} /> <span>Edit Article</span>
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setNeedsAttentionModal({ isOpen: true, id: viewingArticle.id, message: "" });
                        setViewingArticle(null);
                        setTimeout(() => setModalView("options"), 300);
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500/15 border border-orange-500/20 text-sm font-medium transition-colors flex items-center gap-3"
                    >
                      <AlertCircle size={16} /> <span>Needs Attention</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleEdit(viewingArticle.id);
                      setViewingArticle(null);
                      setTimeout(() => setModalView("options"), 300);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--admin-input-bg)] text-[var(--admin-text-primary)] hover:border-[var(--admin-border)] border border-transparent text-sm font-medium transition-colors flex items-center gap-3"
                  >
                    <Edit2 size={16} /> <span>Edit Article</span>
                  </button>
                  <button
                    onClick={() => setModalView("confirm-delete")}
                    className="w-full px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/15 border border-red-500/20 text-sm font-medium transition-colors flex items-center gap-3"
                  >
                    <Trash2 size={16} /> <span>Delete Article</span>
                  </button>
                </>
              )}
            </div>
          )}

          {modalView === "view" && viewingArticle && (
            <div className="flex flex-col">
              {/* Top Header */}
              <div className="flex items-center justify-between px-2 pt-1 pb-2.5 mb-2 border-b border-[var(--admin-border)]">
                <button
                  onClick={() => setModalView("options")}
                  className="p-1.5 rounded-full bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <ArrowLeft size={14} />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <div className="text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-widest">
                  Article Preview
                </div>
                <button
                  onClick={() => {
                    setViewingArticle(null);
                    setTimeout(() => setModalView("options"), 300);
                  }}
                  className="p-1.5 rounded-full bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Side-by-side on PC (sm:flex-row), Flowing layout on Mobile */}
              <div className="flex flex-col sm:flex-row gap-5 p-1 sm:p-2 max-h-[75vh] sm:max-h-[80vh] overflow-y-auto custom-scrollbar">
                {/* Left Column: Cover Image & Analytics Card */}
                <div className="flex flex-col gap-3.5 sm:w-[380px] lg:w-[420px] shrink-0 order-2 sm:order-1">
                  {/* Cover Image (Desktop) */}
                  {(viewingArticle.image || viewingArticle.image_url) ? (
                    <div className={`hidden sm:block w-full rounded-2xl overflow-hidden relative bg-black/40 border border-white/[0.08] shadow-md shrink-0 ${viewingArticle.type === 'update' ? '' : 'aspect-video'}`}>
                      <ImageWithLoader
                        src={viewingArticle.image || viewingArticle.image_url}
                        alt={viewingArticle.title}
                        fallbackIconClassName="w-12 h-12 opacity-20 object-contain grayscale"
                        imageClassName={`w-full h-full opacity-90 transition-transform duration-500 ${viewingArticle.type === 'update' ? 'object-contain' : 'object-cover'}`}
                      />
                    </div>
                  ) : null}

                  {/* Analytics & Performance Card */}
                  {viewingArticle?.type !== 'update' && (
                  <div className={`bg-[#0c0c0e]/20 border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm ${analyticsLoading ? 'animate-pulse' : ''}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <BarChart2 size={15} className="text-theme-accent" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                          Performance & Metrics
                        </span>
                      </div>
                      <span className="text-[9px] bg-theme-accent/10 text-theme-accent font-mono font-bold px-2 py-0.5 rounded-full border border-theme-accent/20">
                        LIVE
                      </span>
                    </div>

                    {analytics?.configured === false && (
                      <div className="flex items-center gap-2 p-2 rounded-xl  bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium">
                        <span>GA4 credentials not configured. Analytics data will appear once connected.</span>
                      </div>
                    )}

                    {/* 2x2 Stats Grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Views */}
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col">
                        <span className="text-[10px] text-white/45 font-medium flex items-center gap-1">
                          <Eye size={12} className="text-white/40" /> Total Views
                        </span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-base font-mono font-bold text-white">
                            {analytics?.views ?? 0}
                          </span>
                          {analytics?.configured === false ? (
                            <span className="text-[9px] text-amber-400 font-mono font-bold">Setup GA4</span>
                          ) : (
                            <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                              <TrendingUp size={10} /> {analytics?.users ?? 0} users
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reading Time */}
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col">
                        <span className="text-[10px] text-white/45 font-medium flex items-center gap-1">
                          <Clock size={12} className="text-white/40" /> Read Time
                        </span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-base font-mono font-bold text-white">
                            ~{Math.max(1, Math.ceil((viewingArticle.content || "").replace(/<[^>]*>?/gm, "").split(/\s+/).filter(Boolean).length / 180))}m
                          </span>
                          <span className="text-[9px] text-white/40 font-mono">
                            {(viewingArticle.content || "").replace(/<[^>]*>?/gm, "").split(/\s+/).filter(Boolean).length}w
                          </span>
                        </div>
                      </div>

                      {/* Visibility Status */}
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col">
                        <span className="text-[10px] text-white/45 font-medium flex items-center gap-1">
                          <Globe size={12} className="text-white/40" /> Visibility
                        </span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-1">
                          {viewingArticle.visibility === "private" ? (
                            <span className="text-rose-400 flex items-center gap-1">
                              <EyeOff size={11} /> Private
                            </span>
                          ) : viewingArticle.visibility === "unlisted" ? (
                            <span className="text-purple-400 flex items-center gap-1">
                              <LinkIcon size={11} /> Unlisted
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Globe size={11} /> Public
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Publishing Status */}
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col">
                        <span className="text-[10px] text-white/45 font-medium flex items-center gap-1">
                          <CheckCircle size={12} className="text-white/40" /> Status
                        </span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              viewingArticle.status === "published"
                                ? "bg-emerald-400"
                                : viewingArticle.status === "pending"
                                ? "bg-blue-400 animate-pulse"
                                : "bg-yellow-400"
                            }`}
                          />
                          {viewingArticle.status || "Draft"}
                        </span>
                      </div>
                    </div>

                    {/* Audience & Device Distribution */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-white/45">
                        <span>Device Distribution</span>
                        <span className="font-mono">
                          {(() => {
                            const d = analytics?.deviceBreakdown || { mobile: 0, desktop: 0, tablet: 0 };
                            const total = d.mobile + d.desktop + d.tablet || 1;
                            return `Mobile ${Math.round(d.mobile / total * 100)}% • Desktop ${Math.round(d.desktop / total * 100)}%`;
                          })()}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden flex">
                        {(() => {
                          const d = analytics?.deviceBreakdown || { mobile: 0, desktop: 0, tablet: 0 };
                          const total = d.mobile + d.desktop + d.tablet || 1;
                          return (
                            <>
                              <div className="bg-theme-accent h-full" style={{ width: `${Math.round(d.mobile / total * 100)}%` }} />
                              <div className="bg-blue-500 h-full" style={{ width: `${Math.round(d.desktop / total * 100)}%` }} />
                              <div className="bg-purple-500 h-full" style={{ width: `${Math.round(d.tablet / total * 100)}%` }} />
                            </>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-3 text-[9px] text-white/40 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Smartphone size={10} className="text-theme-accent" /> Mobile
                        </span>
                        <span className="flex items-center gap-1">
                          <Laptop size={10} className="text-blue-400" /> Desktop
                        </span>
                      </div>
                    </div>

                    {/* Quick Link Tools */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/news/${viewingArticle.id}`;
                          navigator.clipboard.writeText(url);
                          setCopiedLink(true);
                          toast.success("Public link copied to clipboard!");
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.06] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        {copiedLink ? (
                          <>
                            <Check size={13} className="text-theme-accent" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={13} /> Copy Link
                          </>
                        )}
                      </button>

                      <a
                        href={`/news/${viewingArticle.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.06] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        title="Open in Public View"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                  )}
                </div>

                {/* Right Column: Full Article Content Reader */}
                <div className="flex flex-col justify-between flex-1 min-w-0 gap-4 order-1 sm:order-2">
                  {/* Cover Image (Mobile Only - positioned at top so mobile users always see it) */}
                  {(viewingArticle.image || viewingArticle.image_url) ? (
                    <div className={`block sm:hidden w-full rounded-2xl overflow-hidden relative bg-black/40 border border-white/[0.08] shadow-md shrink-0 ${viewingArticle.type === 'update' ? '' : 'aspect-video'}`}>
                      <ImageWithLoader
                        src={viewingArticle.image || viewingArticle.image_url}
                        alt={viewingArticle.title}
                        fallbackIconClassName="w-12 h-12 opacity-20 object-contain grayscale"
                        imageClassName={`w-full h-full opacity-90 transition-transform duration-500 ${viewingArticle.type === 'update' ? 'object-contain' : 'object-cover'}`}
                      />
                    </div>
                  ) : null}

                  <div className="space-y-3.5">
                    {/* Tags & Metadata */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-white/[0.06] text-white/90 border border-white/[0.08] px-2.5 py-0.5 rounded-3xl  text-[10px] font-bold uppercase tracking-wider">
                        {viewingArticle.category || "General"}
                      </span>
                      <span className="text-[11px] text-white/40 font-mono">
                        {new Date(viewingArticle.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-2xl font-bold text-white leading-snug">
                      {viewingArticle.title}
                    </h2>

                    {/* Author & Submitter indicator */}
                    {(() => {
                      const isArticle = viewingArticle.type !== "update";
                      const { isICMU, authorName, submitterName, avatarUrl, initials } =
                        resolveAuthorInfo(viewingArticle, webUsers);
                      const submitterInitials = submitterName
                        ? submitterName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "U";

                      return (
                        <div className="flex items-center gap-2.5 py-2 px-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white/70">
                          {isArticle ? (
                            isICMU ? (
                              <>
                                <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                  <img
                                    src={iconLogo}
                                    alt="ICMU"
                                    className="w-full h-full object-cover opacity-95"
                                  />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-semibold text-white truncate flex items-center gap-1">
                                    Isipathana College Media Unit
                                    <BadgeCheck
                                      size={13}
                                      className="text-[#050505] fill-theme-accent shrink-0"
                                    />
                                  </span>
                                  {submitterName && (
                                    <span className="text-[10px] text-white/45 font-normal truncate mt-0.5">
                                      {submitterName}
                                    </span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                  {avatarUrl ? (
                                    <img
                                      src={avatarUrl}
                                      alt={authorName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[8px] font-bold text-white/80">
                                      {initials}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-semibold text-white truncate">
                                  {authorName}
                                </span>
                              </>
                            )
                          ) : (
                            /* Updates: Show poster directly */
                            <>
                              <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={submitterName || authorName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[8px] font-bold text-white/80">
                                    {submitterInitials || initials}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-semibold text-white truncate">
                                {submitterName || authorName || "ICMU Member"}
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })()}

                    {Array.isArray(viewingArticle.review_notes) && viewingArticle.review_notes.length > 0 && (
                      <div className="rounded-2xl border border-orange-400/25 bg-orange-400/10 p-3.5">
                        <div className="flex items-center gap-2 text-orange-200 text-xs font-bold">
                          <AlertCircle size={14} /> Review notes
                        </div>
                        <div className="mt-2.5 space-y-2.5">
                          {viewingArticle.review_notes.map((note, index) => (
                            <div key={`${note.at || "note"}-${index}`} className="border-l-2 border-orange-300/50 pl-2.5">
                              <div className="flex items-center justify-between gap-2 text-[10px]">
                                <span className="font-bold text-orange-100">{note.name || "Admin"}</span>
                                {note.at && (
                                  <span className="text-orange-100/60">
                                    {new Date(note.at).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-orange-50/85">{note.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content Reader */}
                    <div className="text-xs sm:text-sm text-white/75 leading-relaxed prose prose-invert prose-sm max-w-none max-h-[35vh] sm:max-h-[42vh] overflow-y-auto custom-scrollbar pr-1 pt-1">
                      <div
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(viewingArticle.content || "") }}
                      />
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-[var(--admin-border)] flex gap-2">
                    <button
                      onClick={() => setModalView("options")}
                      className="flex-1 py-2.5 rounded-xl bg-[var(--admin-input-bg)] text-[var(--admin-text-primary)] hover:border-[var(--accent)]/40 border border-[var(--admin-border)] text-xs font-bold transition-all"
                    >
                      Back to Options
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {modalView === "confirm-delete" && viewingArticle && (
            <div className="flex flex-col px-2 py-2">
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
                  <AlertTriangle size={18} />
                </div>
                <button
                  onClick={() => setModalView("options")}
                  className="p-1.5 rounded-full bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--admin-text-primary)] mt-2">
                Delete Article?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--admin-text-secondary)] mt-1 mb-6">
                This action cannot be undone. This will permanently delete the article.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setModalView("options")}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-[var(--admin-text-primary)] text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete(viewingArticle.id);
                    setViewingArticle(null);
                    setTimeout(() => setModalView("options"), 300);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-500 text-xs font-bold transition-colors shadow-lg shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {modalView === "confirm-approve" && viewingArticle && (
            <div className="flex flex-col px-2 py-2">
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20">
                  <CheckCircle size={18} />
                </div>
                <button
                  onClick={() => setModalView("options")}
                  className="p-1.5 rounded-full bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--admin-text-primary)] mt-2">
                Approve Article?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--admin-text-secondary)] mt-1 mb-6">
                This will publish the article and make it visible to everyone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setModalView("options")}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--admin-input-bg)] border border-[var(--admin-border)] text-[var(--admin-text-primary)] text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleApprove(viewingArticle.id);
                    setViewingArticle(null);
                    setTimeout(() => setModalView("options"), 300);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-black hover:opacity-95 text-xs font-bold transition-colors shadow-lg shadow-[var(--accent)]/20"
                >
                  Approve
                </button>
              </div>
            </div>
          )}


        </div>
      </MorphingModal>

      {/* Needs Attention Modal */}
      {needsAttentionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--admin-card-bg)] border border-theme rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white">Needs Attention</h3>
            <p className="text-sm text-theme-primary/60">
              Provide a message explaining what needs to be fixed before this can be published.
            </p>
            <textarea
              className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-theme-accent focus:bg-white/10 transition-colors custom-scrollbar resize-none"
              placeholder="e.g. Please update the cover image to match brand guidelines."
              value={needsAttentionModal.message}
              onChange={(e) => setNeedsAttentionModal(prev => ({ ...prev, message: e.target.value }))}
            />
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setNeedsAttentionModal({ isOpen: false, id: null, message: "" })}
                className="px-6 py-2.5 rounded-2xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitNeedsAttention}
                className="px-6 py-2.5 rounded-2xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center gap-2"
              >
                <Ban size={16} /> Return to Writer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Modal */}
      <MorphingModal
        viewId={isCreateMenuOpen ? "create-menu" : null}
        onClose={() => setIsCreateMenuOpen(false)}>
        <div className="w-full sm:min-w-[300px]  bg-[var(--admin-card-bg)]   border border-theme rounded-2xl overflow-hidden shadow-2xl p-2 flex flex-col gap-1">
          <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-white/[0.06] pt-1">
            <h3 className="text-sm font-bold text-white/90">Create New</h3>
            <button
              onClick={() => setIsCreateMenuOpen(false)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          <button
            onClick={() => {
              setIsCreateMenuOpen(false);
              navigate(`/${adminPath}/dashboard/news/create`);
            }}
            className="w-full text-left px-4 py-3.5 rounded-2xl hover:bg-white/5 flex items-center gap-3 text-sm font-semibold text-theme-primary/90 transition-colors">
            <FileText size={18} className="text-[var(--accent)]" />
            Write Article
          </button>

          <button
            onClick={() => {
              setIsCreateMenuOpen(false);
              navigate(`/${adminPath}/dashboard/news/update`);
            }}
            className="w-full text-left px-4 py-3.5 rounded-2xl hover:bg-white/5 flex items-center gap-3 text-sm font-semibold text-theme-primary/90 transition-colors">
            <LinkIcon size={18} className="text-[var(--accent)]" />
            Post Update
          </button>
        </div>
      </MorphingModal>
    </div>
  );
};

export default ManageNews;

