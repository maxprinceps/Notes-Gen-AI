import { create } from "zustand";

const useChatStore = create((set, get) => ({
  isOpen: false,
  activeTopic: null,
  activeNote: null,
  selectedText: "",
  pendingMessage: null,  // force-sends on open, regardless of history
  histories: {},
  isTyping: false,

  // Open with selected text (selection popup)
  openChat: (topic, note, selectedText = "") =>
    set({ isOpen: true, activeTopic: topic, activeNote: note,
          selectedText, pendingMessage: null }),

  // Open and immediately send a specific message (exam questions + selection popup)
  openChatWithMessage: (topic, note, message) =>
    set({ isOpen: true, activeTopic: topic, activeNote: note,
          selectedText: "", pendingMessage: { text: message, id: Date.now() } }),

  clearPendingMessage: () => set({ pendingMessage: null }),

  closeChat: () => set({ isOpen: false, selectedText: "", pendingMessage: null }),

  setActiveTopic: (topic, note) =>
    set({ activeTopic: topic, activeNote: note, selectedText: "", pendingMessage: null }),

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