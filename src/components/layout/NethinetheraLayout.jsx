import React from "react";
import { Outlet } from "react-router-dom";
import SmoothScroll from "../SmoothScroll";

/**
 * NethinetheraLayout
 * Provides shared smooth scrolling (Lenis) for all public Nethinethera pages.
 */
const NethinetheraLayout = () => {
  return (
    <SmoothScroll>
      <Outlet />
    </SmoothScroll>
  );
};

export default NethinetheraLayout;
