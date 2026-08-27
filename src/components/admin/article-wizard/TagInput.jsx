import React, { useState } from "react";
import { Hash, X } from "lucide-react";

const TagInput = ({ tags, setTags, disabled, error }) => {
  const [input, setInput] = useState("");

  const addTag = () => {
    if (disabled) return;
    const cleanInput = input.trim().replace(/^#+/, '');
    if (cleanInput.length > 24 || tags.length >= 8) return;
    if (cleanInput.length > 0 && !tags.includes(cleanInput)) {
      setTags([...tags, cleanInput]);
    }
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && input === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-theme-primary opacity-50 ml-1">
        <Hash size={12} className="inline mr-1" />
        Tags
      </label>
      <div className={`flex flex-wrap gap-2 p-3 admin-input border-theme rounded-2xl min-h-[48px] focus-within:border-theme-accent/40 transition-colors ${error ? "border-red-600/50" : ""}`}>
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-theme-accent/5 border border-theme-accent/20 text-theme-accent rounded-2xl text-xs font-bold tracking-wide">
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                className="hover:text-red-400 transition-colors ml-0.5">
                <X size={12} />
              </button>
            )}
          </span>
        ))}
        <input
          type="text"
          value={input}
          maxLength={24}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input.trim() && addTag()}
          disabled={disabled}
          placeholder={
            disabled
              ? ""
              : tags.length === 0
                ? "Type a tag and press Enter..."
                : "Add more..."
          }
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-theme-primary placeholder:text-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <div className="flex justify-between text-[10px] text-theme-primary opacity-40">
        <span>{tags.length}/8 tags</span>
        <span>24 characters per tag</span>
      </div>
      {error && <p className="text-red-400 text-xs ml-1">{error}</p>}
    </div>
  );
};

export default TagInput;
