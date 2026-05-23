/**
 * components/ui/EditableSection.jsx
 * Sprint 3, Tasks 2-4
 * The master wrapper for every editable section in NoteCard.
 *
 * Features:
 * - Right-click → context menu (Regenerate / Change Color)
 * - Regenerate → AI prompt popover appears
 * - Change Color → color picker appears
 * - Color applied as inline background style
 */

import { useState, useRef } from "react";
import ContextMenu from "./ContextMenu";
import RegeneratePopover from "./RegeneratePopover";
import ColorPickerPopover from "./ColorPickerPopover";
import { regenerateElement } from "../../services/api";
import useNotesStore from "../../store/notesStore";

export default function EditableSection({
  children,
  elementKey,        // e.g. "definition", "key_points", "diagram"
  elementLabel,      // human label e.g. "Definition"
  noteIndex,         // which note this belongs to
  topic,
  subject,
  defaultBg,         // default tailwind bg class or inline color
  className = "",
}) {
  const { updateNoteField, updateElementColor, notes } = useNotesStore();
  const note = notes[noteIndex];
  const colors = note?._colors || {};
  const currentColor = colors[elementKey] || "";

  const [menu, setMenu] = useState(null);       // { x, y } or null
  const [showRegen, setShowRegen] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const wrapperRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
    setShowRegen(false);
    setShowColor(false);
  };

  const handleRegenerate = async (instruction) => {
    if (!note) return;
    setRegenLoading(true);
    setShowRegen(false);

    try {
      // Get current content for this element
      const currentContent = JSON.stringify(note[elementKey] || "");

      const result = await regenerateElement(
        elementKey,
        currentContent,
        instruction,
        topic,
        subject
      );

      // Parse the returned content and update store
      let newValue;
      try {
        newValue = JSON.parse(result.content);
      } catch {
        newValue = result.content; // plain string fallback
      }

      updateNoteField(noteIndex, elementKey, newValue);
    } catch (e) {
      console.error("Regeneration failed:", e);
    } finally {
      setRegenLoading(false);
    }
  };

  const handleColorChange = (color) => {
    updateElementColor(noteIndex, elementKey, color);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative group ${className}`}
      onContextMenu={handleContextMenu}
    >
      {/* Hover indicator — subtle right border shows element is interactive */}
      <div
        className="absolute inset-0 rounded pointer-events-none
                   opacity-0 group-hover:opacity-100 transition-opacity
                   border-2 border-dashed border-orange-200 z-10"
      />

      {/* Right-click hint on hover */}
      <div className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100
                      transition-opacity pointer-events-none">
        <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5
                         rounded font-bold tracking-wide">
          right-click to edit
        </span>
      </div>

      {/* Loading overlay during regeneration */}
      {regenLoading && (
        <div className="absolute inset-0 bg-orange-50 bg-opacity-80 rounded
                        flex items-center justify-center z-30">
          <div className="flex items-center gap-2 text-brand-orange font-bold text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-brand-orange
                            border-t-transparent animate-spin" />
            Regenerating...
          </div>
        </div>
      )}

      {/* Actual content with optional color override */}
      <div style={currentColor ? { background: currentColor } : {}}>
        {children}
      </div>

      {/* Regenerate popover */}
      {showRegen && (
        <RegeneratePopover
          elementLabel={elementLabel}
          onSubmit={handleRegenerate}
          onClose={() => setShowRegen(false)}
          loading={regenLoading}
        />
      )}

      {/* Color picker popover */}
      {showColor && (
        <ColorPickerPopover
          color={currentColor}
          onChange={handleColorChange}
          onClose={() => setShowColor(false)}
        />
      )}

      {/* Context menu */}
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onRegenerate={() => { setShowRegen(true); setMenu(null); }}
          onChangeColor={() => { setShowColor(true); setMenu(null); }}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}