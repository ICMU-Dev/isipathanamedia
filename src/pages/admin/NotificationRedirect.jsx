import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NotificationRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-[100dvh] bg-ambient" />;
  }

  const searchParams = new URLSearchParams(window.location.search);
  let to = searchParams.get("to") || "settings";
  let hash = window.location.hash || "";

  if (to === "feedbacks" || to === "feedback") {
    to = "settings";
    hash = "#feedbacks";
  }

  if (user && user.indexNumber) {
    return <Navigate to={`/${user.indexNumber}/dashboard/${to}${hash}`} replace />;
  }

  // Fallback to home if not logged in
  return <Navigate to="/" replace />;
};

export default NotificationRedirect;
