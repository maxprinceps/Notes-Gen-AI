"""
services/generator.py — Updated for Groq API
Free, no credit card needed. Uses Llama 3.3 70B model.
"""

import json
import re
import os
from groq import Groq


def get_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set in .env file")
    return Groq(api_key=api_key)


def clean_json(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"^```\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


def generate_topic_notes(subject: str, topic: str) -> dict:
    """Standard generation — returns parsed dict."""
    from services.prompt import build_notes_prompt
    client = get_client()

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=2000,
        temperature=0.3,   # lower = more consistent JSON output
        messages=[
            {
                "role": "system",
                "content": "You are an expert B.Tech professor. Always respond with valid raw JSON only. No markdown, no explanation, no code fences."
            },
            {
                "role": "user",
                "content": build_notes_prompt(subject, topic)
            }
        ]
    )

    raw = clean_json(response.choices[0].message.content)
    return json.loads(raw)


def stream_topic_notes(subject: str, topic: str):
    """
    Streams tokens from Groq one by one.
    Yields raw text chunks as they arrive.
    """
    from services.prompt import build_notes_prompt
    client = get_client()

    stream = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=2000,
        temperature=0.3,
        stream=True,
        messages=[
            {
                "role": "system",
                "content": "You are an expert B.Tech professor. Always respond with valid raw JSON only. No markdown, no explanation, no code fences."
            },
            {
                "role": "user",
                "content": build_notes_prompt(subject, topic)
            }
        ]
    )

    accumulated = ""
    for chunk in stream:
        text = chunk.choices[0].delta.content
        if text:
            accumulated += text
            yield text

    # Validate JSON at end of stream
    cleaned = clean_json(accumulated)
    try:
        json.loads(cleaned)
    except json.JSONDecodeError as e:
        yield f"\n[ERROR: Invalid JSON — {str(e)}]"


def regenerate_element(
    element_type: str,
    current_content: str,
    user_instruction: str,
    topic: str,
    subject: str
) -> str:
    """Regenerates a single element based on user instruction."""
    from services.prompt import build_regenerate_prompt
    client = get_client()

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=800,
        temperature=0.3,
        messages=[
            {
                "role": "system",
                "content": "You are an expert B.Tech professor. Respond with raw JSON only."
            },
            {
                "role": "user",
                "content": build_regenerate_prompt(
                    element_type, current_content,
                    user_instruction, topic, subject
                )
            }
        ]
    )

    return clean_json(response.choices[0].message.content)