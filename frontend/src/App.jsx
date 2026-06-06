// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import InputPage from "./pages/InputPage";
import NotesPage from "./pages/NotesPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import useAuthStore from "./store/authStore";

export default function App() {
  const { init } = useAuthStore();

  // Initialize auth on app load
  useEffect(() => {
    init();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<InputPage />} />
        <Route path="/notes"     element={<NotesPage />} />
        <Route path="/auth"      element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}