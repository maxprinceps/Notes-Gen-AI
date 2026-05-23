/**
 * components/ui/ChatSidebar.jsx
 * Context-aware AI chat sidebar.
 * Slides in from the right. Knows the full topic content.
 * Streams responses token by token.
 */

import { useState, useRef, useEffect } from "react";
import useChatStore from "../../store/chatStore";
import useNotesStore from "../../store/notesStore";
import { streamChat } from "../../services/api";

export default function ChatSidebar() {
  const {
    isOpen, closeChat, activeTopic, activeNote,
    selectedText, histories, addMessage,
    updateLastMessage, setTyping, isTyping,
    clearHistory, setActiveTopic,
  } = useChatStore();

  const { notes, subject } = useNotesStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const messages = activeTopic ? (histories[activeTopic] || []) : [];

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      // Auto-send selected text as first message
      if (selectedText && messages.length === 0) {
        handleSend(`Explain this to me in simple terms: "${selectedText}"`);
      }
    }
  }, [isOpen, activeTopic]);

  const handleSend = async (overrideMessage = null) => {
    const userMessage = overrideMessage || input.trim();
    if (!userMessage || isTyping || !activeTopic) return;
    setInput("");

    // Add user message
    addMessage(activeTopic, "user", userMessage);
    setTyping(true);

    // Add empty assistant message to stream into
    addMessage(activeTopic, "assistant", "");

    try {
      let accumulated = "";
      await streamChat(
        {
          subject,
          topic: activeTopic,
          noteContext: activeNote || {},
          selectedText,
          messages: histories[activeTopic] || [],
          userMessage,
        },
        (chunk) => {
          accumulated += chunk;
          updateLastMessage(activeTopic, accumulated);
        },
        () => setTyping(false)
      );
    } catch (e) {
      updateLastMessage(activeTopic, "Sorry, something went wrong. Please try again.");
      setTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick question chips
  const quickQuestions = [
    "Explain this simply",
    "Give me an Indian example",
    "What will be asked in exam?",
    "How is this different from...",
    "Why is this important?",
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40 no-print"
          onClick={closeChat}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50
                    flex flex-col transition-transform duration-300 ease-in-out
                    no-print
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* ── Header ── */}
        <div className="bg-brand-orange px-4 py-3 flex items-center justify-between
                        flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <h2 className="font-black text-white text-sm">AI Study Assistant</h2>
              <p className="text-orange-100 text-xs truncate max-w-[200px]">
                {activeTopic || "Select a topic"}
              </p>
            </div>
          </div>
          <button
            onClick={closeChat}
            className="text-white hover:text-orange-200 text-xl font-bold
                       transition-colors"
          >
            ×
          </button>
        </div>

        {/* ── Topic switcher ── */}
        {notes.length > 1 && (
          <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
            <select
              value={activeTopic || ""}
              onChange={(e) => {
                const note = notes.find((n) => n.topic === e.target.value);
                setActiveTopic(e.target.value, note);
              }}
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5
                         focus:outline-none focus:border-brand-orange bg-gray-50"
            >
              {notes.map((n) => (
                <option key={n.topic} value={n.topic}>
                  {n.topic}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── Selected text banner ── */}
        {selectedText && (
          <div className="mx-3 mt-2 flex-shrink-0 bg-orange-50 border border-orange-200
                          rounded-lg px-3 py-2">
            <p className="text-xs text-orange-600 font-bold mb-0.5">
              📌 Asking about selected text:
            </p>
            <p className="text-xs text-gray-700 italic line-clamp-2">
              "{selectedText}"
            </p>
          </div>
        )}

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm font-bold text-gray-700 mb-1">
                Ask me anything about
              </p>
              <p className="text-sm text-brand-orange font-black">
                {activeTopic}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                I already know your notes — ask me to simplify,
                give examples, or explain connections.
              </p>

              {/* Quick question chips */}
              <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-orange-50 hover:bg-orange-100
                               text-orange-700 px-2.5 py-1 rounded-full
                               border border-orange-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* AI avatar */}
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center
                                justify-center text-white text-xs font-black
                                flex-shrink-0 mt-1 mr-2">
                  AI
                </div>
              )}

              <div
                className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed
                  ${msg.role === "user"
                    ? "bg-brand-orange text-white rounded-tr-none"
                    : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}
              >
                {msg.content || (
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }} />
                  </span>
                )}
              </div>

              {/* User avatar */}
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center
                                justify-center text-white text-xs font-black
                                flex-shrink-0 mt-1 ml-2">
                  U
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Clear history button ── */}
        {messages.length > 0 && (
          <div className="px-3 flex-shrink-0">
            <button
              onClick={() => clearHistory(activeTopic)}
              className="text-xs text-gray-400 hover:text-gray-600
                         transition-colors w-full text-center py-1"
            >
              Clear conversation
            </button>
          </div>
        )}

        {/* ── Input box ── */}
        <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about this topic..."
              rows={2}
              disabled={isTyping}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm
                         focus:outline-none focus:border-brand-orange resize-none
                         transition-colors disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 bg-brand-orange hover:bg-orange-700
                         disabled:bg-orange-200 text-white rounded-xl
                         flex items-center justify-center transition-colors
                         flex-shrink-0"
            >
              {isTyping ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent
                                rounded-full animate-spin" />
              ) : (
                <span className="text-lg">↑</span>
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 text-center">
            Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}