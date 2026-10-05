"use client";
// Accessible native-dialog surface for the BeUI drawer and morphing-modal motion.
import { animate, motion as Motion, useReducedMotion, useDragControls } from 'motion/react';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { EASE_DRAWER, SPRING_PANEL } from '../../lib/ease';
import { cn } from '../../lib/utils';

const subscribe = callback => {
  const query = window.matchMedia('(min-width: 640px)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};
const desktopSnapshot = () => window.matchMedia('(min-width: 640px)').matches;

export function ModalSurface({ viewId, onClose, children, placement = 'responsive', className, ariaLabelledby, busy = false }) {
  const dialogRef = useRef(null);
  const panelRef = useRef(null);
  const closingRef = useRef(false);
  const reduce = useReducedMotion();
  const desktop = useSyncExternalStore(subscribe, desktopSnapshot, () => false);
  const dragControls = useDragControls();
  const open = viewId !== null;
  const sheet = !desktop && placement !== 'center';
  const drawer = desktop && placement === 'drawer';
  const dismiss = async () => {
    if (busy || closingRef.current) return;
    closingRef.current = true;
    if (!reduce && panelRef.current) await animate(panelRef.current, { x: drawer ? '110%' : 0, y: sheet ? '110%' : 0, scale: sheet || drawer ? 1 : 0.97 }, { duration: 0.2, ease: EASE_DRAWER }).finished;
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    closingRef.current = false;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      const target = panel?.querySelector('[autofocus], [data-autofocus]') || panel?.querySelector('input, button, select, a[href]') || panel;
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, viewId]);

  return createPortal(<dialog ref={dialogRef} aria-labelledby={ariaLabelledby} aria-busy={busy}
    onCancel={event => { event.preventDefault(); void dismiss(); }}
    onClickCapture={event => { if (event.target.closest('[data-modal-close]')) { event.preventDefault(); event.stopPropagation(); void dismiss(); } }}
    onKeyDown={event => {
      if (event.key !== 'Tab' || event.defaultPrevented) return;
      const controls = [...event.currentTarget.querySelectorAll('button, input, select, textarea, a[href], [tabindex]')]
        .filter(node => node.tabIndex >= 0 && !node.disabled && !node.closest('[inert], [aria-hidden="true"]') && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
      const first = controls[0], last = controls.at(-1);
      if (!first) { event.preventDefault(); panelRef.current?.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !controls.includes(document.activeElement))) { event.preventDefault(); first.focus(); }
    }}
    className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 text-theme-primary backdrop:bg-black/65 backdrop:backdrop-blur-sm">
    {open && <div className={cn('flex h-full w-full', sheet ? 'items-end' : drawer ? 'items-stretch justify-end p-3' : 'items-center justify-center p-4')}
      onClick={event => { if (event.target === event.currentTarget) void dismiss(); }}>
      <Motion.div ref={panelRef} tabIndex={-1} layout={!reduce} initial={reduce ? false : { x: drawer ? '110%' : 0, y: sheet ? '110%' : 16, scale: sheet || drawer ? 1 : 0.97 }}
        animate={{ x: 0, y: 0, scale: 1 }} transition={reduce ? { duration: 0 } : SPRING_PANEL}
        drag={sheet && !busy ? 'y' : false} dragControls={dragControls} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => { if (info.offset.y > 100 || info.velocity.y > 700) void dismiss(); }}
        className={cn('relative flex w-full max-w-md flex-col border border-theme-base bg-[var(--admin-card-bg)] shadow-2xl outline-none', sheet ? 'max-h-[92dvh] rounded-t-[28px] pb-[env(safe-area-inset-bottom)]' : drawer ? 'h-full rounded-3xl' : 'max-h-[90dvh] rounded-3xl', className)}>
        {sheet && <div aria-hidden="true" onPointerDown={event => { if (!busy) dragControls.start(event); }} className="flex h-6 shrink-0 touch-none items-center justify-center"><span className="h-1 w-9 rounded-full bg-current opacity-20" /></div>}
        <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6">{children}</div>
      </Motion.div>
    </div>}
  </dialog>, document.body);
}
