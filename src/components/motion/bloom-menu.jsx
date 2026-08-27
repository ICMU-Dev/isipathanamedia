"use client";

import {
  Bug,
  LayoutGrid,
  Link,
  Plus,
  Route,
  Terminal,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Path Checker", icon: Route },
  { label: "Debug Info", icon: Bug },
  { label: "Console", icon: Terminal },
];

const SPRING_FOLDER = {
  type: "spring",
  stiffness: 300,
  damping: 32,
  mass: 0.9,
};

export function BloomMenu({
  items = ITEMS,
  onSelect,
  className,
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const layoutId = useId();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target))
        setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const morph = reduce ? { duration: 0.15 } : SPRING_FOLDER;

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <div className="h-12 w-12 sm:h-11 sm:w-36" aria-hidden />

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-50 grid h-[300px] w-[min(86vw,420px)] -translate-x-1/2 -translate-y-1/2 place-items-center [&>*]:pointer-events-auto">
        <AnimatePresence initial={false} mode="popLayout">
          {open ? (
            <motion.div
              key="panel"
              layoutId={layoutId}
              transition={morph}
              style={{ borderRadius: 16 }}
              className="w-[min(86vw,420px)] overflow-hidden border border-white/5 bg-[#09090b] shadow-2xl"
            >
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduce ? 0 : 0.12, duration: 0.2 }}
              >
                <div className="flex items-center justify-between border-b border-white/[0.06]  px-4 py-3 bg-[var(--admin-input-bg)]  ">
                  <span className="text-sm font-medium text-zinc-400">
                    Dev Tools
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="text-zinc-500 transition-colors hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <motion.div
                  initial={
                    reduce ? false : { clipPath: "inset(45% 34% 45% 34%)" }
                  }
                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  transition={{
                    delay: reduce ? 0 : 0.08,
                    duration: 0.45,
                    ease: EASE_OUT,
                  }}
                  className="grid grid-cols-3 bg-[#09090b]"
                >
                  {items.map((item, i) => {
                    const cols = 3;
                    const rows = Math.ceil(items.length / cols);
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const dist = Math.hypot(
                      col - (cols - 1) / 2,
                      row - (rows - 1) / 2,
                    );
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          if (onSelect) onSelect(item.label);
                          else console.log("Dev Tool selected:", item.label);
                          setOpen(false);
                        }}
                      className={cn(
                        "flex flex-col items-center justify-center px-3 py-6 text-zinc-400 transition-colors hover:text-white hover:bg-white/5",
                        i % 3 !== 2 && "border-r border-white/[0.06] ",
                        i < 3 && "border-b border-white/[0.06] ",
                      )}
                    >
                      <motion.span
                        initial={
                          reduce
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.85 }
                        }
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: reduce ? 0 : 0.1 + dist * 0.07,
                          type: "spring",
                          stiffness: 440,
                          damping: 34,
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <item.icon className="h-5 w-5 text-theme-accent " />
                        <span className="text-xs font-medium">{item.label}</span>
                      </motion.span>
                    </button>
                    );
                  })}
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.button
              key="trigger"
              type="button"
              layoutId={layoutId}
              transition={morph}
              style={{ borderRadius: 24 }}
              onClick={() => setOpen(true)}
              aria-haspopup="menu"
              aria-expanded={open}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="inline-flex h-12 w-12 sm:h-11 sm:w-36 items-center justify-center border border-white/5 bg-[#09090b] text-sm font-medium text-white shadow-xl hover:bg-white/5 transition-colors"
            >
              <motion.span
                layout
                className="inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Bug className="h-5 w-5 sm:h-4 sm:w-4 text-theme-accent " />
                <span className="hidden sm:inline-flex">Dev Tools</span>
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
