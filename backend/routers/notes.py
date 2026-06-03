"""
routers/notes.py
All API endpoints for NoteGenAI
"""

import json
import re
import io
import os
import base64

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq
import pdfplumber
import fitz  # PyMuPDF

from models.notes import SyllabusRequest, RegenerateRequest
from services.generator import (
    generate_topic_notes,
    stream_topic_notes,
    regenerate_element,
)

router = APIRouter(prefix="/api", tags=["notes"])


# ── Health ────────────────────────────────────────────────────────────────────

@router.get("/health")
def health():
    return {"status": "NoteGenAI backend running"}


# ── Notes Generation ──────────────────────────────────────────────────────────

@router.post("/generate-notes")
def generate_notes(request: SyllabusRequest):
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
            raise HTTPException(status_code=500, detail=f"Error on '{topic}': {str(e)}")

    return {"subject": request.subject, "notes": results}


@router.post("/generate-notes-stream")
async def generate_notes_stream(request: SyllabusRequest):
    """
    SSE Streaming endpoint.
    Events: topic_start | token | topic_end | error | done
    """
    if not request.topics:
        raise HTTPException(status_code=400, detail="Topics list is empty")

    topics = [t.strip() for t in request.topics if t.strip()]

    def event_stream():
        for i, topic in enumerate(topics):
            yield f"data: {json.dumps({'event': 'topic_start', 'topic': topic, 'index': i, 'total': len(topics)})}\n\n"
            try:
                for chunk in stream_topic_notes(request.subject, topic):
                    yield f"data: {json.dumps({'event': 'token', 'text': chunk})}\n\n"
                yield f"data: {json.dumps({'event': 'topic_end', 'topic': topic, 'index': i})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'event': 'error', 'topic': topic, 'message': str(e)})}\n\n"
                continue
        yield f"data: {json.dumps({'event': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# ── Regenerate Element ────────────────────────────────────────────────────────

@router.post("/regenerate-element")
def regenerate_element_endpoint(request: RegenerateRequest):
    try:
        new_content = regenerate_element(
            element_type=request.element_type,
            current_content=request.current_content,
            user_instruction=request.user_instruction,
            topic=request.topic,
            subject=request.subject,
        )
        return {"element_type": request.element_type, "content": new_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    subject: str
    topic: str
    note_context: dict
    selected_text: str
    messages: list[dict]
    user_message: str
    is_exam_question: bool = False


@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    note = request.note_context

    note_context_str = f"""DEFINITION: {note.get('definition', '')}
KEY POINTS: {chr(10).join(f'- {p}' for p in note.get('key_points', []))}
HOW IT WORKS: {chr(10).join(f'{i+1}. {s}' for i, s in enumerate(note.get('how_it_works', [])))}
REAL EXAMPLE: {note.get('real_example', '')}
IMPORTANT TERMS: {', '.join(f"{t['term']}: {t['meaning']}" for t in note.get('important_terms', []))}"""

    if request.is_exam_question:
        context = f"""You are an expert B.Tech professor for AKTU university exams.
Subject: {request.subject}
Topic: {request.topic}

Notes for this topic:
{note_context_str}

Your job: Write a COMPLETE, STRUCTURED exam answer.
Format:
- Start with a clear definition (1-2 lines)
- Main explanation with numbered points
- Include a relevant example
- Concluding line
- For 2-mark: 4-6 lines. For 7-mark: detailed paragraphs covering all aspects.
DO NOT give tips. WRITE THE ACTUAL ANSWER DIRECTLY."""
    else:
        context = f"""You are a helpful B.Tech professor assistant.
Student is reading notes on: {request.topic}
Subject: {request.subject}

Notes for context:
{note_context_str}

{"Student selected this text: " + request.selected_text if request.selected_text else ""}

Rules:
- Simple conversational language
- Indian examples (UPI, Aadhaar, IPL) where relevant
- 3-5 sentences for simple questions, more for complex ones
- Add value beyond what notes already say"""

    messages = [{"role": "system", "content": context}]
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


# ── PDF Upload + Topic Extraction ─────────────────────────────────────────────

def extract_text_method1_pdfplumber(contents: bytes) -> str:
    """Method 1: pdfplumber — best for digital PDFs"""
    try:
        text = ""
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text += t + "\n"
        return text.strip()
    except Exception:
        return ""


def extract_text_method2_pymupdf(contents: bytes) -> str:
    """Method 2: PyMuPDF — handles more PDF types"""
    try:
        text = ""
        doc = fitz.open(stream=contents, filetype="pdf")
        for page in doc:
            t = page.get_text()
            if t:
                text += t + "\n"
        doc.close()
        return text.strip()
    except Exception:
        return ""


def extract_text_method3_vision_ocr(contents: bytes) -> str:
    """
    Method 3: Vision AI OCR — for scanned/image PDFs.
    Converts PDF pages to images → sends to Groq vision model → extracts text.
    Works on ANY PDF regardless of how it was created.
    """
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        doc = fitz.open(stream=contents, filetype="pdf")
        all_text = []

        # Process max 5 pages to stay within API limits
        max_pages = min(len(doc), 5)

        for page_num in range(max_pages):
            page = doc[page_num]

            # Render page to image at 150 DPI
            mat = fitz.Matrix(150 / 72, 150 / 72)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("png")
            img_b64 = base64.b64encode(img_bytes).decode("utf-8")

            # Send to Groq vision model
            response = client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                max_tokens=2000,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{img_b64}"
                                },
                            },
                            {
                                "type": "text",
                                "text": "This is a page from a B.Tech university syllabus. Extract ALL the text visible on this page. Return only the raw text exactly as you see it, nothing else.",
                            },
                        ],
                    }
                ],
            )

            page_text = response.choices[0].message.content
            if page_text and page_text.strip():
                all_text.append(f"--- Page {page_num + 1} ---\n{page_text.strip()}")

        doc.close()
        return "\n\n".join(all_text)

    except Exception as e:
        print(f"[Vision OCR error]: {e}")
        return ""


