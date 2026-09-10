import React from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  ImagePlus,
  Link2,
  Unlink,
} from "lucide-react";

const MenuBar = ({ editor, onInsertImage }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const runSmartFormat = (formatCallback) => {
    if (!editor) return;
    const { state } = editor;
    const { from, to, empty } = state.selection;

    if (empty) {
      formatCallback(editor.chain().focus()).run();
      return;
    }

    const $from = state.doc.resolve(from);
    const $to = state.doc.resolve(to);
    const hasTextBefore = $from.parentOffset > 0;
    const hasTextAfter = $to.parentOffset < $to.parent.content.size;

    let hasHardBreaks = false;
    state.doc.nodesBetween(from, to, (node) => {
      if (node.type.name === "hardBreak") {
        hasHardBreaks = true;
        return false;
      }
    });

    if (!hasTextBefore && !hasTextAfter && !hasHardBreaks) {
      formatCallback(editor.chain().focus()).run();
      return;
    }

    // Isolate selected text into its own block
    const chain = editor.chain().focus().command(({ tr, state, dispatch }) => {
      if (!dispatch) return true;

      // 1. Replace hardBreaks inside selection with paragraph splits
      if (hasHardBreaks) {
        const breakPositions = [];
        tr.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type.name === "hardBreak") {
            breakPositions.push(pos);
          }
        });
        for (let i = breakPositions.length - 1; i >= 0; i--) {
          const bp = breakPositions[i];
          const mappedBp = tr.mapping.map(bp);
          tr.delete(mappedBp, mappedBp + 1);
          try {
            tr.split(mappedBp);
          } catch {}
        }
      }

      // 2. Split boundaries if selection only covers partial line/paragraph
      const curFrom = tr.mapping.map(from, 1);
      const curTo = tr.mapping.map(to, -1);

      try {
        const resTo = tr.doc.resolve(curTo);
        if (resTo.parentOffset < resTo.parent.content.size && resTo.depth > 0) {
          tr.split(curTo);
        }
      } catch {}

      try {
        const resFrom = tr.doc.resolve(curFrom);
        if (resFrom.parentOffset > 0 && resFrom.depth > 0) {
          tr.split(resFrom);
        }
      } catch {}

      const finalFrom = tr.mapping.map(curFrom, 1);
      const finalTo = tr.mapping.map(curTo, -1);

      const TextSelection = state.selection.constructor;
      if (finalFrom < finalTo) {
        try {
          tr.setSelection(TextSelection.create(tr.doc, finalFrom, finalTo));
        } catch {}
      }
      return true;
    });

    formatCallback(chain).run();
  };

  const Btn = ({ onClick, isActive, disabled, icon: Icon, title }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-2xl transition-all flex items-center justify-center shrink-0 active:scale-90
        ${isActive ? "bg-theme-accent/20 text-theme-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)]" : "text-theme-primary opacity-60 hover:text-theme-accent hover:bg-white/[0.08]"}
        ${disabled ? "opacity-20 cursor-not-allowed" : ""}`}>
      <Icon size={18} />
    </button>
  );

  return (
    <div className="flex rounded-2xl flex-wrap items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 border-b border-theme-base sticky top-0 z-10 bg-transparent">
      <Btn
        onClick={() => editor?.chain().focus().toggleBold().run()}
        isActive={editor?.isActive("bold")}
        icon={Bold}
        title="Bold"
      />
      <Btn
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        isActive={editor?.isActive("italic")}
        icon={Italic}
        title="Italic"
      />
      <Btn
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        isActive={editor?.isActive("strike")}
        icon={Strikethrough}
        title="Strike"
      />
      <div className="w-px h-5 bg-white/[0.08] mx-0.5" />
      <Btn
        onClick={() =>
          runSmartFormat((chain) => chain.toggleHeading({ level: 1 }))
        }
        isActive={editor?.isActive("heading", { level: 1 })}
        icon={Heading1}
        title="H1"
      />
      <Btn
        onClick={() =>
          runSmartFormat((chain) => chain.toggleHeading({ level: 2 }))
        }
        isActive={editor?.isActive("heading", { level: 2 })}
        icon={Heading2}
        title="H2"
      />
      <Btn
        onClick={() =>
          runSmartFormat((chain) => chain.toggleHeading({ level: 3 }))
        }
        isActive={editor?.isActive("heading", { level: 3 })}
        icon={Heading3}
        title="H3"
      />
      <div className="w-px h-5 bg-white/[0.08] mx-0.5" />
      <Btn
        onClick={() => runSmartFormat((chain) => chain.toggleBulletList())}
        isActive={editor?.isActive("bulletList")}
        icon={List}
        title="Bullets"
      />
      <Btn
        onClick={() => runSmartFormat((chain) => chain.toggleOrderedList())}
        isActive={editor?.isActive("orderedList")}
        icon={ListOrdered}
        title="Numbers"
      />
      <Btn
        onClick={() => runSmartFormat((chain) => chain.toggleBlockquote())}
        isActive={editor?.isActive("blockquote")}
        icon={Quote}
        title="Quote"
      />
      <div className="w-px h-5 bg-white/[0.08] mx-0.5" />
      <Btn
        onClick={() => runSmartFormat((chain) => chain.toggleCodeBlock())}
        isActive={editor?.isActive("codeBlock")}
        icon={Code}
        title="Code"
      />
      <div className="w-px h-5 bg-white/[0.08] mx-0.5" />
      <Btn
        onClick={setLink}
        isActive={editor?.isActive("link")}
        icon={Link2}
        title={editor?.isActive("link") ? "Edit Link" : "Insert Link"}
      />
      {editor?.isActive("link") && (
        <Btn
          onClick={() => editor?.chain().focus().unsetLink().run()}
          icon={Unlink}
          title="Remove Link"
        />
      )}
      <Btn onClick={onInsertImage} icon={ImagePlus} title="Insert Image" />
      <div className="flex-1" />
      <Btn
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={!editor?.can?.()?.undo?.()}
        icon={Undo}
        title="Undo"
      />
      <Btn
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={!editor?.can?.()?.redo?.()}
        icon={Redo}
        title="Redo"
      />
    </div>
  );
};

export default MenuBar;
