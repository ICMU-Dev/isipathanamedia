"use client";
// BeUI drawer motion with native focus containment, safe-area and bottom-sheet support.
import { ModalSurface } from './modal-surface';

export function Drawer({ open, onOpenChange, children, ...props }) {
  return <ModalSurface viewId={open ? 'drawer' : null} onClose={() => onOpenChange(false)} placement="drawer" {...props}>{children}</ModalSurface>;
}
