import { useState, useEffect } from "react";
import useChatStore from "../../store/chatStore";
import useNotesStore from "../../store/notesStore";

export default function SelectionPopup() {
  const [popup, setPopup] = useState(null);
  const { openChatWithMessage } = useChatStore();
  const { notes } = useNotesStore();

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || text.length < 3) { setPopup(null); return; }

      // Don't show popup inside exam question area
      let node = selection.anchorNode;
      while (node && node !== document.body) {
        if (node.dataset?.noPopup === "true") { setPopup(null); return; }
        node = node.parentNode;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Find which note card the selection is inside
      const noteCards = document.querySelectorAll("[data-topic]");
      let topicName = null;
      let noteObj = null;
      const midX = rect.left + rect.width / 2;
      const midY = rect.top + rect.height / 2;

      for (const card of noteCards) {
        const r = card.getBoundingClientRect();
        if (midX >= r.left && midX <= r.right && midY >= r.top && midY <= r.bottom) {
          topicName = card.dataset.topic;
          noteObj = notes.find((n) => n.topic === topicName);
          break;
        }
      }

      if (!topicName && notes.length > 0) {
        topicName = notes[0].topic;
        noteObj = notes[0];
      }

      if (!topicName) return;

      setPopup({ x: midX, y: rect.top - 10, text, topic: topicName, note: noteObj });
    };

    const handleMouseDown = (e) => {
      if (!e.target.closest("[data-selection-popup]")) {
        setTimeout(() => {
          if (!window.getSelection()?.toString().trim()) setPopup(null);
        }, 100);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [notes]);

  if (!popup) return null;

  const handleChat = () => {
    // Always use openChatWithMessage — works even if sidebar already open
    openChatWithMessage(
      popup.topic,
      popup.note,
      `Explain this to me in simple terms: "${popup.text}"`
    );
    setPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div
      data-selection-popup="true"
      className="fixed z-50 no-print pointer-events-auto"
      style={{ left: popup.x, top: popup.y, transform: "translate(-50%, -100%)" }}
    >
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleChat}
        className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700
                   text-white text-xs font-bold px-3 py-2 rounded-lg
                   shadow-xl transition-colors whitespace-nowrap"
      >
        💬 Chat about this
        <span className="bg-brand-orange text-white text-[9px] px-1.5 py-0.5 rounded font-black ml-1">
          AI
        </span>
      </button>
      <div className="w-3 h-3 bg-gray-900 rotate-45 mx-auto -mt-1.5 rounded-sm" />
    </div>
  );
}