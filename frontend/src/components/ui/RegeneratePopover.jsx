/**
 * components/ui/RegeneratePopover.jsx
 * Sprint 3, Task 3
 * Small prompt box that appears below a selected element.
 * User types instruction → AI regenerates just that element.
 */

import { useState, useRef, useEffect } from "react";

export default function RegeneratePopover({
  elementLabel,
  onSubmit,
  onClose,
  loading = false,
}) {
  const [instruction, setInstruction] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!instruction.trim() || loading) return;
    onSubmit(instruction.trim());
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="absolute z-40 left-0 right-0 mt-1
                    bg-white rounded-xl shadow-2xl border border-orange-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-brand-orange uppercase tracking-wide">
          ✨ Regenerate: {elementLabel}
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Instruction input */}
      <textarea
        ref={inputRef}
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        onKeyDown={handleKey}
        placeholder={`e.g. "make it simpler", "use an Indian banking example", "show types of cyber crime"`}
        rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:border-brand-orange resize-none
                   transition-colors placeholder-gray-400"
      />

      {/* Quick suggestion chips */}
      <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
        {["Make it simpler", "Add more detail", "Give Indian example", "Make it shorter"].map((s) => (
          <button
            key={s}
            onClick={() => setInstruction(s)}
            className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700
                       px-2 py-1 rounded-full transition-colors border border-orange-200"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!instruction.trim() || loading}
          className="flex-1 bg-brand-orange hover:bg-orange-700 disabled:bg-orange-200
                     text-white font-bold text-sm py-2 rounded-lg transition-colors"
        >
          {loading ? "Regenerating..." : "✨ Regenerate"}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700
                     border border-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-2 text-center">
        Press Enter to regenerate • Esc to cancel
      </p>
    </div>
  );
}