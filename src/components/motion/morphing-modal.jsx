"use client";
// beui.dev/components/motion/morphing-modal

import { AnimatePresence, motion as Motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { EASE_DRAWER, SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { ModalSurface } from './modal-surface';

export function MorphingModal({ native = false, ...props }) {
  return native ? <ModalSurface {...props} /> : <LegacyMorphingModal {...props} />;
}

function LegacyMorphingModal({
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
  useEffect(() => { const frame = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(frame); }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={cn(
            "fixed inset-0 z-[200] flex justify-center px-1",
            placement === "bottom"
              ? "items-end pb-2"
              : placement === "center"
                ? "items-center"
                : "items-end pb-4 sm:items-center sm:pb-0",
          )}
        >
          {/* Backdrop */}
          <Motion.div
            key="backdrop"
            aria-label="Close modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: EASE_DRAWER }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Panel */}
          <Motion.div
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
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative z-10 w-full max-w-sm overflow-hidden shadow-2xl will-change-transform",
              className,
            )}
          >
            <Motion.div layout="position" className="p-2 sm:p-3">
              <AnimatePresence mode="popLayout" initial={false}>
                <Motion.div
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
                  }
                >
                  {children}
                </Motion.div>
              </AnimatePresence>
            </Motion.div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
