/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1], // Apple-like smooth ease-out
      }}
      className="w-full h-full">
      {children}
    </motion.div>
  );
};

export default PageTransition;
