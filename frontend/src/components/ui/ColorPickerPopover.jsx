/**
 * components/ui/ColorPickerPopover.jsx
 * Sprint 3, Task 4
 * Color picker for changing background of any section.
 * Uses react-colorful — tiny, no dependencies.
 */

import { HexColorPicker } from "react-colorful";
import { useRef, useEffect } from "react";

const PRESETS = [
  "#f5a623", "#fff8ee", "#eaf4fb", "#fef9c3",
  "#fce7f3", "#dcfce7", "#f3e8ff", "#fee2e2",
  "#ffffff", "#f1f5f9", "#1a1a1a", "#c0392b",
];

export default function ColorPickerPopover({ color, onChange, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className="absolute z-50 left-0 mt-1 bg-white rounded-xl shadow-2xl
                 border border-gray-200 p-4 w-56"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
          🎨 Background Color
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Color wheel */}
      <HexColorPicker color={color || "#ffffff"} onChange={onChange} />

      {/* Preset swatches */}
      <div className="grid grid-cols-6 gap-1.5 mt-3">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className="w-7 h-7 rounded-md border-2 transition-transform
                       hover:scale-110 active:scale-95"
            style={{
              background: preset,
              borderColor: color === preset ? "#e67e00" : "#e5e7eb",
            }}
            title={preset}
          />
        ))}
      </div>

      {/* Reset button */}
      <button
        onClick={() => { onChange(""); onClose(); }}
        className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700
                   border border-gray-200 rounded-lg py-1.5 transition-colors"
      >
        Reset to default
      </button>
    </div>
  );
}