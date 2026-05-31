/**
 * pages/InputPage.jsx — with PDF upload feature
 */

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useNotesStore from "../store/notesStore";
import { streamNotes, extractTopicsFromPdf } from "../services/api";

export default function InputPage() {
  const navigate = useNavigate();
  const {
    subject, topicsRaw, setSubject, setTopicsRaw,
    startGeneration, setCurrentTopic, appendToken,
    commitTopic, finishGeneration,
  } = useNotesStore();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // ── PDF Upload Handler ───────────────────────────────────────────────────

  const handlePdfUpload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }

    setError("");
    setPdfSuccess("");
    setPdfLoading(true);

    try {
      const result = await extractTopicsFromPdf(file, subject);
      setTopicsRaw(result.topics.join("\n"));
      setPdfSuccess(`✅ Extracted ${result.count} topics from your syllabus PDF`);
    } catch (e) {
      setError(e.message || "Could not extract topics from PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handlePdfUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfUpload(file);
  };

  // ── Notes Generation ─────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setError("");

    if (!subject.trim()) { setError("Please enter a subject name."); return; }
    if (!topicsRaw.trim()) { setError("Please enter or upload topics."); return; }

    const topics = topicsRaw
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    if (topics.length === 0) { setError("No valid topics found."); return; }
    if (topics.length > 30)  { setError("Maximum 30 topics allowed."); return; }

    setLoading(true);
    startGeneration(topics.length);
    navigate("/notes");

    try {
      await streamNotes(subject, topics, (event) => {
        if (event.event === "topic_start") setCurrentTopic(event.topic, event.index);
        else if (event.event === "token")  appendToken(event.text);
        else if (event.event === "topic_end") commitTopic();
        else if (event.event === "done")   finishGeneration();
      });
    } catch (e) {
      setError(`Failed to connect to backend: ${e.message}`);
      finishGeneration();
    } finally {
      setLoading(false);
    }
  };

  const topicCount = topicsRaw.split("\n").filter((t) => t.trim()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50
                    flex flex-col items-center justify-center p-6">

      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
          Note<span className="text-brand-orange">Gen</span>AI
        </h1>
        <p className="text-gray-500 mt-2 text-base">
          Paste your syllabus or upload a PDF. Watch your notes build in real time.
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

        {/* PDF Upload Zone */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-gray-700">
              Upload Syllabus PDF
            </label>
            <span className="text-xs text-gray-400">optional</span>
          </div>

          {/* Drag & Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer
                        transition-all duration-200
                        ${dragOver
                          ? "border-brand-orange bg-orange-50"
                          : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                        }`}
          >
            {pdfLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent
                                rounded-full animate-spin" />
                <p className="text-sm text-brand-orange font-bold">
                  Extracting topics from PDF...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl">📄</span>
                <p className="text-sm font-bold text-gray-700">
                  Drop your syllabus PDF here
                </p>
                <p className="text-xs text-gray-400">
                  or click to browse — max 10MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Success message */}
          {pdfSuccess && (
            <div className="mt-2 bg-green-50 border border-green-200 text-green-700
                            text-xs rounded-lg px-3 py-2 font-medium">
              {pdfSuccess}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or type manually</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

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
          {topicCount} topic{topicCount !== 1 ? "s" : ""} detected
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
          disabled={loading || pdfLoading}
          className="w-full bg-brand-orange hover:bg-orange-700
                     disabled:bg-orange-300 text-white font-black text-base
                     py-3 rounded-lg transition-colors tracking-wide shadow-md"
        >
          {loading ? "Connecting..." : "⚡ Generate Notes"}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Notes generate live — you'll watch each page being built in real time.
        </p>
      </div>
    </div>
  );
}