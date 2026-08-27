import React, { useState } from "react";
import {  AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import {
  Mail,
  Trash2,
  Reply,
  Send,
  X,
  Inbox,
  MessageSquare,
  Clock,
  Phone,
  Tag,
  Calendar,
  SendIcon,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const formatMessageDate = (timestamp) => {
  if (!timestamp) return "Unknown Date";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatExactDateTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const AdminMessages = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super-admin" || user?.role === "superadmin" || user?.role === "super_admin";
  const { messages, deleteMessage, addActivityLog } = useData();
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(id);
      toast.success("Message deleted.");
    }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSending(false);
    window.location.href = `mailto:${replyingTo.email}?subject=Reply to your message - ICMU&body=${encodeURIComponent(replyContent)}`;
    addActivityLog("EMAIL_REPLY", `Sent reply to ${replyingTo.email}`);
    toast.success("Reply prepared in your email client!");
    setReplyingTo(null);
    setReplyContent("");
  };

  return (
    <div className="px-4 max-w-4xl mx-auto space-y-6 md:space-y-8 pb-10">
      {/* Mobile-Only Hero Banner (App Style) */}
      <div className=" md:hidden relative -mx-4 -mt-4 mb-4 px-6 pt-8 pb-8 rounded-b-[32px] overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] rounded-full blur-[80px] opacity-30 -translate-y-1/2 translate-x-1/3 -z-10" />

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-black/20 rounded-2xl backdrop-blur-md border border-[var(--admin-border)]">
              <MessageSquare size={20} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest px-2 py-1 rounded-full bg-white/10 border border-[var(--admin-border)]">
              {messages.length} {messages.length === 1 ? "Message" : "Messages"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Inbox
          </h1>
          <p className="text-xs text-white/70 font-medium">
            Respond to public inquiries
          </p>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-theme-base pb-6">
        <div className="text-center sm:text-left space-y-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Messages Inbox
            </h1>
            <p className="text-xs sm:text-sm text-theme-primary opacity-50 mt-1 font-regular">
              {messages.length} {messages.length === 1 ? "message" : "messages"}{" "}
              waiting for response
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--admin-border)] border border-theme-base text-xs font-semibold text-theme-primary opacity-70">
          <Inbox size={14} />
          <span>All Messages</span>
        </div>
      </div>

      {/* Messages List */}
      <motion.div layout className="space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const msgTimestamp = msg.created_at || msg.date;
              const formattedDate = formatMessageDate(msgTimestamp);
              const exactDateTime = formatExactDateTime(msgTimestamp);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.2 },
                  }}
                  key={msg.id}
                  className="rounded-3xl border border-white/[0.06] bg-[var(--admin-card-bg)]/10 hover:scale-105 transition-all duration-300 p-5 sm:p-7 flex flex-col  shadow-lg hover:shadow-2xl group">
                  {/* Top row: sender info + actions */}
                  <div className="flex items-start justify-between gap-3 border-white/[0.06] ">
                    {/* Avatar + Info */}
                    <div className="flex items-center min-w-0">
                      
                      <div className="min-w-0 flex flex-col justify-center">
                        <p className=" font-bold text-white truncate">
                          {msg.name}
                        </p> {isSuperAdmin &&

                        <p className="text-xs font-medium text-[var(--accent)] opacity-80 truncate">
                          {msg.email}
                        </p>}
                      </div>
                    </div>

                    {/* Actions & Timestamp */}
                    <div className="flex items-center gap-2 shrink-0">
                      {msgTimestamp && (
                        <span
                          className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[var(--admin-text-secondary)] font-mono px-3 py-1.5 rounded-2xl bg-white/5 border border-white/[0.06]  mr-2"
                          title={exactDateTime}>
                          <Clock
                            size={12}
                            className="text-[var(--accent)] shrink-0"
                          />
                          {formattedDate}
                        </span>
                      )}
                      {isSuperAdmin && (
                        <>
                          <button
                            onClick={() => setReplyingTo(msg)}
                            className="h-10 px-4 flex items-center gap-2 rounded-2xl bg-theme-accent/5 text-[var(--accent)] hover:bg-theme-accent/20 hover:scale-105 active:scale-95 transition-all text-xs font-bold">
                            <Reply size={15} strokeWidth={2.5} />
                            <span className="hidden sm:inline">Reply</span>
                          </button>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="h-10 w-10 flex items-center justify-center rounded-2xl bg-red-600/10 text-red-600 hover:bg-red-600/20 hover:scale-105 active:scale-95 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Additional Metadata Tags (Phone, Subject, Created Date) */}
                  <div className="flex flex-wrap items-center gap-2 pl-0 sm:pl-[58px] text-[11px]">
                    {msg.phone && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl bg-white/5 border border-white/[0.06]  text-zinc-300 font-mono">
                        <Phone size={11} className="text-zinc-400" />
                        {msg.phone}
                      </span>
                    )}
                    {msg.subject && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium">
                        <Tag size={11} />
                        {msg.subject}
                      </span>
                    )}
                    {msgTimestamp && exactDateTime && (
                      <span className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl bg-white/5 text-[var(--admin-text-secondary)] font-mono text-[10px]">
                        <Calendar size={10} />
                        {exactDateTime}
                      </span>
                    )}
                  </div>

                  {/* Message body */}
                  <div className="pt-1">
                    <p className="text-sm text-white/70  leading-[1.8] whitespace-pre-wrap font-medium">
                      {msg.message}
                    </p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-white/[0.06]  border-dashed bg-white/[0.01]">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06]  flex items-center justify-center mb-5 text-white opacity-40 shadow-inner">
                <Mail size={28} />
              </div>
              <p className="text-base font-bold text-white opacity-80 mb-1">
                Inbox is empty
              </p>
              <p className="text-sm text-white opacity-40 font-medium max-w-xs">
                When someone fills out the contact form, their message will
                appear here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Reply Modal */}
      {replyingTo && (
        <div className=" inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full sm:max-w-lg rounded-t-[32px] sm:rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--admin-border)]">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Reply to Message
                </h3>
                <p className="text-xs font-medium text-[var(--accent)] opacity-80 mt-1 truncate max-w-[250px]">
                  {replyingTo.email}
                </p>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--admin-text-secondary)] hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Original message snippet */}
              <div className="bg-white/5 border border-white/[0.06]  rounded-2xl p-4 shadow-inner">
                <p className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MessageSquare size={12} /> Original Message
                </p>
                <p className="text-sm text-white/70 italic line-clamp-3 leading-relaxed font-medium">
                  "{replyingTo.message}"
                </p>
              </div>

              {/* Reply textarea */}
              <textarea
                rows={5}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-4 text-sm text-white font-medium placeholder-white/30 focus:outline-none focus:border-theme-accent/60 focus:ring-1 focus:ring-theme-accent/60 transition-all resize-none shadow-inner"
                placeholder="Type your reply here..."
                autoFocus
              />
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex gap-3 justify-end">
              <button
                onClick={() => setReplyingTo(null)}
                className="px-5 py-3 rounded-2xl text-sm font-bold text-[var(--admin-text-secondary)] hover:text-white hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={sending || !replyContent.trim()}
                className="px-6 py-3 rounded-2xl bg-[var(--accent)] text-black text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_8px_20px_rgba(var(--accent-rgb),0.2)]">
                {sending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <>
                    <SendIcon size={16} strokeWidth={2.5} />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
