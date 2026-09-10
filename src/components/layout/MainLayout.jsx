import React, { useEffect, useState } from "react";
import { useOutlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../ui/Navbar";
import SmoothScroll from "../SmoothScroll";

export const TransitionContext = React.createContext({ isWipeComplete: true });

const Preloader = ({ onComplete }) => {
  return (
    <motion.div
      className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center pointer-events-none will-change-transform"
      initial={{ top: 0, height: "100vh" }}
      animate={{ top: "-100vh", height: "100vh" }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 2.2 }}
      onAnimationComplete={onComplete}
    >
      <div className="relative h-20 w-full flex items-center justify-center overflow-hidden">
        <motion.h1
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: [0, 1, 1, 0], y: [15, 0, 0, -15], scale: [0.98, 1, 1, 1.05] }}
          transition={{ duration: 0.9, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
          className="absolute text-3xl md:text-5xl tracking-[0.2em] uppercase font-medium will-change-transform"
        >
          NO SACRIFICE
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: [0, 1, 1, 0], y: [15, 0, 0, -15], scale: [0.98, 1, 1, 1.05] }}
          transition={{ duration: 0.9, times: [0, 0.2, 0.8, 1], delay: 0.8, ease: "easeInOut" }}
          className="absolute text-3xl md:text-5xl tracking-[0.2em] uppercase font-medium will-change-transform"
        >
          NO VICTORY
        </motion.h1>
      </div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-10 text-[10px] tracking-[0.5em] uppercase will-change-opacity"
      >
        SINCE 1999
      </motion.div>
    </motion.div>
  );
};

const MainLayout = ({ children }) => {
  const location = useLocation();
  const outlet = useOutlet();
  
  const [isWipeComplete, setIsWipeComplete] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWipeComplete(true);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[50vh] font-sans text-white bg-dark flex flex-col">
      <Navbar shouldAnimate={true} />
      <SmoothScroll>
        <main className="flex-1 w-full flex flex-col min-h-screen relative">
          
          <AnimatePresence>
            {showPreloader && (
              <Preloader onComplete={() => setShowPreloader(false)} />
            )}
          </AnimatePresence>

          <div className="w-full flex-1 flex flex-col">
            <TransitionContext.Provider value={{ isWipeComplete }}>
              <React.Suspense 
                fallback={
                  <div className="min-h-[100dvh] bg-[#050505] flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                }
              >
                {children || outlet}
              </React.Suspense>
            </TransitionContext.Provider>
          </div>

        </main>
      </SmoothScroll>
    </div>
  );
};

export default MainLayout;
