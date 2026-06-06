// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import useAuthStore from "../store/authStore";
import useNotesStore from "../store/notesStore";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { setSubject, setTopicsRaw } = useNotesStore();

  const [savedNotes, setSavedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("id, subject, topics, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (!error) setSavedNotes(data || []);
    setLoading(false);
  };

  const handleOpen = async (noteId) => {
    // Fetch full notes data
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .single();

    if (error || !data) return;

    // Load into store
    const store = useNotesStore.getState();
    store.setSubject(data.subject);
    store.setTopicsRaw(data.topics.join("\n"));

    // Directly load notes into the notes array
    useNotesStore.setState({
      notes: data.notes_data,
      isGenerating: false,
    });

    navigate("/notes");
  };

  const handleDelete = async (noteId) => {
    if (!confirm("Delete these notes?")) return;
    setDeleting(noteId);
    await supabase.from("notes").delete().eq("id", noteId);
    setSavedNotes((prev) => prev.filter((n) => n.id !== noteId));
    setDeleting(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4
                      flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1
            onClick={() => navigate("/")}
            className="font-black text-xl text-gray-900 cursor-pointer"
          >
            Note<span className="text-brand-orange">Gen</span>AI
          </h1>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-bold text-gray-600">My Notes</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 hidden sm:block">
            {user?.email}
          </span>
          <button
            onClick={() => navigate("/")}
            className="bg-brand-orange hover:bg-orange-700 text-white
                       font-bold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            + New Notes
          </button>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-700
                       transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        <h2 className="text-2xl font-black text-gray-900 mb-6">
          Your Saved Notes
        </h2>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-orange
                            border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && savedNotes.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-xl font-bold text-gray-700 mb-2">
              No saved notes yet
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Generate notes and click "Save Notes" to save them here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-brand-orange hover:bg-orange-700 text-white
                         font-bold px-6 py-3 rounded-lg transition-colors"
            >
              Generate Notes
            </button>
          </div>
        )}

        {/* Notes grid */}
        {!loading && savedNotes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl border border-gray-200
                           shadow-sm hover:shadow-md transition-shadow p-5
                           flex flex-col"
              >
                {/* Subject */}
                <div className="flex-1">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg
                                  flex items-center justify-center mb-3">
                    <span className="text-xl">📖</span>
                  </div>
                  <h3 className="font-black text-gray-900 text-base mb-1 leading-tight">
                    {note.subject}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    {note.topics?.length || 0} topics •{" "}
                    {formatDate(note.updated_at)}
                  </p>

                  {/* Topic preview */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(note.topics || []).slice(0, 3).map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-orange-50 text-orange-700
                                   px-2 py-0.5 rounded-full border border-orange-200
                                   font-medium"
                      >
                        {t}
                      </span>
                    ))}
                    {(note.topics || []).length > 3 && (
                      <span className="text-[10px] text-gray-400">
                        +{note.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpen(note.id)}
                    className="flex-1 bg-brand-orange hover:bg-orange-700
                               text-white font-bold text-sm py-2 rounded-lg
                               transition-colors"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deleting === note.id}
                    className="px-3 py-2 text-red-400 hover:text-red-600
                               hover:bg-red-50 rounded-lg transition-colors
                               text-sm"
                  >
                    {deleting === note.id ? "..." : "🗑"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}