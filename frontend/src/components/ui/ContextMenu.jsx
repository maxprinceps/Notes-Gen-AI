/**
 * components/ui/ContextMenu.jsx
 * Sprint 3, Task 2
 * Right-click context menu for every note element.
 * Options: Regenerate with AI, Change Color, Reset Color
 */

import { useEffect, useRef } from "react";

export default function ContextMenu({ x, y, onRegenerate, onChangeColor, onClose }) {
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keep menu inside viewport
  const menuX = Math.min(x, window.innerWidth - 200);
  const menuY = Math.min(y, window.innerHeight - 150);

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200
                 py-1 w-48 text-sm"
      style={{ left: menuX, top: menuY }}
    >
      <button
        onClick={() => { onRegenerate(); onClose(); }}
        className="w-full px-4 py-2.5 text-left hover:bg-orange-50
                   hover:text-brand-orange transition-colors flex items-center gap-2
                   font-medium"
      >
        ✨ Regenerate with AI
      </button>

      <button
        onClick={() => { onChangeColor(); onClose(); }}
        className="w-full px-4 py-2.5 text-left hover:bg-blue-50
                   hover:text-blue-700 transition-colors flex items-center gap-2
                   font-medium"
      >
        🎨 Change Color
      </button>

      <div className="border-t border-gray-100 my-1" />

      <button
        onClick={onClose}
        className="w-full px-4 py-2.5 text-left hover:bg-gray-50
                   text-gray-500 transition-colors flex items-center gap-2"
      >
        ✕ Close
      </button>
    </div>
  );
}