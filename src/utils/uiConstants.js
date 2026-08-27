export const UI_SHAPES = {
  CARD: "bg-black/40 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 shadow-2xl",
  CARD_HOVER:
    "hover:bg-white/5 hover:border-white/520 transition-all duration-300",
  INPUT:
    "w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all",
  BUTTON_PRIMARY:
    "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5",
  BUTTON_SECONDARY:
    "bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-2xl border border-white/5 transition-all duration-300",
  HEADING:
    "text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60",
  SUBTEXT: "text-sm text-white/50",
  MODAL_OVERLAY:
    "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4",
  MODAL_CONTENT:
    "bg-[var(--admin-input-bg)]   border border-white/5 rounded-3xl p-6 w-full max-w-lg shadow-2xl overflow-hidden relative",
};
