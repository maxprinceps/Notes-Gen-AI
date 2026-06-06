// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yeylydivroihtilvpxvb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleWx5ZGl2cm9paHRpbHZweHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NTQ3NzMsImV4cCI6MjA5NjEzMDc3M30.s4pO18xMUUuwmm9imbAZ8gb7OkmaqYeCHlcxJoF2eyQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);