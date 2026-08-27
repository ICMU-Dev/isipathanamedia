import { motion } from "framer-motion";
"use client";

import {
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

const SHELL_SPRING = { type: "spring", duration: 0.58, bounce: 0.06 };

const TAB_CHANGE_SPRING = {
  type: "spring",
  duration: 0.46,
  bounce: 0.04,
};
const LABEL_OPEN = { type: "spring", duration: 0.38, bounce: 0.03 };
const LABEL_CLOSE = { duration: 0.16, ease: EASE_OUT };

const BAR_H = 52;
const TAB_W = 32;
const BAR_X = 16;
const BAR_GAP = 4;
const ROOT_BORDER = 2;
const ICON_W = 16;
const ACTIVE_LEFT_PAD = 10;
const ACTIVE_RIGHT_PAD = 16;
const LABEL_GAP = 7;
const PANEL_DOCK_GAP = 4;

const CONTENT_VARIANTS = {
  enter: { y: -8, scale: 0.98, opacity: 0 },
  center: { y: 0, scale: 1, opacity: 1 },
  exit: {
    y: -6,
    scale: 0.98,
    opacity: 0,
    transition: { duration: 0.08, ease: EASE_OUT },
  },
};

const REDUCED_CONTENT_VARIANTS = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { duration: 0.08, ease: EASE_OUT },
  },
};

const CONTENT_SPRING = { type: "spring", duration: 0.46, bounce: 0.08 };

function sameSize(a, b) {
  return a?.width === b?.width && a?.height === b?.height;
}

function sameWidths(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every((key) => a[key] === b[key]);
}

function useContentSize() {
  const ref = useRef(null);
  const [size, setSize] = useState(null);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const next = { width: el.offsetWidth, height: el.offsetHeight };
    setSize((current) => (sameSize(current, next) ? current : next));
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return [ref, size];
}

function useLabelWidths(items) {
  const refs = useRef({});
  const [widths, setWidths] = useState({});

  const setLabelMeasureRef = useCallback(
    (id) => (node) => {
      refs.current[id] = node;
    },
    [],
  );

  const measure = useCallback(() => {
    const next = {};

    for (const item of items) {
      const node = refs.current[item.id];

      if (node) {
        next[item.id] = Math.ceil(node.offsetWidth);
      }
    }

    setWidths((current) => (sameWidths(current, next) ? current : next));
  }, [items]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measure);

    for (const item of items) {
      const node = refs.current[item.id];

      if (node) {
        observer.observe(node);
      }
    }

    return () => observer.disconnect();
  }, [items, measure]);

  return { setLabelMeasureRef, widths };
}

