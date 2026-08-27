import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

const GoogleCallbackHandler = () => {
  const navigate = useNavigate();
  const { authenticateViaGoogle, bindGoogleIdentity } = useAuth();
  const [status, setStatus] = useState("Processing Google authentication...");
  const [errorMsg, setErrorMsg] = useState("");
  const hasHandled = useRef(false);

  // Safely get fallback index or profile path
  const [returnPath, setReturnPath] = useState(() => {
    const action = localStorage.getItem("icmu_auth_action");
    if (action === "link") {
      const storedSession = JSON.parse(
        localStorage.getItem("icmu_session") ||
          sessionStorage.getItem("icmu_session") ||
          "{}",
      );
      if (storedSession.indexNumber)
        return `/${storedSession.indexNumber}/dashboard/profile`;
    }
    return `/${localStorage.getItem("icmu_login_index") || "25473"}`;
  });

  const handleErrorMsg = (msg, isMounted) => {
    if (isMounted) {
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    let mounted = true;

    let timeoutId;

    // Check for explicit errors in the URL first
    const params = new URLSearchParams(
      window.location.hash.replace("#", "?") +
        "&" +
        window.location.search.replace("?", ""),
    );
    const urlError = params.get("error_description") || params.get("error");
    if (urlError) {
      handleErrorMsg(
        `Provider Error: ${urlError.replace(/\+/g, " ")}`,
        mounted,
      );
      return;
    }

    const handleSession = async (session) => {
      if (hasHandled.current) return;
      hasHandled.current = true;

      if (timeoutId) clearTimeout(timeoutId);

      if (!session || !session.user) {
        handleErrorMsg(
          "Could not retrieve session details from Google. Please try again.",
          mounted,
        );
        return;
      }

      try {
        const supaUser = session.user;
        const googleEmail = supaUser.email || "";
        const googlePicture = supaUser.user_metadata?.avatar_url || "";

        const action = localStorage.getItem("icmu_auth_action");

        if (action === "link") {
          // ─── LINKING ACCOUNT ───
          const result = await bindGoogleIdentity(googleEmail, googlePicture);
          localStorage.removeItem("icmu_auth_action");

          if (result.success) {
            toast.success("Google account linked successfully!");
            const storedSession = JSON.parse(
              localStorage.getItem("icmu_session") ||
                sessionStorage.getItem("icmu_session") ||
                "{}",
            );
            const targetIdx = storedSession.indexNumber || "25473";
            if (mounted)
              navigate(`/${targetIdx}/dashboard/profile`, { replace: true });
          } else {
            await supabase.auth.signOut();
            handleErrorMsg(
              result.message || "Failed to link Google account.",
              mounted,
            );
          }
        } else {
          // ─── LOGGING IN ───
          const storedIndex = localStorage.getItem("icmu_login_index");
          const storedRemember =
            localStorage.getItem("icmu_login_remember") === "true";

          const result = await authenticateViaGoogle(
            googleEmail,
            googlePicture,
            storedIndex,
            storedRemember,
          );

          localStorage.removeItem("icmu_login_index");
          localStorage.removeItem("icmu_login_remember");
          localStorage.removeItem("icmu_auth_action");

          if (result.success) {
            toast.success("Login successful.");
            const targetIdx = result.indexNumber || storedIndex || "25473";
            const role = result.role?.toLowerCase() || "";
            if (mounted) {
              if (role === "super-admin") {
                navigate(`/${targetIdx}`, { replace: true });
              } else {
                navigate(`/${targetIdx}/dashboard`, { replace: true });
              }
            }
          } else {
            // Sign out of Supabase auth since our custom auth failed
            await supabase.auth.signOut();
            handleErrorMsg(result.message || "Google login failed.", mounted);
          }
        }
      } catch (e) {
        handleErrorMsg(
          e.message ||
            "An unexpected error occurred during Google authentication.",
          mounted,
        );
      }
    };

    // 1. Listen for the auth state change
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (session) handleSession(session);
      }
    });

    // 2. Extract tokens manually from URL just in case Supabase's automatic parsing is delayed/failing
    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", ""),
    );
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (accessToken && refreshToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data, error }) => {
          if (error) {
            handleErrorMsg(`Session error: ${error.message}`, mounted);
          } else if (data?.session) {
            handleSession(data.session);
          }
        })
        .catch((e) => {
          handleErrorMsg(`Parse error: ${e.message}`, mounted);
        });
    } else {
      // 3. Manually check once if no hash tokens
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          handleErrorMsg(error.message, mounted);
        } else if (session) {
          handleSession(session);
        } else {
          timeoutId = setTimeout(() => {
            const currentUrl = window.location.href;
            handleErrorMsg(
              `Timeout waiting for Google session. Raw URL: ${currentUrl}`,
              mounted,
            );
          }, 6000);
        }
      });
    }

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [navigate, authenticateViaGoogle, bindGoogleIdentity]);

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
      {errorMsg ? (
        <div className="max-w-md bg-red-600/10 border border-red-600/20 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-red-400 mb-2">
            Authentication Failed
          </h2>
          <p className="text-xs text-white/70 mb-4">{errorMsg}</p>
          <button
            onClick={() => {
              localStorage.removeItem("icmu_auth_action"); // clean up
              navigate(returnPath);
            }}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-semibold transition-all cursor-pointer">
            Return
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-[#14DB52] animate-spin" />
          <h2 className="text-base font-semibold text-white/90">{status}</h2>
          <p className="text-xs text-white/40">
            Please wait while we set up your session...
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleCallbackHandler;