@router.post("/extract-topics")
async def extract_topics_from_pdf(
    file: UploadFile = File(...),
    subject: str = Form(default=""),
):
    """
    Accepts a PDF syllabus upload.
    Tries 3 extraction methods automatically:
      1. pdfplumber (fast, digital PDFs)
      2. PyMuPDF (good fallback)
      3. Vision AI OCR (scanned/image PDFs — always works)
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    # Try methods in order
    pdf_text = extract_text_method1_pdfplumber(contents)
    used_ocr = False

    if not pdf_text:
        pdf_text = extract_text_method2_pymupdf(contents)

    if not pdf_text:
        # Last resort — vision AI OCR
        pdf_text = extract_text_method3_vision_ocr(contents)
        used_ocr = True

    if not pdf_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not read this PDF. Please make sure the file is not corrupted and contains readable content."
        )

    # Limit to avoid token overflow
    pdf_text = pdf_text[:6000]

    # Extract topics using AI
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    prompt = f"""You are analyzing a B.Tech university syllabus.
{"Subject: " + subject if subject else ""}

Extract ALL topic names students need to study from this syllabus text.

Rules:
- Return ONLY a JSON array of strings
- Each topic: 1-6 words
- Remove unit numbers, serial numbers
- Remove: "Practical", "Lab", "Assignment", "Project", "Experiment"
- Include topics from ALL units
- Maximum 30 topics

Syllabus text:
{pdf_text}

Return ONLY this format:
["Topic 1", "Topic 2", "Topic 3", ...]"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=1000,
        temperature=0.1,
        messages=[
            {
                "role": "system",
                "content": "You extract topic lists from syllabus documents. Return only valid JSON arrays. No explanation.",
            },
            {"role": "user", "content": prompt},
        ],
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"^```\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        topics = json.loads(raw)
        if not isinstance(topics, list):
            raise ValueError("Not a list")
        topics = [str(t).strip() for t in topics if str(t).strip()]
        topics = topics[:30]
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="AI could not parse topics from your syllabus. Please try again.",
        )

    return {
        "topics": topics,
        "count": len(topics),
        "used_ocr": used_ocr,
        "extracted_text_length": len(pdf_text),
    }