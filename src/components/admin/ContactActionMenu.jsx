import { useRef, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { BookUser, Copy, ListChecks, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

// shadcn/Radix menu primitives; keep portals inside native dialogs when present.
export default function ContactActionMenu({ contact, onView, onEdit, onDelete, onCopy, onSelect }) {
  const triggerRef = useRef(null);
  const [container, setContainer] = useState(null);
  const actionRef = useRef(null);
  const itemClass = 'flex min-h-10 cursor-default select-none items-center gap-3 rounded-lg px-3 text-xs outline-none focus:bg-[var(--admin-border)]';
  return <DropdownMenu.Root modal={false} onOpenChange={open => {
    if (open) { setContainer(triggerRef.current?.closest('dialog') || document.body); actionRef.current = null; }
  }}>
    <DropdownMenu.Trigger ref={triggerRef} aria-label={`Actions for ${contact.name}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full opacity-60 transition-colors hover:bg-[var(--admin-border)] hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"><MoreHorizontal size={18} /></DropdownMenu.Trigger>
    <DropdownMenu.Portal container={container}>
      <DropdownMenu.Content align="end" sideOffset={8} collisionPadding={16} className="contact-menu-surface z-[350] min-w-44 max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto rounded-xl p-1.5 data-[state=open]:animate-in data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 duration-150 motion-reduce:animate-none"
        onCloseAutoFocus={event => {
          if (actionRef.current) { event.preventDefault(); const action = actionRef.current; actionRef.current = null; triggerRef.current?.focus({ preventScroll: true }); requestAnimationFrame(action); }
        }}>
        {onView && <DropdownMenu.Item className={itemClass} onSelect={() => { actionRef.current = () => onView(contact); }}><BookUser size={15} />View details</DropdownMenu.Item>}
        {onSelect && <DropdownMenu.Item className={itemClass} onSelect={() => { actionRef.current = () => onSelect(contact); }}><ListChecks size={15} />Select contact</DropdownMenu.Item>}
        <DropdownMenu.Item className={itemClass} onSelect={() => { actionRef.current = () => onEdit(contact); }}><Pencil size={15} />Edit contact</DropdownMenu.Item>
        <DropdownMenu.Item className={itemClass} onSelect={() => { actionRef.current = () => onCopy(contact); }}><Copy size={15} />Copy details</DropdownMenu.Item>
        <DropdownMenu.Separator className="my-1 h-px bg-[var(--admin-border)]" />
        <DropdownMenu.Item className={itemClass + ' text-red-500'} onSelect={() => { actionRef.current = () => onDelete(contact); }}><Trash2 size={15} />Delete contact</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>;
}