export function ExpandableTabs({
  items,
  value,
  defaultValue = null,
  onValueChange,
  className,
  classNames,
}) {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const [sizerRef, size] = useContentSize();
  const { setLabelMeasureRef, widths: labelWidths } = useLabelWidths(items);

  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const activeId = controlled ? value : internal;
  const active = items.find((item) => item.id === activeId) ?? null;
  const visualActiveId = active?.id ?? null;

  const setActive = useCallback(
    (next) => {
      if (!controlled) setInternal(next);
      if (onValueChange) onValueChange(next);
    },
    [controlled, onValueChange],
  );

  useEffect(() => {
    if (!visualActiveId) return;
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setActive(null);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [setActive, visualActiveId]);

  const closedSize = {
    width:
      items.length * TAB_W +
      Math.max(0, items.length - 1) * BAR_GAP +
      BAR_X +
      ROOT_BORDER,
    height: BAR_H + ROOT_BORDER,
  };
  const openSize = size
    ? {
        width: Math.max(size.width + ROOT_BORDER, closedSize.width),
        height: Math.max(size.height + ROOT_BORDER, closedSize.height),
      }
    : closedSize;
  const targetSize = active ? openSize : closedSize;

  const getActiveTabWidth = useCallback(
    (item) =>
      Math.max(
        TAB_W,
        ACTIVE_LEFT_PAD +
          ICON_W +
          LABEL_GAP +
          (labelWidths[item.id] ?? 0) +
          ACTIVE_RIGHT_PAD,
      ),
    [labelWidths],
  );

  return (
    <>
      <motion.div
        ref={rootRef}
        initial={false}
        animate={
          targetSize
            ? { width: targetSize.width, height: targetSize.height }
            : undefined
        }
        transition={reduce ? { duration: 0 } : SHELL_SPRING}
        style={{ transformOrigin: "bottom center" }}
        className={cn(
          "relative overflow-hidden rounded-[26px] border border-white/5 bg-[#09090b]",
          className,
          classNames?.root,
        )}
      >
        <div
          ref={sizerRef}
          aria-hidden
          className={cn(
            "pointer-events-none invisible absolute left-0 top-0 grid w-max px-2 pt-2",
            classNames?.panel,
          )}
          style={{ paddingBottom: BAR_H + PANEL_DOCK_GAP }}
        >
          {items.map((item) => (
            <div key={item.id} className="col-start-1 row-start-1 w-max">
              {item.content}
            </div>
          ))}
        </div>

        <div
          className={cn(
            "absolute left-0 right-0 top-0 z-10 overflow-hidden px-2 pt-2",
            classNames?.panel,
          )}
          style={{ bottom: BAR_H + PANEL_DOCK_GAP }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {active ? (
              <motion.div
                key={active.id}
                variants={reduce ? REDUCED_CONTENT_VARIANTS : CONTENT_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={
                  reduce ? { duration: 0.15, ease: EASE_OUT } : CONTENT_SPRING
                }
                className="w-max"
                style={{
                  transformOrigin: "top center",
                  willChange: "transform, opacity",
                }}
              >
                {active.content}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div
          role="tablist"
          aria-label="Navigation tabs"
          aria-orientation="horizontal"
          className={cn(
            "absolute bottom-0 left-0 z-20 flex w-full items-center justify-between gap-1 p-2",
            classNames?.bar,
          )}
          style={{ height: BAR_H }}
        >
          {items.map((item) => {
            const isActive = item.id === visualActiveId;
            const activeTabWidth = getActiveTabWidth(item);
            const labelWidth = labelWidths[item.id] ?? 0;

            return (
              <motion.button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={item.label}
                onClick={() => setActive(isActive ? null : item.id)}
                layout={reduce ? false : "position"}
                animate={{
                  width: active && isActive ? activeTabWidth : TAB_W,
                }}
                transition={reduce ? { duration: 0 } : TAB_CHANGE_SPRING}
                className={cn(
                  "relative isolate flex h-9 min-w-8 shrink-0 items-center justify-center overflow-hidden rounded-[18px] px-2 text-sm font-medium outline-none",
                  "focus-visible:ring-2 focus-visible:ring-white/50",
                  active && isActive && "min-w-0 justify-start pl-2.5 pr-4",
                  isActive
                    ? "text-white"
                    : "text-zinc-500 hover:text-white",
                  classNames?.tab,
                  isActive && classNames?.activeTab,
                )}
              >
                {isActive ? (
                  <span
                    className={cn(
                      "absolute inset-0 -z-10 rounded-[18px] bg-white/10",
                      classNames?.pill,
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    "grid shrink-0 place-items-center",
                    classNames?.icon,
                  )}
                >
                  {item.icon}
                </span>
                <motion.span
                  aria-hidden
                  initial={false}
                  animate={{
                    width: isActive ? labelWidth : 0,
                    opacity: isActive ? 1 : 0,
                    marginLeft: isActive ? LABEL_GAP : 0,
                  }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : isActive
                        ? LABEL_OPEN
                        : LABEL_CLOSE
                  }
                  className={cn(
                    "inline-block overflow-hidden whitespace-nowrap",
                    classNames?.label,
                  )}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 -z-10 flex opacity-0"
      >
        {items.map((item) => (
          <span
            className={cn(
              "whitespace-nowrap text-sm font-medium leading-none",
              classNames?.label,
            )}
            key={item.id}
            ref={setLabelMeasureRef(item.id)}
          >
            {item.label}
          </span>
        ))}
      </div>
    </>
  );
}
