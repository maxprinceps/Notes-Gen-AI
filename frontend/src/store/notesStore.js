/**
 * store/notesStore.js
 * Global state for the entire app using Zustand.
 * Holds subject, topics, all generated notes, and streaming state.
 */

import { create } from "zustand";

const useNotesStore = create((set, get) => ({
  // ── Input state ───────────────────────────────────────────────────────────
  subject: "",
  topicsRaw: "",   // raw textarea string

  setSubject: (subject) => set({ subject }),
  setTopicsRaw: (topicsRaw) => set({ topicsRaw }),

  // ── Generation state ──────────────────────────────────────────────────────
  isGenerating: false,
  currentTopicIndex: 0,
  totalTopics: 0,
  currentTopicName: "",

  // ── Notes data ────────────────────────────────────────────────────────────
  // Array of completed TopicNotes objects
  notes: [],

  // Buffer accumulating streaming tokens for the topic being built right now
  streamBuffer: "",

  // ── Actions ───────────────────────────────────────────────────────────────

  startGeneration: (totalTopics) =>
    set({
      isGenerating: true,
      notes: [],
      streamBuffer: "",
      currentTopicIndex: 0,
      totalTopics,
    }),

  setCurrentTopic: (name, index) =>
    set({ currentTopicName: name, currentTopicIndex: index, streamBuffer: "" }),

  appendToken: (text) =>
    set((state) => ({ streamBuffer: state.streamBuffer + text })),

  // Called when a topic's stream completes — parse JSON and add to notes
  commitTopic: () => {
    const { streamBuffer } = get();
    try {
      // Strip any accidental markdown fences
      let clean = streamBuffer.trim();
      clean = clean.replace(/^```json\s*/,"").replace(/\s*```$/,"");
      const parsed = JSON.parse(clean);
      set((state) => ({
        notes: [...state.notes, { ...parsed, _colors: {} }],
        streamBuffer: "",
      }));
    } catch (e) {
      console.error("Failed to parse topic JSON:", e);
      set({ streamBuffer: "" });
    }
  },

  finishGeneration: () => set({ isGenerating: false, streamBuffer: "" }),

  // ── Per-element editing ───────────────────────────────────────────────────

  // Update any field in a specific note by topic index
  updateNoteField: (noteIndex, field, value) =>
    set((state) => {
      const notes = [...state.notes];
      notes[noteIndex] = { ...notes[noteIndex], [field]: value };
      return { notes };
    }),

  // Update background color of a specific section in a note
  updateElementColor: (noteIndex, elementKey, color) =>
    set((state) => {
      const notes = [...state.notes];
      notes[noteIndex] = {
        ...notes[noteIndex],
        _colors: { ...notes[noteIndex]._colors, [elementKey]: color },
      };
      return { notes };
    }),

  // Reset everything — go back to input page
  reset: () =>
    set({
      notes: [],
      streamBuffer: "",
      isGenerating: false,
      currentTopicIndex: 0,
      totalTopics: 0,
      currentTopicName: "",
    }),
}));

export default useNotesStore;