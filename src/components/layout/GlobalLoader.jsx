import React from "react";
import { Loader2 } from "lucide-react";

const GlobalLoader = () => {
  return (
    <div className="w-full min-h-[50vh] flex justify-center items-center animate-fade-in">
      <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
    </div>
  );
};

export default GlobalLoader;
