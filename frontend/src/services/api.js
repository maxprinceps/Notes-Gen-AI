/**
 * services/api.js
 * All communication with the FastAPI backend.
 */

const BASE_URL = "http://localhost:8000/api";

/**
 * Standard (non-streaming) notes generation.
 * Used for testing. Frontend uses streamNotes() for real use.
 */
export async function generateNotes(subject, topics) {
  const res = await fetch(`${BASE_URL}/generate-notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, topics }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * SSE Streaming — main function used by the notes canvas.
 * Calls onEvent for every server-sent event received.
 *
 * Event types:
 *   { event: "topic_start", topic, index, total }
 *   { event: "token",       text }
 *   { event: "topic_end",   topic, index }
 *   { event: "error",       topic, message }
 *   { event: "done" }
 */
export async function streamNotes(subject, topics, onEvent) {
  const res = await fetch(`${BASE_URL}/generate-notes-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, topics }),
  });

  if (!res.ok) throw new Error(`Stream error: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          onEvent(data);
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}

/**
 * Regenerate a single element with AI.
 * Called when user right-clicks and types an instruction.
 */
export async function regenerateElement(
  elementType,
  currentContent,
  userInstruction,
  topic,
  subject
) {
  const res = await fetch(`${BASE_URL}/regenerate-element`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      element_type: elementType,
      current_content: currentContent,
      user_instruction: userInstruction,
      topic,
      subject,
    }),
  });
  if (!res.ok) throw new Error(`Regenerate error: ${res.status}`);
  return res.json();
}

/**
 * Streaming chat with AI — context-aware.
 * Calls onChunk for each token received.
 * Calls onDone when complete.
 */
export async function streamChat(
  { subject, topic, noteContext, selectedText, messages, userMessage },
  onChunk,
  onDone
) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject,
      topic,
      note_context: noteContext,
      selected_text: selectedText,
      messages,
      user_message: userMessage,
    }),
  });

  if (!res.ok) throw new Error(`Chat error: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.text) onChunk(data.text);
          if (data.done) onDone();
        } catch {}
      }
    }
  }
}