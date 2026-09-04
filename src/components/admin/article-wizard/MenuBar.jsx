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
    <div className="flex rounded-2xl  flex-wrap items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 border-b border-theme-base sticky top-0 z-10 bg-transparent">
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
          editor?.chain().focus().toggleHeading({ level: 1 }).run()
        }
        isActive={editor?.isActive("heading", { level: 1 })}
        icon={Heading1}
        title="H1"
      />
      <Btn
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run()
        }
        isActive={editor?.isActive("heading", { level: 2 })}
        icon={Heading2}
        title="H2"
      />
      <Btn
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 3 }).run()
        }
        isActive={editor?.isActive("heading", { level: 3 })}
        icon={Heading3}
        title="H3"
      />
      <div className="w-px h-5 bg-white/[0.08] mx-0.5" />
      <Btn
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        isActive={editor?.isActive("bulletList")}
        icon={List}
        title="Bullets"
      />
      <Btn
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        isActive={editor?.isActive("orderedList")}
        icon={ListOrdered}
        title="Numbers"
      />
      <Btn
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        isActive={editor?.isActive("blockquote")}
        icon={Quote}
        title="Quote"
      />
      <div className="w-px h-5 bg-white/[0.08] mx-0.5" />
      <Btn
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
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
