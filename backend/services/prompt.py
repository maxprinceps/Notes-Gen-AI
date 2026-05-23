"""
services/prompt.py
Sprint 1, Tasks 3 + 4 + 5
Core prompt that generates structured JSON notes with smart diagram detection.
"""

def build_notes_prompt(subject: str, topic: str) -> str:
    return f"""You are an expert B.Tech professor with 10 years of teaching experience at AKTU university.
Generate comprehensive, exam-ready notes for a B.Tech student.

Subject: {subject}
Topic: {topic}

Return ONLY raw valid JSON. No markdown. No explanation. No code fences. Just JSON.

━━━ DIAGRAM RULES ━━━
Analyze the topic carefully and pick ONE diagram_type:

"hierarchy"  → topic has types / classification / categories
              Example: "Types of Cyber Crime", "Classification of Networks"

"process"    → topic describes steps / workflow / how something works
              Example: "Disk Imaging Process", "How Digital Signature Works"

"comparison" → topic compares exactly two things
              Example: "DoS vs DDoS", "Virus vs Worm"

"none"       → topic is a definition or concept with no clear structure

━━━ DIAGRAM DATA FORMAT ━━━
Each node: {{"id": "A", "label": "max 4 words", "children": ["B", "C"]}}
Root is always id "A". Keep labels SHORT — max 4 words.
Max 10 nodes total. Don't make it complex.

hierarchy example for "Types of Cyber Crime":
[
  {{"id":"A","label":"Cyber Crime","children":["B","C","D","E"]}},
  {{"id":"B","label":"Against Individuals","children":["F","G"]}},
  {{"id":"C","label":"Against Property","children":[]}},
  {{"id":"D","label":"Against Government","children":[]}},
  {{"id":"E","label":"Against Society","children":[]}},
  {{"id":"F","label":"Cyber Stalking","children":[]}},
  {{"id":"G","label":"Identity Theft","children":[]}}
]

process example for "Disk Imaging":
[
  {{"id":"A","label":"Seize Device","children":["B"]}},
  {{"id":"B","label":"Attach Write Blocker","children":["C"]}},
  {{"id":"C","label":"Run FTK Imager","children":["D"]}},
  {{"id":"D","label":"Generate Hash","children":["E"]}},
  {{"id":"E","label":"Store Evidence","children":[]}}
]

━━━ IMAGE KEYWORDS ━━━
Add 2-3 search keywords for Unsplash image search.
Only if the topic benefits from an image (hardware, devices, real objects).
If no image needed, return [].
Examples: ["hard disk drive internal"], ["network router switch"], ["ATM machine"]

━━━ NOW GENERATE ━━━
Return this exact JSON structure:

{{
  "topic": "{topic}",
  "definition": "Precise 2-3 line definition. Use exact technical language suitable for a 7-mark exam answer.",
  "simple_explanation": "Explain like the student is hearing this for the first time. Use a relatable Indian analogy — UPI, Aadhaar, IPL, local market, etc. 3-4 sentences.",
  "key_points": [
    "Point 1 — specific, exam-worthy fact",
    "Point 2",
    "Point 3",
    "Point 4",
    "Point 5"
  ],
  "real_example": "One concrete real-world example from India. Specific — name a company, app, or news event if relevant.",
  "how_it_works": [
    "Step 1: specific action",
    "Step 2: specific action",
    "Step 3: specific action",
    "Step 4: specific action"
  ],
  "important_terms": [
    {{"term": "Term Name", "meaning": "One precise line definition"}},
    {{"term": "Term Name", "meaning": "One precise line definition"}},
    {{"term": "Term Name", "meaning": "One precise line definition"}},
    {{"term": "Term Name", "meaning": "One precise line definition"}}
  ],
  "diagram_type": "hierarchy or process or comparison or none",
  "diagram_title": "Short descriptive title e.g. Classification of Cyber Crime",
  "diagram_data": [],
  "image_keywords": [],
  "exam_questions_short": [
    "Define {topic}. (2 marks)",
    "List any two characteristics of {topic}. (2 marks)",
    "What is the importance of {topic}? (2 marks)"
  ],
  "exam_questions_long": [
    "Explain {topic} in detail with suitable examples. (7 marks)",
    "Discuss the types and classifications of {topic} with diagrams. (7 marks)"
  ]
}}"""


def build_regenerate_prompt(
    element_type: str,
    current_content: str,
    user_instruction: str,
    topic: str,
    subject: str
) -> str:
    """
    Builds a prompt for regenerating a single element.
    Used when user right-clicks and asks AI to rewrite something.
    """
    return f"""You are an expert B.Tech professor.

Subject: {subject}
Topic: {topic}
Element to regenerate: {element_type}

Current content:
{current_content}

User instruction: {user_instruction}

Rewrite ONLY the {element_type} based on the instruction.
Return ONLY the new content as raw JSON in the same format as the original.
No explanation. No extra keys. Just the value.

For example:
- If element_type is "definition" → return a plain string
- If element_type is "key_points" → return a JSON array of strings
- If element_type is "diagram_data" → return a JSON array of diagram nodes
- If element_type is "important_terms" → return a JSON array of {{term, meaning}} objects"""