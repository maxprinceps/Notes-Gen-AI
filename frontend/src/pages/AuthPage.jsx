// src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        navigate("/");
      } else {
        await signUp(email, password);
        setMessage("✅ Account created! Please check your email to confirm, then log in.");
        setMode("login");
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50
                    flex flex-col items-center justify-center p-6">

      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
          Note<span className="text-brand-orange">Gen</span>AI
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          AI-powered notes for B.Tech students
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-8
                      border border-gray-100">

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => { setMode("login"); setError(""); setMessage(""); }}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all
                        ${mode === "login"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"}`}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all
                        ${mode === "signup"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"}`}
          >
            Sign Up
          </button>
        </div>

        {/* Email */}
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKey}
          placeholder="you@example.com"
          className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5
                     text-sm focus:outline-none focus:border-brand-orange
                     mb-4 transition-colors"
        />

        {/* Password */}
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Minimum 6 characters"
          className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5
                     text-sm focus:outline-none focus:border-brand-orange
                     mb-5 transition-colors"
        />

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs
                          rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        {/* Success message */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700
                          text-xs rounded-lg px-3 py-2 mb-4">
            {message}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-brand-orange hover:bg-orange-700
                     disabled:bg-orange-300 text-white font-black
                     py-3 rounded-lg transition-colors text-base shadow-md"
        >
          {loading
            ? "Please wait..."
            : mode === "login" ? "Log In" : "Create Account"
          }
        </button>

        {/* Continue without account */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600
                     transition-colors py-2"
        >
          Continue without account →
        </button>
      </div>
    </div>
  );
}