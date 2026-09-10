import React, { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useInView } from "framer-motion";

const LazySection = ({ children, id, minHeight = "100vh" }) => {
  const ref = useRef(null);
  const location = useLocation();
  const isHashTarget = location.hash === `#${id}`;
  const isInView = useInView(ref, { once: true, margin: "300px 0px" });
  const shouldRender = isHashTarget || isInView;

  useEffect(() => {
    if (isHashTarget && window.lenis) {
      window.lenis.resize();
    }
  }, [isHashTarget]);

  return (
    <div id={id} ref={ref} style={{ minHeight: shouldRender ? "auto" : minHeight }}>
      {shouldRender ? children : null}
    </div>
  );
};

export default LazySection;
