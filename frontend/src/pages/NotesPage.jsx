/**
 * pages/NotesPage.jsx — Updated with Chat Sidebar
 */

// import { useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import useNotesStore from "../store/notesStore";
// import useChatStore from "../store/chatstore";
// import NoteCard from "../components/notes/NoteCard";
// import StreamingCard from "../components/notes/StreamingCard";
// import ChatSidebar from "../components/ui/ChatSidebar";
// import SelectionPopup from "../components/ui/selectionPopup";
// import { exportAsPdf } from "../utils/exportPdf";

import useNotesStore from "../store/notesStore";
import useChatStore from "../store/chatstore";
import NoteCard from "../components/notes/NoteCard";
import StreamingCard from "../components/notes/StreamingCard";
import ChatSidebar from "../components/ui/ChatSidebar";
import SelectionPopup from "../components/ui/selectionPopup";
import { exportAsPdf } from "../utils/exportPdf";

export default function NotesPage() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const {
    subject, notes, isGenerating,
    currentTopicName, totalTopics,
    streamBuffer, reset,
  } = useNotesStore();

  const { openChat, isOpen } = useChatStore();

  useEffect(() => {
    if (!subject) navigate("/");
  }, [subject]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes.length, streamBuffer]);

  const progress = totalTopics > 0
    ? Math.round((notes.length / totalTopics) * 100)
    : 0;

  const handleFloatingChat = () => {
    if (notes.length > 0) {
      openChat(notes[0].topic, notes[0], "");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Top bar ── */}
      <div className="no-print sticky top-0 z-40 bg-white border-b border-gray-200
                      shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-black text-lg text-gray-900">
            Note<span className="text-brand-orange">Gen</span>AI
          </h1>
          <span className="text-sm text-gray-400 font-medium">— {subject}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress bar */}
          {isGenerating && (
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-orange rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                {notes.length}/{totalTopics} topics
              </span>
            </div>
          )}

          {/* Done badge */}
          {!isGenerating && notes.length > 0 && (
            <span className="bg-green-100 text-green-700 text-xs font-bold
                             px-3 py-1 rounded-full">
              ✅ {notes.length} topics ready
            </span>
          )}

          {/* Chat button */}
          {!isGenerating && notes.length > 0 && (
            <button
              onClick={handleFloatingChat}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700
                         text-white font-bold text-sm px-4 py-2 rounded-lg
                         transition-colors shadow-sm"
            >
              💬 Ask AI
            </button>
          )}

          {/* Export PDF */}
          {!isGenerating && notes.length > 0 && (
            <button
              onClick={() => exportAsPdf(subject)}
              className="flex items-center gap-2 bg-brand-red hover:bg-red-700
                         text-white font-bold text-sm px-4 py-2 rounded-lg
                         transition-colors shadow-sm"
            >
              📄 Export PDF
            </button>
          )}

          {/* Back */}
          <button
            onClick={() => { reset(); navigate("/"); }}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            ← New Notes
          </button>
        </div>
      </div>

      {/* ── Notes canvas ── */}
      <div className={`max-w-4xl mx-auto px-4 py-8 print:px-0 print:py-0
                       print:max-w-none transition-all duration-300
                       ${isOpen ? "mr-96" : ""}`}>

        {/* Empty state */}
        {notes.length === 0 && !isGenerating && (
          <div className="text-center py-20 text-gray-400 no-print">
            <p className="text-lg font-medium">No notes yet.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 text-brand-orange font-bold hover:underline"
            >
              ← Go back and generate
            </button>
          </div>
        )}

        {/* Completed note cards */}
        {notes.map((note, i) => (
          <NoteCard
            key={note.topic || i}
            note={note}
            index={i}
            subject={subject}
            isStreaming={false}
          />
        ))}

        {/* Streaming card */}
        {isGenerating && streamBuffer && (
          <StreamingCard
            topicName={currentTopicName}
            topicIndex={notes.length}
            subject={subject}
            buffer={streamBuffer}
          />
        )}

        {/* Generating indicator */}
        {isGenerating && !streamBuffer && (
          <div className="no-print w-full max-w-3xl mx-auto mb-10">
            <div className="grid-bg border border-gray-200 rounded-sm shadow-xl p-10">
              <div className="flex items-center gap-3 text-brand-orange">
                <div className="w-4 h-4 rounded-full bg-brand-orange animate-pulse" />
                <span className="font-bold text-sm">
                  Generating: {currentTopicName}...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Completion */}
        {!isGenerating && notes.length > 0 && (
          <div className="no-print text-center py-8">
            <div className="inline-flex flex-col items-center gap-3 bg-white
                            rounded-xl shadow-md px-10 py-6 border border-gray-100">
              <span className="text-3xl">🎉</span>
              <p className="font-black text-gray-900 text-lg">
                All {notes.length} topics generated!
              </p>
              <p className="text-gray-500 text-sm">
                Select any text to chat with AI • Right-click to edit
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleFloatingChat}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700
                             text-white font-bold px-5 py-2.5 rounded-lg
                             transition-colors shadow-md text-sm"
                >
                  💬 Ask AI
                </button>
                <button
                  onClick={() => exportAsPdf(subject)}
                  className="flex items-center gap-2 bg-brand-red hover:bg-red-700
                             text-white font-bold px-5 py-2.5 rounded-lg
                             transition-colors shadow-md text-sm"
                >
                  📄 Export PDF
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Floating chat button (visible while scrolling) ── */}
      {!isGenerating && notes.length > 0 && !isOpen && (
        <button
          onClick={handleFloatingChat}
          className="no-print fixed bottom-6 right-6 w-14 h-14 bg-gray-900
                     hover:bg-gray-700 text-white rounded-full shadow-2xl
                     flex items-center justify-center text-2xl
                     transition-all hover:scale-110 active:scale-95 z-40"
        >
          💬
        </button>
      )}

      {/* ── Selection popup ── */}
      <SelectionPopup />

      {/* ── Chat sidebar ── */}
      <ChatSidebar />

    </div>
  );
}