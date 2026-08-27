import React, { useRef } from "react";
import { useInView } from "framer-motion";

const LazySection = ({ children, minHeight = "100vh" }) => {
  const ref = useRef(null);
  // Trigger once it comes within 200px of the viewport to allow time to load
  const isInView = useInView(ref, { once: true, margin: "200px 0px" });

  return (
    <div ref={ref} style={{ minHeight: isInView ? "auto" : minHeight }}>
      {isInView ? children : null}
    </div>
  );
};

export default LazySection;
