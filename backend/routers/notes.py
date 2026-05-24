"""
routers/notes.py
Sprint 1, Task 7
All notes-related API endpoints.
"""

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from models.notes import SyllabusRequest, RegenerateRequest
from services.generator import (
    generate_topic_notes,
    stream_topic_notes,
    regenerate_element
)

router = APIRouter(prefix="/api", tags=["notes"])


@router.get("/health")
def health():
    return {"status": "NoteGenAI backend running"}


@router.post("/generate-notes")
def generate_notes(request: SyllabusRequest):
    """
    Standard endpoint — generates all topics and returns complete JSON.
    Use this for testing. Frontend will use the streaming endpoint.
    """
    if not request.topics:
        raise HTTPException(status_code=400, detail="Topics list is empty")
    if len(request.topics) > 30:
        raise HTTPException(status_code=400, detail="Max 30 topics per request")

    results = []
    for topic in request.topics:
        topic = topic.strip()
        if not topic:
            continue
        try:
            notes = generate_topic_notes(request.subject, topic)
            results.append(notes)
        except json.JSONDecodeError:
            print(f"[WARN] JSON parse failed for topic: {topic}")
            continue
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating topic '{topic}': {str(e)}"
            )

    return {"subject": request.subject, "notes": results}


@router.post("/generate-notes-stream")
async def generate_notes_stream(request: SyllabusRequest):
    """
    SSE Streaming endpoint — streams each topic as it generates.
    Frontend listens to this and renders notes live as tokens arrive.

    Stream format:
    - data: {"event": "topic_start", "topic": "Cyber Space", "index": 0}
    - data: {"event": "token", "text": "{"topic":"}           ← raw JSON tokens
    - data: {"event": "topic_end", "topic": "Cyber Space"}
    - data: {"event": "done"}
    """
    if not request.topics:
        raise HTTPException(status_code=400, detail="Topics list is empty")

    topics = [t.strip() for t in request.topics if t.strip()]

    def event_stream():
        for i, topic in enumerate(topics):
            # Signal topic start
            yield f"data: {json.dumps({'event': 'topic_start', 'topic': topic, 'index': i, 'total': len(topics)})}\n\n"

            try:
                # Stream raw tokens for this topic
                for chunk in stream_topic_notes(request.subject, topic):
                    payload = json.dumps({"event": "token", "text": chunk})
                    yield f"data: {payload}\n\n"

                # Signal topic complete
                yield f"data: {json.dumps({'event': 'topic_end', 'topic': topic, 'index': i})}\n\n"

            except Exception as e:
                yield f"data: {json.dumps({'event': 'error', 'topic': topic, 'message': str(e)})}\n\n"
                continue

        # Signal all done
        yield f"data: {json.dumps({'event': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )


@router.post("/regenerate-element")
def regenerate_element_endpoint(request: RegenerateRequest):
    """
    Regenerates a single element on the notes page.
    Called when user right-clicks and types an AI instruction.
    """
    try:
        new_content = regenerate_element(
            element_type=request.element_type,
            current_content=request.current_content,
            user_instruction=request.user_instruction,
            topic=request.topic,
            subject=request.subject
        )
        return {"element_type": request.element_type, "content": new_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Chat endpoint ─────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    subject: str
    topic: str
    note_context: dict
    selected_text: str
    messages: list[dict]
    user_message: str
    is_exam_question: bool = False   # triggers full exam-answer mode

@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    from groq import Groq
    import os
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    note = request.note_context

    # Build note context string
    note_context_str = f"""DEFINITION: {note.get('definition', '')}
KEY POINTS: {chr(10).join(f'- {p}' for p in note.get('key_points', []))}
HOW IT WORKS: {chr(10).join(f'{i+1}. {s}' for i, s in enumerate(note.get('how_it_works', [])))}
REAL EXAMPLE: {note.get('real_example', '')}
IMPORTANT TERMS: {', '.join(f"{t['term']}: {t['meaning']}" for t in note.get('important_terms', []))}"""

    # Different system prompt for exam answers vs general chat
    if request.is_exam_question:
        context = f"""You are an expert B.Tech professor for AKTU university exams.
Subject: {request.subject}
Topic: {request.topic}

Notes for this topic:
{note_context_str}

Your job: Write a COMPLETE, STRUCTURED exam answer.
Format your answer like a proper AKTU exam answer:
- Start with a clear definition (1-2 lines)
- Write the main explanation with numbered points
- Include a relevant example
- End with a concluding line
- For 2-mark questions: write 4-6 lines
- For 7-mark questions: write detailed paragraphs with all key aspects covered
DO NOT give tips or advice on what to write. WRITE THE ACTUAL ANSWER DIRECTLY."""
    else:
        context = f"""You are a helpful B.Tech professor assistant.
The student is reading notes on: {request.topic}
Subject: {request.subject}

Notes for context:
{note_context_str}

{"Student selected this text: " + request.selected_text if request.selected_text else ""}

Your job:
- Answer in simple conversational language
- Use Indian examples (UPI, Aadhaar, IPL, local market) where relevant
- Be concise — 3-5 sentences for simple questions, more for complex ones
- Add value beyond what the notes already say
- Stay focused on this topic"""

    messages = [{"role": "system", "content": context}]
    # Include last 10 messages for context but skip empty ones
    for msg in request.messages[-10:]:
        if msg.get("content", "").strip():
            messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": request.user_message})

    max_tokens = 1200 if request.is_exam_question else 600

    def stream_response():
        with client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=max_tokens,
            temperature=0.3,
            messages=messages,
            stream=True,
        ) as stream:
            for chunk in stream:
                text = chunk.choices[0].delta.content
                if text:
                    yield f"data: {json.dumps({'text': text})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )