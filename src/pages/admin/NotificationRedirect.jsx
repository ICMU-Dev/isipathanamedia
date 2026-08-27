import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NotificationRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-[100dvh] bg-ambient" />;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const to = searchParams.get("to") || "settings";

  if (user && user.indexNumber) {
    return <Navigate to={`/${user.indexNumber}/dashboard/${to}`} replace />;
  }

  // Fallback to home if not logged in
  return <Navigate to="/" replace />;
};

export default NotificationRedirect;
