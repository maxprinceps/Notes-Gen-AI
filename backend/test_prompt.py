"""
test_prompt.py — Sprint 1, Tasks 6 and 8
Run this after adding your GROQ_API_KEY to .env

Usage:
    python test_prompt.py
"""

import sys
import os
import json
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, ".")

from services.generator import generate_topic_notes, stream_topic_notes

# ── Test 1: Standard generation ───────────────────────────────────────────────
print("=" * 60)
print("TEST 1: Standard JSON generation")
print("=" * 60)

try:
    result = generate_topic_notes(
        subject="Cyber Forensics Analysis",
        topic="Cyber Crime"
    )
    print(f"✅ Topic:          {result.get('topic')}")
    print(f"✅ Definition:     {result.get('definition', '')[:80]}...")
    print(f"✅ Key points:     {len(result.get('key_points', []))} points")
    print(f"✅ Diagram type:   {result.get('diagram_type')}")
    print(f"✅ Diagram nodes:  {len(result.get('diagram_data', []))} nodes")
    print(f"✅ Terms:          {len(result.get('important_terms', []))} terms")
    print(f"✅ Short Qs:       {len(result.get('exam_questions_short', []))} questions")
    print(f"✅ Long Qs:        {len(result.get('exam_questions_long', []))} questions")
    print()
    print("Full diagram_data:")
    for node in result.get("diagram_data", []):
        print(f"  {node['id']}: {node['label']} → {node.get('children', [])}")

except Exception as e:
    print(f"❌ FAILED: {e}")
    sys.exit(1)

# ── Test 2: Streaming ─────────────────────────────────────────────────────────
print()
print("=" * 60)
print("TEST 2: Streaming (watch tokens arrive live)")
print("=" * 60)

try:
    print("Streaming topic: 'Types of Network Attacks'")
    print("(you should see JSON characters appearing one by one...)")
    print()

    accumulated = ""
    for chunk in stream_topic_notes(
        subject="Cyber Forensics Analysis",
        topic="Types of Network Attacks"
    ):
        print(chunk, end="", flush=True)
        accumulated += chunk

    print()
    print()

    # Validate it's valid JSON
    import re
    cleaned = accumulated.strip()
    cleaned = re.sub(r"^```json\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    parsed = json.loads(cleaned)
    print(f"✅ Streaming works — received valid JSON")
    print(f"✅ Diagram type detected: {parsed.get('diagram_type')}")

except Exception as e:
    print(f"\n❌ Streaming FAILED: {e}")
    sys.exit(1)

print()
print("=" * 60)
print("ALL TESTS PASSED — Sprint 1 backend is ready")
print("Next step: Sprint 2 — React frontend")
print("=" * 60)