"""
backend/utils/report_generator.py
====================================
Generates professional wildlife sighting reports using Generative AI.
Primary:  Anthropic Claude API
Fallback: OpenAI GPT-4

Setup (.env):
    ANTHROPIC_API_KEY=your-key
    OPENAI_API_KEY=your-key   (optional fallback)
"""

import os
from dotenv import load_dotenv

load_dotenv()


def generate_report(species: str, confidence: float, location: str = "Unknown") -> str:
    """
    Generate a wildlife conservation report for an identified species.

    Args:
        species:    Identified species name (e.g., "Bengal Tiger")
        confidence: AI model confidence percentage
        location:   Where the sighting occurred

    Returns:
        Formatted report string (250-350 words)
    """
    prompt = f"""You are a wildlife conservation expert. Write a professional sighting report for:

Species    : {species}
Confidence : {confidence:.1f}%
Location   : {location}

Include: IUCN Red List status, natural habitat, behavior, population trend,
key threats, and conservation recommendations. Keep it 250-300 words, professional tone."""

    # ── Try Anthropic Claude ──────────────────────────────────────────────
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if api_key:
        try:
            import anthropic
            client  = anthropic.Anthropic(api_key=api_key)
            message = client.messages.create(
                model="claude-opus-4-6",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
            )
            return message.content[0].text
        except Exception as e:
            print(f"[ReportGen] Claude error: {e}")

    # ── Fallback: OpenAI ─────────────────────────────────────────────────
    oai_key = os.getenv("OPENAI_API_KEY", "")
    if oai_key:
        try:
            from openai import OpenAI
            client   = OpenAI(api_key=oai_key)
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"[ReportGen] OpenAI error: {e}")

    # ── Placeholder if no API key ─────────────────────────────────────────
    return (
        f"WILDLIFE SIGHTING REPORT\n"
        f"Species: {species} | Confidence: {confidence:.1f}% | Location: {location}\n\n"
        f"[Add ANTHROPIC_API_KEY or OPENAI_API_KEY to .env to enable AI-generated reports]"
    )
