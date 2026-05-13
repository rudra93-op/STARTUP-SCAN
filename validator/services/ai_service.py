# validator/services/ai_service.py
import json
import os
from groq import Groq
from django.conf import settings

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are a world-class startup analyst and venture capital researcher.
Analyze startup ideas and return ONLY a valid JSON object. No markdown, no backticks, no extra text.

JSON Structure:
{
  "score": <integer 0-100>,
  "risk": <integer 0-100>,
  "difficulty": <integer 0-100>,
  "confidence": <integer 0-100>,
  "timeline": "<e.g. 3-4 months>",
  "summary": "<3 sentence executive summary>",
  "key_recommendations": ["<rec>", "<rec>", "<rec>"],
  "green_lights": ["<positive>", "<positive>", "<positive>", "<positive>"],
  "red_flags": ["<risk>", "<risk>", "<risk>", "<risk>"],
  "problem_validation": {"score": <0-100>, "description": "<2 sentences>"},
  "solution_validation": {"score": <0-100>, "description": "<2 sentences>"},
  "market_validation": {"score": <0-100>, "description": "<2 sentences>"},
  "key_strengths": ["<s>", "<s>", "<s>", "<s>"],
  "areas_of_concern": ["<c>", "<c>", "<c>", "<c>"],
  "market_factors": {
    "target_market_clarity": <0-100>,
    "market_timing": <0-100>,
    "market_entry_barriers": <0-100>,
    "competition_level": <0-100>,
    "problem_solution_fit": <0-100>
  },
  "execution_factors": {
    "mvp_viability": <0-100>,
    "value_proposition": <0-100>,
    "initial_feasibility": <0-100>,
    "resource_requirements": <0-100>
  },
  "tam": {"value": "<e.g. $42B>", "description": "<2 sentences>"},
  "sam": {"value": "<e.g. $8B>", "description": "<2 sentences>"},
  "som": {"value": "<e.g. $400M>", "description": "<2 sentences>"},
  "market_maturity": "<Growing|Emerging|Mature|Declining>",
  "seasonality": "<describe>",
  "target_regions": ["<region>", "<region>", "<region>"],
  "market_potential_points": ["<point>", "<point>", "<point>"],
  "competitors": [
    {"name": "<n>", "strengths": "<strengths>", "weaknesses": "<weaknesses>"},
    {"name": "<n>", "strengths": "<strengths>", "weaknesses": "<weaknesses>"},
    {"name": "<n>", "strengths": "<strengths>", "weaknesses": "<weaknesses>"}
  ],
  "revenue_model": "<describe>",
  "pricing_strategy": "<describe>",
  "year1_revenue": "<range>",
  "year2_revenue": "<range>",
  "year3_revenue": "<range>",
  "burn_rate": "<monthly estimate>",
  "break_even": "<timeline>",
  "funding_needed": "<estimate>",
  "customer_segments": [
    {"name": "<n>", "description": "<1 sentence>", "percentage": <integer>},
    {"name": "<n>", "description": "<1 sentence>", "percentage": <integer>},
    {"name": "<n>", "description": "<1 sentence>", "percentage": <integer>}
  ],
  "pain_points": ["<pain>", "<pain>", "<pain>"],
  "roadmap": [
    {"phase": "Phase 1", "title": "<title>", "duration": "<duration>", "goals": ["<g>", "<g>", "<g>"]},
    {"phase": "Phase 2", "title": "<title>", "duration": "<duration>", "goals": ["<g>", "<g>", "<g>"]},
    {"phase": "Phase 3", "title": "<title>", "duration": "<duration>", "goals": ["<g>", "<g>", "<g>"]}
  ],
  "verdict": "<Go|Caution|No-Go>",
  "verdict_reason": "<one compelling sentence>"
}"""


def analyze_idea(idea: str, news_context: str = "") -> dict:
    """
    Groq API se startup idea analyze
    Model: llama-3.3-70b-versatile
    """
    user_message = f"Startup Idea: {idea}"
    if news_context:
        user_message += f"\n\nRecent Market News Context:\n{news_context}"

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",   # FREE model
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=3000,
        )

        raw = completion.choices[0].message.content.strip()
        # Clean in case model adds backticks
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)

    except json.JSONDecodeError:
        raise ValueError("AI ne invalid JSON diya. Dobara try karo.")
    except Exception as e:
        raise ValueError(f"Groq API Error: {str(e)}")