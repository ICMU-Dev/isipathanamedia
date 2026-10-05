"use client";
// Adapted from beui.dev/components/motion/combobox for the admin theme.
import { motion as Motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePopoverPortalPosition } from "@/components/motion/popover-position";
import { cn } from "@/lib/utils";
import { useComboboxContext } from "./shared-context";

// The panel uses one weighted spring for both directions, so opening and
// closing travel through the same detached geometry.
const COMBOBOX_MORPH = {
  type: "spring",
  duration: 0.5,
  bounce: 0.22,
};
const VIEWPORT_PADDING = 8;

export function ComboboxContent({
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  avoidCollisions = true,
  className
}) {
  const { triggerRef, contentRef, open, reduce } = useComboboxContext("ComboboxContent");
  const measureRef = useRef(null);
  const [portalReady, setPortalReady] = useState(false);
  const [portalContainer, setPortalContainer] = useState(null);
  const [actualSide, setActualSide] = useState(side);
  const [morphReady, setMorphReady] = useState(false);
  const layout = usePopoverPortalPosition(triggerRef, measureRef, portalReady);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPortalContainer(triggerRef.current?.closest('dialog') || document.body);
      setPortalReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [triggerRef]);
  useLayoutEffect(() => {
    if (!portalReady) return;
    const readyFrame = requestAnimationFrame(() => setMorphReady(true));
    return () => cancelAnimationFrame(readyFrame);
  }, [portalReady]);

  useLayoutEffect(() => {
    // Preserve the resolved side during exit, so top panels close upward.
    if (!open || !layout) return;
    let nextSide = side;
    const below =
      window.innerHeight - (layout.trigger.top + layout.trigger.height);
    const above = layout.trigger.top;
    if (
      avoidCollisions && side === "bottom" &&
      below < layout.content.height + sideOffset &&
      above > below
    )
      nextSide = "top";
    else if (
      avoidCollisions && side === "top" &&
      above < layout.content.height + sideOffset &&
      below > above
    )
      nextSide = "bottom";
    const frame = requestAnimationFrame(() => setActualSide(nextSide));
    return () => cancelAnimationFrame(frame);
  }, [avoidCollisions, open, layout, side, sideOffset]);

  if (!portalReady || !portalContainer) return null;

  const triggerLeft = layout?.trigger.left ?? 0;
  const triggerWidth = layout?.trigger.width ?? 0;
  const contentWidth = layout?.content.width ?? triggerWidth;
  const desiredLeft =
    align === "end"
      ? triggerLeft + triggerWidth - contentWidth
      : align === "center"
        ? triggerLeft + (triggerWidth - contentWidth) / 2
        : triggerLeft;
  const maxLeft = Math.max(VIEWPORT_PADDING, window.innerWidth - contentWidth - VIEWPORT_PADDING);
  const left = Math.min(Math.max(desiredLeft, VIEWPORT_PADDING), maxLeft);
  const surfaceHeight = layout?.content.height ?? 0;

  return createPortal(<Motion.div
    ref={contentRef}
    data-combobox-content=""
    data-side={actualSide}
    aria-hidden={!open}
    inert={!open}
    initial={false}
    animate={{
      height: open ? surfaceHeight : 0,
      opacity: open ? 1 : 0,
      y: open
        ? actualSide === "bottom"
          ? sideOffset
          : -sideOffset
        : 0,
    }}
    transition={
      reduce || !morphReady ? { duration: 0 } : COMBOBOX_MORPH
    }
    style={
      {
        left,

        top:
          actualSide === "bottom" && layout
            ? layout.trigger.top + layout.trigger.height
            : undefined,

        bottom:
          actualSide === "top" && layout
            ? window.innerHeight - layout.trigger.top
            : undefined,

        minWidth: triggerWidth,
        pointerEvents: open ? "auto" : "none",
        transformOrigin: actualSide === "bottom" ? "top" : "bottom",
        visibility: layout ? "visible" : "hidden",
        "--combobox-trigger-width": `${triggerWidth}px`
      }
    }
    className={cn(
      "fixed z-[9999] w-[var(--combobox-trigger-width)] overflow-hidden rounded-xl border border-theme-base bg-[var(--admin-card-bg)] text-theme-primary outline-none will-change-[height,transform]",
      className
    )}>
    <Motion.div
      ref={measureRef}
      initial={false}
      animate={{ opacity: open ? 1 : 0 }}
      transition={
        reduce || !morphReady ? { duration: 0 } : COMBOBOX_MORPH
      }>
      {children}
    </Motion.div>
  </Motion.div>, portalContainer);
}
