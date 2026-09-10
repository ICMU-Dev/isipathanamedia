"use client";

import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import React from "react";
import { useSmoothScroll } from "@/components/motion/smooth-scroll";
import { cn } from "@/lib/utils";

// Soft follow so the indicator trails the scroll smoothly instead of snapping;
// looser than the UI springs in lib/ease.js on purpose.
const PROGRESS_SPRING = { stiffness: 120, damping: 30, mass: 0.6 };

function useProgressValue(source, spring) {
  const reduce = useReducedMotion();
  const fallback = useSmoothScroll().progress;
  const raw = source ?? fallback;
  const smoothed = useSpring(raw, PROGRESS_SPRING);
  return spring && !reduce ? smoothed : raw;
}

export function ScrollProgress(props) {
  if (props.variant === "circle") return <ScrollProgressCircle {...props} />;
  return <ScrollProgressBar {...props} />;
}

function ScrollProgressBar({
  progress,
  spring = true,
  position = "top",
  height = 2,
  fixed = true,
  className,
}) {
  const value = useProgressValue(progress, spring);
  return (
    <motion.div
      aria-hidden
      style={{ height, scaleX: value }}
      className={cn(
        "left-0 right-0 z-50 origin-left bg-foreground",
        fixed ? "fixed" : "absolute",
        position === "top" ? "top-0" : "bottom-0",
        className
      )}
    />
  );
}

function ScrollProgressCircle({
  progress,
  spring = true,
  size = 40,
  thickness = 3,
  className,
}) {
  const value = useProgressValue(progress, spring);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = useTransform(value, (v) => circumference * (1 - v));

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="presentation"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("text-foreground", className)}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={thickness}
        className="stroke-current opacity-15"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={thickness}
        strokeLinecap="round"
        className="stroke-current"
        strokeDasharray={circumference}
        style={{ strokeDashoffset: offset }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
