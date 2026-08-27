import { motion } from "framer-motion";
"use client";
// beui.dev/components/motion/morphing-modal

import { AnimatePresence, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {  EASE_DRAWER, SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";

export function MorphingModal({
  viewId,
  onClose,
  children,
  placement = "responsive",
  className,
  style,
}) {
  const open = viewId !== null;
  const reduce = useReducedMotion();
  const enterY = reduce
    ? 0
    : placement === "bottom" || placement === "responsive"
      ? 40
      : 20;
  const enterScale = reduce ? 1 : 0.90;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "fixed inset-0 z-[120]",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}>
      <motion.button
        type="button"
        aria-label="Close modal"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.1, ease: EASE_DRAWER }}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/80",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex justify-center px-1",
          placement === "bottom"
            ? "items-end pb-2"
            : placement === "center"
              ? "items-center"
              : "items-end pb-4 sm:items-center sm:pb-0",
        )}>
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="panel"
              layout
              initial={{ opacity: 0, y: enterY, scale: enterScale }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: enterY,
                scale: reduce ? 1 : 0.90,
                transition: { duration: 0.18, ease: EASE_DRAWER },
              }}
              transition={SPRING_PANEL}
              style={style}
              className={cn(
                "pointer-events-auto relative w-full max-w-sm overflow-hidden  shadow-2xl will-change-transform",
                className,
              )}>
              <motion.div layout="position" className="p-2 sm:p-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={viewId}
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, y: 8 }
                    }
                    animate={
                      reduce
                        ? {
                            opacity: 1,
                            transition: {
                              duration: 0.18,
                              ease: EASE_DRAWER,
                            },
                          }
                        : {
                            opacity: 1,
                            y: 0,
                            transition: {
                              duration: 0.24,
                              ease: EASE_DRAWER,
                            },
                          }
                    }
                    exit={
                      reduce
                        ? {
                            opacity: 0,
                            transition: {
                              duration: 0.14,
                              ease: EASE_DRAWER,
                            },
                          }
                        : {
                            opacity: 0,
                            y: -8,
                            transition: {
                              duration: 0.16,
                              ease: EASE_DRAWER,
                            },
                          }
                    }>
                    {children}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>,
    document.body,
  );
}
