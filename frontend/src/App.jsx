import { BrowserRouter, Routes, Route } from "react-router-dom";
import InputPage from "./pages/InputPage";
import NotesPage from "./pages/NotesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<InputPage />} />
        <Route path="/notes" element={<NotesPage />} />
      </Routes>
    </BrowserRouter>
  );
}