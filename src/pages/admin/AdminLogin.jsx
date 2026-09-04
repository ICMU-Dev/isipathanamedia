import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Lock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import MainLogos from "../../assets/main-logos.png";
import NotFoundPage from "../NotFoundPage";
import Strands from "../../components/ui/Strands";
import DotField from "../../components/ui/DotField";
import { getDefaultDashboardPath } from "../../utils/roles";

const AdminLogin = ({ urlIndexNo }) => {
  const { login, setPassword, checkUser } = useAuth();
  const navigate = useNavigate();

  // view: 'loading' | 'login' | 'initialize' | '404' | 'suspended'
  const [view, setView] = useState("loading");
  const [adminName, setAdminName] = useState("");
  const [adminRole, setAdminRole] = useState("");
  const [adminAvatar, setAdminAvatar] = useState("");
  const [password, setPasswordVal] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [hasLinkedGoogle, setHasLinkedGoogle] = useState(false);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      localStorage.setItem("icmu_login_index", urlIndexNo || "");
      localStorage.setItem(
        "icmu_login_remember",
        rememberMe ? "true" : "false",
      );
      localStorage.setItem("icmu_auth_action", "login");

      const { supabase } = await import("../../lib/supabaseClient");
      const callbackUrl = `${window.location.origin}/auth/google/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-dismiss error after 6 s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 6000);
    return () => clearTimeout(t);
  }, [error, shakeKey]);

  // Auto-dismiss success after 3 s
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  // Fix BFCache stuck loading state when swiping back from OAuth
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        setIsSubmitting(false);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const showError = useCallback((msg) => {
    setError(msg);
    toast.error(msg);
    setShakeKey((k) => k + 1);
  }, []);

  // ─── Check if index number exists on mount ─────────────────
  useEffect(() => {
    if (!urlIndexNo) {
      setView("404");
      return;
    }

    (async () => {
      const result = await checkUser(urlIndexNo);

      if (!result.found) {
        setView("404");
      } else if (result.is_active === false) {
        setAdminName(result.name || "");
        setAdminRole(result.role || "");

        // Use RPC to fetch avatar (bypasses RLS — no session at login page)
        try {
          const { supabase } = await import("../../lib/supabaseClient");
          const { data } = await supabase.rpc("get_user_by_index", {
            p_index_number: urlIndexNo,
          });
          if (data?.avatar_url) setAdminAvatar(data.avatar_url);
        } catch (err) {
          console.error(err);
        }

        setView("suspended");
      } else {
        setAdminName(result.name || "");
        setAdminRole(result.role || "");

        // Check if they have an email linked for Google Auth
        // Uses RPC to bypass RLS (no session exists at the login page)
        try {
          const { supabase } = await import("../../lib/supabaseClient");
          const { data } = await supabase.rpc("get_user_by_index", {
            p_index_number: urlIndexNo,
          });
          if (data?.email) {
            setHasLinkedGoogle(true);
          }
          if (data?.avatar_url) {
            setAdminAvatar(data.avatar_url);
          }
        } catch (err) {
          console.error(err);
        }

        setView(result.needs_setup ? "initialize" : "login");
      }
    })();
  }, [urlIndexNo, checkUser]);

  // ─── Handle login (returning user) ────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    const rlKey = `icmu_login_attempts_${urlIndexNo}`;
    let attemptsStr = localStorage.getItem(rlKey);
    let attempts = attemptsStr ? JSON.parse(attemptsStr) : { count: 0, timestamp: 0 };
    
    if (attempts.count >= 3) {
      const timePassed = Date.now() - attempts.timestamp;
      if (timePassed < 30000) {
        const timeLeft = Math.ceil((30000 - timePassed) / 1000);
        return showError(`Too many failed attempts. Try again in ${timeLeft}s.`);
      } else {
        attempts = { count: 0, timestamp: 0 };
      }
    }

    setIsSubmitting(true);

    const result = await login(urlIndexNo, password, rememberMe);

    if (result.success) {
      localStorage.removeItem(rlKey);
      toast.success("Login successful.");
      navigate(getDefaultDashboardPath(result.role, urlIndexNo));
    } else {
      attempts.count += 1;
      attempts.timestamp = Date.now();
      localStorage.setItem(rlKey, JSON.stringify(attempts));
      showError(result.message || "Login failed.");
    }
    setIsSubmitting(false);
  };

  // ─── Handle first-time password setup ─────────────────────
  const handleInitialize = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      return showError("Password must be at least 8 characters.");
    }
    if (password !== confirmPassword) {
      return showError("Passwords do not match.");
    }

    setIsSubmitting(true);
    const result = await setPassword(urlIndexNo, password);

    if (result.success) {
      toast.success("System Reset Protocol Activated.");
      // setPassword auto-logs in — navigate straight to target dashboard
      navigate(getDefaultDashboardPath(result.role, urlIndexNo));
    } else {
      showError(result.message || "Setup failed.");
    }
    setIsSubmitting(false);
  };

  // ─── Views ────────────────────────────────────────────────
  if (view === "loading") {
    return (
      <div className="min-h-[100dvh] w-full bg-[#050505] flex items-center justify-center">
        {/* Subtle background glow so it's not totally empty */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20vw] h-[20vw]  " />

        {/* Generously sized container to prevent "cutted" strands, but component is kept subtle */}
        <div className="relative z-10 flex items-center flex-col justify-center pointer-events-none fade-in-25">
          <Strands
            colors={["#14DB52", "#0F8033", "#22FF66"]}
            count={3}
            speed={0.4}
            amplitude={1.2}
            waviness={1.2}
            thickness={1}
            glow={0.5}
            taper={1.5}
            spread={1.5}
            intensity={0.4}
          />
          <p className="text-white text-xl font-konexy ">Loading...</p>
        </div>
      </div>
    );
  }

  if (view === "404") return <NotFoundPage />;

  return (
    <div className="flex overflow-hidden relative justify-center items-center px-4 sm:px-6 min-h-[100dvh] bg-[#050505]">
      {/* Interactive DotField Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <DotField
          dotRadius={1.2}
          dotSpacing={16}
          bulgeStrength={0}
          cursorRadius={0}
          cursorForce={0}
          glowRadius={0}
          sparkle={true}
          waveAmplitude={1.5}
          gradientFrom="rgba(255, 255, 255, 0.1)"
          gradientTo="rgba(255, 255, 255, 0)"
          glowColor="rgba(255, 255, 255, 0.05)"
        />
      </div>
      {/* Subtle top-left glow mimicking the reference */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-theme-accent/5  rounded-full blur-[120px] pointer-events-none" />
      <img
        src={MainLogos}
        alt="ICMU Logos"
        className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-theme-accent/5  rounded-full blur-[120px] pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Brand Header */}
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="mb-6">
            <img
              src={MainLogos}
              alt="ICMU Logos"
              className="w-16 h-auto drop-shadow-md"
            />
          </div>
          {adminName ? (
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white ">
                Welcome back
              </h1>

              {/* Reworked Login Chip */}
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/5 backdrop-blur-md shadow-lg shadow-black/20 group hover:border-white/20 transition-all cursor-default ">
                <div className="w-9 h-9 rounded-full bg-theme-accent/5 flex items-center justify-center border border-theme-accent/30 group-hover:bg-theme-accent/20 group-hover:scale-105 transition-all duration-300 overflow-hidden">
                  {adminAvatar ? (
                    <img
                      src={adminAvatar}
                      alt={adminName}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <span className="text-[var(--accent)] font-bold text-sm">
                      {adminName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start pr-2">
                  <span className="text-white/90 text-sm font-semibold truncate max-w-[150px]">
                    {adminName}
                  </span>
                  {adminRole && (
                    <span className="text-theme-accent/70 text-[9px] uppercase tracking-widest font-bold mt-0.5">
                      {adminRole.replace("-", " ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white ">
                Welcome back
              </h1>
              <p className="text-white/40 text-sm font-medium ">
                Sign in to your account
              </p>
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-[var(--admin-input-bg)]  /80 backdrop-blur-sm p-8 sm:p-10 rounded-2xl border border-white/[0.06]  shadow-2xl relative overflow-hidden">
          {/* Subtle top glare */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-theme-accent/20 to-transparent" />

          {/* Error */}
          {error && (
            <div
              key={`err-${shakeKey}`}
              className="mb-6 p-4 rounded-2xl bg-red-600/10 border border-red-600/20 text-red-400 text-xs font-semibold flex items-start gap-3"
              role="alert">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{error}</span>
              <button
                onClick={() => setError("")}
                className="shrink-0 text-red-400/60 hover:text-red-400 transition-colors">
                ✕
              </button>
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div
              className="mb-6 p-4 rounded-2xl bg-primary-neon/10 border border-primary-neon/20 text-primary-neon text-xs font-semibold flex items-start gap-3 animate-fade-in"
              role="status">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{successMsg}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ── Suspended View ── */}
            {view === "suspended" && (
              <motion.div
                key="suspended"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-col items-center justify-center space-y-4 py-6">
                <ShieldAlert size={48} className="text-red-600/50 mb-2" />
                <h2 className="text-2xl font-bold tracking-tight text-white uppercase text-center">
                  Account Suspended
                </h2>
                <p className="text-white/70 text-center text-sm px-4">
                  Access to the system has been revoked for this identity.
                </p>
                <p className="text-white/40 text-center text-[10px] font-black tracking-widest uppercase mt-4">
                  Please contact the Super Administrator.
                </p>
                <div className="mt-8 pt-6 border-t border-white/[0.06]  w-full">
                  <button
                    onClick={() => navigate("/")}
                    className="w-full bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/5 hover:border-white/20 text-white/90 hover:text-white rounded-full py-3.5 px-6 font-semibold text-[10px] uppercase tracking-widest transition-all duration-300">
                    Return to Home
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Login Form ── */}
            {view === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                onSubmit={handleLogin}
                className="space-y-5">
                <div className="space-y-4">
                  {/* Username placeholder (optional visually) */}
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30">
                      <Lock size={18} />
                    </div>
                    <input
                      disabled
                      value={urlIndexNo}
                      className="w-full bg-[#141414] border border-transparent rounded-full py-4 pl-16 pr-6 text-white/40 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      className={`w-full bg-[#141414] border ${error ? "border-red-600/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "border-transparent focus:border-white/5"} rounded-full py-4 pl-16 pr-[90px] text-white text-sm focus:outline-none transition-all placeholder:text-white/30`}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPasswordVal(e.target.value)}
                      autoComplete="current-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-[60px] top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-2 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      id="login-submit"
                      type="submit"
                      disabled={isSubmitting}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--accent)] text-black flex items-center justify-center bg-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_10px_rgba(var(--accent-rgb),0.2)] disabled:opacity-50 disabled:cursor-not-allowed group/btn">
                      {isSubmitting ? (
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        <ArrowRight
                          size={18}
                          className="font-bold group-hover/btn:scale-105 transition-transform duration-300"
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* Modern Interactive "Remember me" Toggle */}
                <div className="flex justify-between items-center px-1 pt-2">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className="flex items-center gap-3 cursor-pointer group outline-none select-none text-left">
                    <div
                      className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 flex items-center border ${
                        rememberMe
                          ? "bg-white/10 border-white/30 group-hover:border-white/[0.06] 0 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                          : "bg-transparent border-white/5 group-hover:border-white/30"
                      }`}>
                      <div
                        className={`w-4 h-4 rounded-full transition-all duration-300 transform ${
                          rememberMe
                            ? "translate-x-4 bg-white"
                            : "translate-x-0 bg-white/40 group-hover:bg-white/60"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs transition-colors ${
                        rememberMe
                          ? "text-white/90 font-semibold"
                          : "text-white/40 group-hover:text-white/70"
                      }`}>
                      Remember me
                    </span>
                  </button>
                </div>

                {/* Google OAuth Login Button */}
                {hasLinkedGoogle && (
                  <div className="pt-2 space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-white/5 w-full" />
                      <span className="bg-[var(--admin-input-bg)]   px-3 text-[10px] uppercase tracking-widest text-white/30 font-bold absolute">
                        or continue with
                      </span>
                    </div>

                    <button
                      id="google-login-btn"
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isSubmitting}
                      className="w-full bg-[#141414] hover:bg-[#1c1c1c] active:scale-[0.98] border border-white/5 hover:border-white/20 text-white/90 hover:text-white rounded-full py-3.5 px-6 font-semibold text-xs flex items-center justify-center gap-3 transition-all duration-300 shadow-md group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>
                )}
              </motion.form>
            )}

            {/* ── First-Time Setup Form ── */}
            {view === "initialize" && (
              <motion.form
                key="init"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                onSubmit={handleInitialize}
                className="space-y-5">
                <div className="mb-4 text-center">
                  <p className="text-white/50 text-xs font-medium leading-relaxed">
                    First-time access detected.
                    <br />
                    <span className="text-white/90">
                      Create a secure password.
                    </span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      id="init-password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      className="w-full bg-[#141414] border border-transparent focus:border-white/5 rounded-full py-4 pl-16 pr-14 text-white text-sm focus:outline-none transition-all placeholder:text-white/30"
                      placeholder="New password"
                      value={password}
                      onChange={(e) => setPasswordVal(e.target.value)}
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors">
                      <ShieldCheck size={18} />
                    </div>
                    <input
                      id="init-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className={`w-full bg-[#141414] border ${error ? "border-red-600/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "border-transparent focus:border-white/5"} rounded-full py-4 pl-16 pr-[90px] text-white text-sm focus:outline-none transition-all placeholder:text-white/30`}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-[60px] top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-2 transition-colors">
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                    <button
                      id="init-submit"
                      type="submit"
                      disabled={isSubmitting}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#14DB52] text-black flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(20,219,82,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group/btn">
                      {isSubmitting ? (
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        <ArrowRight
                          size={18}
                          className="font-bold group-hover/btn:translate-x-0.5 transition-transform duration-300"
                        />
                      )}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-8 text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">
          Secure Access // Isipathana Media
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
