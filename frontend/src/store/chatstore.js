/**
 * store/chatStore.js
 * Global state for the AI chat sidebar.
 * Chat history stored per topic.
 */

import { create } from "zustand";

const useChatStore = create((set, get) => ({
  isOpen: false,
  activeTopic: null,
  activeNote: null,
  selectedText: "",
  histories: {},   // { [topicName]: [{id, role, content}] }
  isTyping: false,

  openChat: (topic, note, selectedText = "") =>
    set({ isOpen: true, activeTopic: topic, activeNote: note, selectedText }),

  closeChat: () => set({ isOpen: false, selectedText: "" }),

  setActiveTopic: (topic, note) =>
    set({ activeTopic: topic, activeNote: note, selectedText: "" }),

  addMessage: (topicName, role, content) => {
    const msg = { id: Date.now() + Math.random(), role, content };
    set((s) => ({
      histories: {
        ...s.histories,
        [topicName]: [...(s.histories[topicName] || []), msg],
      },
    }));
  },

  updateLastMessage: (topicName, content) =>
    set((s) => {
      const h = [...(s.histories[topicName] || [])];
      if (!h.length) return s;
      h[h.length - 1] = { ...h[h.length - 1], content };
      return { histories: { ...s.histories, [topicName]: h } };
    }),

  setTyping: (val) => set({ isTyping: val }),

  clearHistory: (topicName) =>
    set((s) => ({ histories: { ...s.histories, [topicName]: [] } })),
}));

export default useChatStore;