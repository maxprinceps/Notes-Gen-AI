/**
 * components/ui/EditableText.jsx
 * Sprint 3, Task 1
 * Wraps any text in a TipTap editor.
 * Click to edit inline. Blur to save.
 * Shows dashed border on hover to signal editability.
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export default function EditableText({
  value,
  onChange,
  className = "",
  tag = "p",
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editorProps: {
      attributes: {
        class: `outline-none focus:outline-none ${className}`,
      },
    },
    onBlur: ({ editor }) => {
      const text = editor.getText();
      if (text !== value) onChange(text);
    },
  });

  // Sync external value changes (e.g. after AI regeneration)
  useEffect(() => {
    if (editor && value !== editor.getText()) {
      editor.commands.setContent(value || "");
    }
  }, [value]);

  return (
    <div className="group relative cursor-text">
      {/* Hover hint */}
      <div className="absolute -top-5 left-0 text-[10px] text-gray-400
                      opacity-0 group-hover:opacity-100 transition-opacity
                      pointer-events-none font-medium">
        click to edit
      </div>

      {/* Dashed border on hover */}
      <div className="rounded transition-all duration-150
                      group-hover:outline group-hover:outline-2
                      group-hover:outline-dashed group-hover:outline-orange-300">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}