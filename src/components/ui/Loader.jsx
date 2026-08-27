import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export const Loader = ({ className, fullScreen = false, size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };

  const containerClasses = fullScreen 
    ? "min-h-[100dvh] bg-black flex items-center justify-center animate-fade-in"
    : "w-full min-h-[50vh] flex justify-center items-center animate-fade-in";

  return (
    <div className={cn(containerClasses, className)}>
      <Loader2 className={cn(sizeClasses[size], "text-green-500 animate-spin")} />
    </div>
  );
};

export default Loader;
