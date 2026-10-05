import { useEffect, useRef } from 'react';

// Keep scrolling and ordinary taps intact; a held press starts selection.
export default function useContactPress(onSelect) {
  const timer = useRef(null);
  const start = useRef(null);
  const held = useRef(false);
  const cancel = () => { clearTimeout(timer.current); timer.current = null; };
  useEffect(() => () => clearTimeout(timer.current), []);
  return {
    onPointerDown: event => {
      cancel();
      held.current = false;
      if (!event.isPrimary || event.button !== 0 || event.target.closest('a, input, [data-contact-actions]')) return;
      start.current = { x: event.clientX, y: event.clientY };
      timer.current = setTimeout(() => { held.current = true; onSelect(); }, 550);
    },
    onPointerMove: event => {
      if (start.current && Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y) > 10) cancel();
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onContextMenu: event => { if (held.current || timer.current) event.preventDefault(); },
    onClickCapture: event => {
      if (held.current) { event.preventDefault(); event.stopPropagation(); held.current = false; }
    },
  };
}
