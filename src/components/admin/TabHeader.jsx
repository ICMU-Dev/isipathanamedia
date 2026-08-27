import React from "react";

const TabHeader = ({ title, subtitle }) => (
  <div className="mb-6 px-1">
    <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
    <p className="text-xs text-white/40 mt-1">{subtitle}</p>
  </div>
);

export default TabHeader;
