import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const PrimaryButton = ({
  children,
  to,
  href,
  onClick,
  disabled,
  className = "",
  showArrow = true,
  type = "button",
}) => {
  const baseClasses =
    "bg-white text-dark font-black py-3.5 px-8 md:px-10 rounded-2xl inline-flex items-center justify-center gap-3 group overflow-hidden relative shadow-2xl transition-transform active:scale-95 disabled:opacity-50 " +
    className;

  const content = (
    <>
      <div className="absolute inset-0 transition-transform duration-500 ease-out translate-y-full bg-primary-neon group-hover:translate-y-0"></div>
      <span className="relative z-10 flex items-center gap-4 text-[11px] uppercase tracking-[0.4em]">
        {children}
        {showArrow && (
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-2"
          />
        )}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClasses} onClick={onClick}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={baseClasses}>
      {content}
    </button>
  );
};

export default PrimaryButton;
