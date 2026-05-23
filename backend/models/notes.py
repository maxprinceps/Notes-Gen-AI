from pydantic import BaseModel
from typing import Literal

class DiagramNode(BaseModel):
    id: str
    label: str
    children: list[str] = []

class TopicNotes(BaseModel):
    topic: str
    definition: str
    simple_explanation: str
    key_points: list[str]
    real_example: str
    how_it_works: list[str]
    important_terms: list[dict]
    diagram_type: Literal["hierarchy", "process", "comparison", "none"]
    diagram_title: str
    diagram_data: list[dict]
    image_keywords: list[str]
    exam_questions_short: list[str]
    exam_questions_long: list[str]

class SyllabusRequest(BaseModel):
    subject: str
    topics: list[str]

class RegenerateRequest(BaseModel):
    element_type: str       # "definition", "key_points", "example", "diagram", etc.
    current_content: str    # what's currently there
    user_instruction: str   # what the user wants
    topic: str
    subject: str