/**
 * pages/InputPage.jsx
 * Sprint 2, Task 5
 * Where the user enters subject name and syllabus topics.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useNotesStore from "../store/notesStore";
import { streamNotes } from "../services/api";

export default function InputPage() {
  const navigate = useNavigate();
  const { subject, topicsRaw, setSubject, setTopicsRaw,
          startGeneration, setCurrentTopic, appendToken,
          commitTopic, finishGeneration } = useNotesStore();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setError("");

    // Validate
    if (!subject.trim()) { setError("Please enter a subject name."); return; }
    if (!topicsRaw.trim()) { setError("Please enter at least one topic."); return; }

    const topics = topicsRaw
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    if (topics.length === 0) { setError("No valid topics found."); return; }
    if (topics.length > 30)  { setError("Maximum 30 topics allowed."); return; }

    setLoading(true);
    startGeneration(topics.length);
    navigate("/notes");   // go to canvas immediately — notes build live there

    try {
      await streamNotes(subject, topics, (event) => {
        if (event.event === "topic_start") {
          setCurrentTopic(event.topic, event.index);
        } else if (event.event === "token") {
          appendToken(event.text);
        } else if (event.event === "topic_end") {
          commitTopic();
        } else if (event.event === "done") {
          finishGeneration();
        } else if (event.event === "error") {
          console.error("Topic error:", event.message);
        }
      });
    } catch (e) {
      setError(`Failed to connect to backend: ${e.message}`);
      finishGeneration();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50
                    flex flex-col items-center justify-center p-6">

      {/* Logo / Title */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
          Note<span className="text-brand-orange">Gen</span>AI
        </h1>
        <p className="text-gray-500 mt-2 text-base">
          Paste your syllabus. Watch your notes build in real time.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-8 border border-gray-100">

        {/* Subject input */}
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Subject Name
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Cyber Forensics Analysis"
          className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm
                     focus:outline-none focus:border-brand-orange mb-5 transition-colors"
        />

        {/* Topics textarea */}
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Syllabus Topics
          <span className="text-gray-400 font-normal ml-2">(one topic per line)</span>
        </label>
        <textarea
          value={topicsRaw}
          onChange={(e) => setTopicsRaw(e.target.value)}
          placeholder={"Cyber Space\nCyber Crime\nJurisdictional Concerns\nDigital Forensics\nEvidence Management"}
          rows={8}
          className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm
                     focus:outline-none focus:border-brand-orange resize-none
                     transition-colors font-mono"
        />

        {/* Topic count */}
        <p className="text-xs text-gray-400 mt-1 mb-5">
          {topicsRaw.split("\n").filter((t) => t.trim()).length} topics detected
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                          rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-brand-orange hover:bg-orange-700 disabled:bg-orange-300
                     text-white font-black text-base py-3 rounded-lg
                     transition-colors tracking-wide shadow-md"
        >
          {loading ? "Connecting..." : "⚡ Generate Notes"}
        </button>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Notes generate live — you'll watch each page being built in real time.
        </p>
      </div>
    </div>
  );
}