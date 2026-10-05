"use client";
// Adapted from beui.dev/components/motion/combobox for the admin theme.
import { ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { mergeRefs, useComboboxContext } from "./shared-context";

export function ComboboxTrigger({
  children,
  className
}) {
  const { triggerRef, triggerId, open, disabled, inputRef, setOpen } = useComboboxContext("ComboboxTrigger");

  return (
    <div
      ref={triggerRef}
      id={triggerId}
      data-state={open ? "open" : "closed"}
      onPointerDown={(event) => {
        if (disabled || event.target === inputRef.current) return;
        event.preventDefault();
        inputRef.current?.focus({ preventScroll: true });
        setOpen(true);
      }}
      className={cn(
        "relative z-20 flex h-10 w-full min-w-52 cursor-text items-center justify-between gap-3 rounded-xl border border-theme-base bg-transparent px-3 text-sm text-theme-primary transition-[border-color] hover:border-[var(--accent)]",
        "focus-within:ring-2 focus-within:ring-[var(--accent)]",
        disabled && "pointer-events-none opacity-50",
        className
      )}>
      <span className="min-w-0 flex-1 text-left">{children}</span>
      <span aria-hidden className="shrink-0 text-[var(--admin-text-secondary,#888)]">
        <ChevronsUpDown className="size-4" />
      </span>
    </div>
  );
}

export function ComboboxValue({
  placeholder = "Select an option",
  children,
  className
}) {
  const context = useComboboxContext("ComboboxValue");
  const label = context.labelFor(context.value);
  const content =
    typeof children === "function"
      ? children(context.value, label)
      : children ?? label ?? placeholder;

  return (
    <span
      className={cn("block truncate", context.value === undefined
        ? "text-[var(--admin-text-secondary,#888)]"
        : "text-theme-primary", className)}>
      {content}
    </span>
  );
}

export function ComboboxInput({
  ref,
  className,
  wrapperClassName,
  "aria-label": ariaLabel = "Search options",
  onChange,
  onClick,
  onFocus,
  onKeyDown,
  onPointerDown,
  placeholder = "Search…",
  ...props
}) {
  const context = useComboboxContext("ComboboxInput");
  const selectedLabel = context.labelFor(context.value);

  const handleKeyDown = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      // Opening is the whole action. While closed the list is still filtering
      // by the query the last session left, so a step taken here would be
      // measured against rows the next render replaces — and stamped with a
      // query it no longer has, which discards it. Open onto the selection,
      // and let the next key step through the list the user can see.
      if (!context.open) {
        context.setOpen(true);
        return;
      }
      context.moveActive(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Home" && context.open) {
      event.preventDefault();
      context.moveActive("first");
    } else if (event.key === "End" && context.open) {
      event.preventDefault();
      context.moveActive("last");
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (context.open) context.selectActive();
      else context.setOpen(true);
    } else if (event.key === "Escape" && context.open) {
      event.preventDefault();
      context.setOpen(false, true);
    }
  };

  return (
    <div
      className={cn("flex min-w-0 flex-1 items-center gap-2", wrapperClassName)}>
      <Search aria-hidden className="size-4 shrink-0 text-[var(--admin-text-secondary,#888)]" />
      <input
        {...props}
        ref={mergeRefs(ref, context.inputRef)}
        id={context.inputId}
        role="combobox"
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={context.open}
        aria-controls={context.listId}
        aria-activedescendant={
          context.open ? context.activeItemId : undefined
        }
        autoComplete="off"
        disabled={context.disabled}
        value={context.open ? context.query : (selectedLabel ?? "")}
        placeholder={placeholder}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || context.open) return;
          event.preventDefault();
          context.inputRef.current?.focus({ preventScroll: true });
          context.setOpen(true);
        }}
        onFocus={(event) => {
          context.setOpen(true);
          onFocus?.(event);
        }}
        onClick={(event) => {
          context.setOpen(true);
          onClick?.(event);
        }}
        onChange={(event) => {
          context.setOpen(true);
          context.setQuery(event.target.value);
          onChange?.(event);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-10 min-w-0 flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-[var(--admin-text-secondary,#888)] disabled:cursor-not-allowed",
          className
        )} />
    </div>
  );
}
