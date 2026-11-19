#!/usr/bin/env python3
"""
Mindora AI - Automated Global Real AI Tools Research Pipeline
- Researches ONLY real, verified, publicly usable AI web applications worldwide.
- Discovers new tools via Gemini API with search grounding when GEMINI_API_KEY is available.
- Features a resilient global discovery candidate pool as fallback when run locally without an API key.
- Verifies every official direct-launch app URL over HTTPS before saving to js/data.js.
"""

import json
import os
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
from urllib.parse import urlparse

DATA_FILE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "js", "data.js")
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

CANDIDATE_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
]

VALID_CATEGORIES = {"reasoning", "coding", "creative", "voice", "research", "opensource"}
VALID_BADGE_TYPES = {"frontier", "agentic", "creative", "voice", "open"}
BLOCKED_DOMAINS = {"example.com", "official-website-or-github-url", "localhost", "127.0.0.1"}

# Resilient pool of verified global AI tools used as discovery candidates
FALLBACK_CANDIDATES = [
    {
        "id": "poe",
        "name": "Poe",
        "category": "reasoning",
        "provider": "Quora",
        "badge": "Multi-Model Hub",
        "badgeType": "frontier",
        "tagline": "Fast, unified AI ecosystem letting users chat with GPT-4o, Claude 3.5, Gemini Pro, and custom bots in one place.",
        "description": "Poe provides multi-bot chat switching, custom bot creation, and multi-model comparison across leading proprietary and open-source models.",
        "releaseYear": "2023-2026",
        "contextWindow": "Multi-Model Context",
        "openSource": False,
        "pricing": "Free Tier / Subscription",
        "modalities": ["Text", "Multi-Bot", "Image", "Code"],
        "metrics": {"reasoning": 92, "speed": 94, "costEfficiency": 90, "coding": 88},
        "useCases": ["Switching between top AI models in a single chat interface", "Creating and sharing custom prompt bots and knowledge bases", "Comparing responses from different LLMs side by side"],
        "website": "https://poe.com",
        "trending": True,
    },
    {
        "id": "v0-dev",
        "name": "v0 by Vercel",
        "category": "coding",
        "provider": "Vercel",
        "badge": "UI Generator",
        "badgeType": "agentic",
        "tagline": "Generative user interface system powered by AI, producing clean React, Next.js, and Tailwind CSS code.",
        "description": "v0 turns prompts and wireframes into production-ready React components with Tailwind CSS and Lucide icons ready to copy or fork into Next.js projects.",
        "releaseYear": "2023-2026",
        "contextWindow": "React Components",
        "openSource": False,
        "pricing": "Free / Premium",
        "modalities": ["UI Code", "React", "Tailwind"],
        "metrics": {"reasoning": 91, "speed": 93, "costEfficiency": 89, "coding": 97},
        "useCases": ["Rapid prototyping of modern web user interfaces", "Converting screenshots or designs into clean Tailwind code", "Iterative component refinement with live previews"],
        "website": "https://v0.dev",
        "trending": True,
    },
    {
        "id": "cohere-coral",
        "name": "Cohere Command",
        "category": "reasoning",
        "provider": "Cohere",
        "badge": "Enterprise RAG",
        "badgeType": "frontier",
        "tagline": "Enterprise-grade conversational AI model optimized for grounded retrieval, multilingual business tasks, and citations.",
        "description": "Cohere Command R+ delivers high-efficiency retrieval-augmented generation (RAG) with verifiable citations and enterprise document grounding across 10+ languages.",
        "releaseYear": "2024-2026",
        "contextWindow": "128k Tokens",
        "openSource": False,
        "pricing": "Free Trial / Enterprise Pay-per-Token",
        "modalities": ["Text", "Search RAG", "Citations"],
        "metrics": {"reasoning": 93, "speed": 92, "costEfficiency": 91, "coding": 82},
        "useCases": ["Enterprise retrieval-augmented generation and synthesis", "Accurate citation extraction from internal databases", "Multilingual corporate communication and analysis"],
        "website": "https://cohere.com",
        "trending": True,
    },
    {
        "id": "together-ai",
        "name": "Together AI",
        "category": "opensource",
        "provider": "Together AI",
        "badge": "Fast Inference",
        "badgeType": "open",
        "tagline": "The fastest cloud inference platform for open-source AI models including Llama 3, DeepSeek, and FLUX.",
        "description": "Together AI provides ultra-low latency serverless endpoints for open-weight foundation models and image generators, delivering speeds up to 150+ tokens per second.",
        "releaseYear": "2023-2026",
        "contextWindow": "Model Dependant / Up to 128k",
        "openSource": True,
        "pricing": "Pay-per-Token / Free Trial",
        "modalities": ["Open Models", "Fast API", "Fine-tuning"],
        "metrics": {"reasoning": 92, "speed": 98, "costEfficiency": 96, "coding": 90},
        "useCases": ["Running ultra-fast inference on open models like Llama and DeepSeek", "Fine-tuning custom open-weights models on dedicated clusters", "Building production AI features with high throughput APIs"],
        "website": "https://www.together.ai",
        "trending": True,
    },
    {
        "id": "recraft-ai",
        "name": "Recraft AI",
        "category": "creative",
        "provider": "Recraft",
        "badge": "Vector & 3D Art",
        "badgeType": "creative",
        "tagline": "Professional design AI platform generating clean vector graphics, 3D illustrations, and brand assets in infinite resolution.",
        "description": "Recraft produces editable SVG vector art, icons, and 3D illustrations with strict brand style palettes, making it a favorite for product designers and marketing teams.",
        "releaseYear": "2023-2026",
        "contextWindow": "Infinite Canvas & Style Guides",
        "openSource": False,
        "pricing": "Free Tier / Pro",
        "modalities": ["Vector SVG", "Raster 3D", "Icons", "Brand Colors"],
        "metrics": {"reasoning": 89, "speed": 92, "costEfficiency": 94, "coding": 65},
        "useCases": ["Generating clean editable SVG vector icons and illustrations", "Maintaining brand color and visual style consistency across assets", "Exporting transparent assets for mobile apps and web design"],
        "website": "https://www.recraft.ai",
        "trending": True,
    },
    {
        "id": "hedra",
        "name": "Hedra",
        "category": "creative",
        "provider": "Hedra",
        "badge": "Expressive Video",
        "badgeType": "creative",
        "tagline": "Real-time expressive character video generation syncing human speech, emotion, and motion.",
        "description": "Hedra's Character-1 model transforms audio recordings and character portraits into expressive talking-head video clips with nuanced facial emotion and head motion.",
        "releaseYear": "2024-2026",
        "contextWindow": "Full Character Audio",
        "openSource": False,
        "pricing": "Free Credits / Pro",
        "modalities": ["Audio to Video", "Character Avatars", "Facial Animation"],
        "metrics": {"reasoning": 87, "speed": 90, "costEfficiency": 89, "coding": 56},
        "useCases": ["Creating expressive animated characters from voice recordings", "Interactive virtual podcasts and visual storytelling", "Social video shorts with animated hosts"],
        "website": "https://www.hedra.com",
        "trending": True,
    },
    {
        "id": "openrouter",
        "name": "OpenRouter",
        "category": "opensource",
        "provider": "OpenRouter",
        "badge": "Unified LLM API",
        "badgeType": "open",
        "tagline": "A unified interface and API routing to hundreds of frontier and open-source models at competitive rates.",
        "description": "OpenRouter provides access to 200+ AI models from OpenAI, Anthropic, Google, Meta, and open-source labs through a single OpenAI-compatible API key with live pricing rankings.",
        "releaseYear": "2023-2026",
        "contextWindow": "Up to 2M Tokens",
        "openSource": False,
        "pricing": "Pay-per-Token / Many Free Models",
        "modalities": ["API Gateway", "Multi-Model", "Prompt Playground"],
        "metrics": {"reasoning": 95, "speed": 94, "costEfficiency": 98, "coding": 94},
        "useCases": ["Routing queries dynamically to the cheapest or fastest available model", "Experimenting with hundreds of open and frontier LLMs in one place", "Eliminating vendor lock-in for AI applications"],
        "website": "https://openrouter.ai",
        "trending": True,
    },
    {
        "id": "play-ht",
        "name": "PlayHT",
        "category": "voice",
        "provider": "PlayHT",
        "badge": "Voice Cloning",
        "badgeType": "voice",
        "tagline": "AI voice generator and conversational voice model producing human-like text-to-speech in 140+ languages.",
        "description": "PlayHT delivers realistic text-to-speech with granular emotion control, instant voice cloning, and a conversational streaming audio API tailored for virtual agents.",
        "releaseYear": "2022-2026",
        "contextWindow": "Streaming Voice API",
        "openSource": False,
        "pricing": "Free / Creator / Unlimited",
        "modalities": ["TTS Voice", "Voice Cloning", "Podcasts"],
        "metrics": {"reasoning": 88, "speed": 93, "costEfficiency": 90, "coding": 68},
        "useCases": ["Voiceover narration for YouTube videos and podcasts", "Instant voice cloning for brand consistency", "Low-latency streaming audio for conversational bots"],
        "website": "https://play.ht",
        "trending": True,
    },
    {
        "id": "claude-code",
        "name": "Claude Code",
        "category": "coding",
        "provider": "Anthropic",
        "badge": "Agentic Terminal",
        "badgeType": "agentic",
        "tagline": "Anthropic's agentic command-line tool that navigates codebases, edits files, and runs terminal commands.",
        "description": "Claude Code lives directly in your terminal, understanding large repositories, resolving complex git issues, running test suites, and creating multi-file PRs with frontier reasoning.",
        "releaseYear": "2025-2026",
        "contextWindow": "200k Tokens / Multi-File",
        "openSource": False,
        "pricing": "Pay-per-Token / Anthropic API",
        "modalities": ["Terminal", "Code", "Git", "Tests"],
        "metrics": {"reasoning": 98, "speed": 91, "costEfficiency": 88, "coding": 98},
        "useCases": ["Terminal-driven multi-file refactoring and bug fixing", "Navigating and understanding unfamiliar large software codebases", "Automated git commit curation and pull request generation"],
        "website": "https://docs.anthropic.com/en/docs/agents-and-tools/claude-code",
        "trending": True,
    },
    {
        "id": "fish-audio",
        "name": "Fish Audio",
        "category": "voice",
        "provider": "Fish Audio",
        "badge": "Open Voice AI",
        "badgeType": "voice",
        "tagline": "Ultra-low-latency, open-weights multilingual audio foundation model with expressive voice cloning.",
        "description": "Fish Audio provides leading multilingual speech synthesis and lightning-fast voice conversion with few-shot cloning from just a few seconds of audio.",
        "releaseYear": "2024-2026",
        "contextWindow": "Multilingual Audio",
        "openSource": True,
        "pricing": "Free Tier / Pro",
        "modalities": ["Voice Synthesis", "Voice Cloning", "Audio API"],
        "metrics": {"reasoning": 89, "speed": 96, "costEfficiency": 95, "coding": 72},
        "useCases": ["Cross-lingual expressive voice synthesis from text", "High-fidelity few-shot voice cloning from 10-second samples", "Streaming real-time conversational voice agent infrastructure"],
        "website": "https://fish.audio",
        "trending": True,
    }
]


def load_existing_tools():
    """Extract existing AI_TOOLS_DATA array from js/data.js"""
    if not os.path.exists(DATA_FILE_PATH):
        print(f"[!] Data file not found at {DATA_FILE_PATH}")
        return []

    try:
        with open(DATA_FILE_PATH, "r", encoding="utf-8") as f:
            content = f.read()

        match = re.search(r"let\s+AI_TOOLS_DATA\s*=\s*(\[.*?\]);", content, re.DOTALL)
        if match:
            raw_json = match.group(1)
            return json.loads(raw_json)
    except Exception as e:
        print(f"[!] Error parsing existing data.js: {e}")

    return []


def verify_url_live(url):
    """
    Strictly verify that a tool's direct app URL is a real, live, reachable HTTPS website.
    Rejects fake domains, placeholders, DNS errors, 404s, 410s, and 5xx errors.
    """
    if not isinstance(url, str) or not url.startswith("https://"):
        return False

    try:
        parsed = urlparse(url)
        host = (parsed.hostname or "").lower()
        if not host or "." not in host or host in BLOCKED_DOMAINS:
            return False

        ctx = ssl.create_default_context()
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
            return 200 <= resp.status < 400
    except urllib.error.HTTPError as e:
        # Real web apps behind Cloudflare/login walls often return 401/403/405/429 to automated checks
        return e.code in (401, 403, 405, 429)
    except Exception:
        return False


def extract_json_array(raw_text):
    """Clean markdown fences and extract JSON array from model response"""
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    start = text.find("[")
    end = text.rfind("]")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]

    return json.loads(text)


def query_gemini_with_fallback(prompt):
    """Try Gemini with Google Search grounding first, then standard mode across fallback models."""
    if not GEMINI_API_KEY:
        print("[i] GEMINI_API_KEY not configured. Falling back to verified candidate research bank.")
        return None

    last_error = None
    for use_grounding in (True, False):
        mode_label = "Google Search grounded" if use_grounding else "standard verified"
        for model in CANDIDATE_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 8192,
                },
            }
            if use_grounding:
                payload["tools"] = [{"google_search": {}}]

            print(f"[*] Probing {model} ({mode_label})...")
            for attempt in range(1, 3):
                try:
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(payload).encode("utf-8"),
                        headers={"Content-Type": "application/json"},
                    )
                    with urllib.request.urlopen(req, timeout=45) as response:
                        res_data = json.loads(response.read().decode("utf-8"))
                        parts = res_data["candidates"][0]["content"]["parts"]
                        raw_text = "".join(p.get("text", "") for p in parts)
                        parsed_data = extract_json_array(raw_text)
                        if isinstance(parsed_data, list) and len(parsed_data) > 0:
                            print(f"[✓] {model} ({mode_label}) returned {len(parsed_data)} candidates.")
                            return parsed_data
                except urllib.error.HTTPError as e:
                    last_error = e
                    print(f"    [-] {model} ({mode_label}, attempt {attempt}) HTTP {e.code}: {e.reason}")
                    if e.code == 429 and use_grounding:
                        break
                    if e.code in (429, 503):
                        time.sleep(2 * attempt)
                    else:
                        break
                except Exception as e:
                    last_error = e
                    print(f"    [-] {model} ({mode_label}, attempt {attempt}) error: {e}")
                    time.sleep(1)

    print(f"[!] Gemini probing failed ({last_error}). Falling back to verified candidate discovery bank.")
    return None


def perform_global_research(existing_names):
    """Research real, live, publicly usable AI web apps from around the world"""
    existing_list_str = ", ".join(existing_names[:40]) if existing_names else "None"

    prompt = f"""You are the Global AI Directory Researcher for Mindora AI.
Your job is to find REAL, PUBLICLY LAUNCHED, USABLE AI web applications from around the world (USA, Europe, China, Open-Source global community) that visitors can click and immediately use in their browser just like ChatGPT, NotebookLM, or Hugging Face.

STRICT RULES — NEVER VIOLATE:
1. NEVER invent, fabricate, or create fictional or unreleased AI tools. Every tool MUST be a real, widely recognized, live web app.
2. Every tool MUST include its REAL, DIRECT, USABLE official app URL starting with "https://".
3. Prioritize real, high-utility AI tools that are NOT already in this existing list:
   [{existing_list_str}]
4. Return ONLY a valid JSON array of 4 to 6 newly discovered real AI tools. No markdown commentary.

Each object MUST follow this exact JSON schema:
{{
  "id": "lowercase-slug",
  "name": "Official Tool Name",
  "category": "reasoning" | "coding" | "creative" | "voice" | "research" | "opensource",
  "provider": "Official Company or Organization",
  "badge": "Short 2-word tag e.g. Open Chat, AI Video, Code Agent",
  "badgeType": "frontier" | "agentic" | "creative" | "voice" | "open",
  "tagline": "Clear 1-sentence summary of what users can do directly inside this app",
  "description": "2 concise, accurate sentences about this real AI application and its standout features.",
  "releaseYear": "2024-2026",
  "contextWindow": "Accurate scope e.g. 128k Tokens or Web App",
  "openSource": true or false,
  "pricing": "Accurate pricing e.g. Free Tier / Pro",
  "modalities": ["Text", "Code"],
  "metrics": {{
    "reasoning": integer 65-99,
    "speed": integer 65-99,
    "costEfficiency": integer 65-100,
    "coding": integer 50-99
  }},
  "useCases": ["Real use case 1", "Real use case 2", "Real use case 3"],
  "website": "https://direct-official-app-url",
  "trending": true
}}
"""
    results = query_gemini_with_fallback(prompt)
    if results:
        return results

    # Fallback to curated candidates
    print("[*] Probing curated discovery bank for uncataloged live AI apps...")
    existing_lower = {n.lower() for n in existing_names}
    unadded = [c for c in FALLBACK_CANDIDATES if c["name"].lower() not in existing_lower]
    return unadded[:5]


def sanitize_and_validate_tool(tool):
    """Validate structure and verify the official website URL is live"""
    if not isinstance(tool, dict):
        return None

    name = str(tool.get("name", "")).strip()
    website = str(tool.get("website", "")).strip()
    if not name or not website:
        return None

    print(f"[*] Verifying live URL for {name}: {website} ...", end=" ")
    if not verify_url_live(website):
        print("REJECTED (URL unreachable or invalid)")
        return None
    print("VERIFIED OK")

    tid = re.sub(r"[^a-z0-9]+", "-", str(tool.get("id") or name).lower()).strip("-")
    category = tool.get("category", "reasoning")
    if category not in VALID_CATEGORIES:
        category = "reasoning"

    badge_type = tool.get("badgeType", "frontier")
    if badge_type not in VALID_BADGE_TYPES:
        badge_type = "frontier"

    metrics = tool.get("metrics") if isinstance(tool.get("metrics"), dict) else {}

    def clamp(val, default=85):
        try:
            return max(50, min(100, int(val)))
        except Exception:
            return default

    return {
        "id": tid,
        "name": name,
        "category": category,
        "provider": str(tool.get("provider", name)).strip(),
        "badge": str(tool.get("badge", "Live App")).strip()[:24],
        "badgeType": badge_type,
        "tagline": str(tool.get("tagline", "")).strip(),
        "description": str(tool.get("description", "")).strip(),
        "releaseYear": str(tool.get("releaseYear", "2025-2026")).strip(),
        "contextWindow": str(tool.get("contextWindow", "Web App")).strip(),
        "openSource": bool(tool.get("openSource", False)),
        "pricing": str(tool.get("pricing", "Free Tier / Pro")).strip(),
        "modalities": [str(m).strip() for m in (tool.get("modalities") or ["Text"])][:5],
        "metrics": {
            "reasoning": clamp(metrics.get("reasoning"), 85),
            "speed": clamp(metrics.get("speed"), 88),
            "costEfficiency": clamp(metrics.get("costEfficiency"), 85),
            "coding": clamp(metrics.get("coding"), 80),
        },
        "useCases": [str(u).strip() for u in (tool.get("useCases") or ["Interactive AI workflow"])][:3],
        "website": website,
        "trending": bool(tool.get("trending", True)),
    }


def merge_and_save_tools(existing_tools, candidate_tools):
    """Merge verified live tools with existing tools without duplicates"""
    tools_by_id = {t["id"]: t for t in existing_tools if "id" in t}
    existing_names_lower = {t.get("name", "").lower() for t in existing_tools}
    existing_hosts = {
        urlparse(t.get("website", "")).hostname
        for t in existing_tools
        if t.get("website")
    }

    added_count = 0
    rejected_count = 0

    for raw_tool in candidate_tools:
        cand_name = str(raw_tool.get("name", "")).strip().lower()
        cand_id = re.sub(
            r"[^a-z0-9]+", "-", str(raw_tool.get("id") or cand_name).lower()
        ).strip("-")
        cand_host = urlparse(str(raw_tool.get("website", "")).strip()).hostname

        if (
            cand_id in tools_by_id
            or cand_name in existing_names_lower
            or (cand_host and cand_host in existing_hosts)
        ):
            print(f"    [~] Skipping already cataloged tool: {raw_tool.get('name')}")
            continue

        validated = sanitize_and_validate_tool(raw_tool)
        if not validated:
            rejected_count += 1
            continue

        tools_by_id[validated["id"]] = validated
        existing_names_lower.add(validated["name"].lower())
        existing_hosts.add(urlparse(validated["website"]).hostname)
        added_count += 1

    if added_count == 0:
        print(
            f"[*] No new unique verified tools to add (rejected {rejected_count}). Keeping existing {len(existing_tools)} tools untouched."
        )
        return

    merged_list = list(tools_by_id.values())

    output_js = f"""// Mindora AI - Global Verified Evolving AI Tools Dataset
// Every entry links directly to the real, live official web application.
// Automatically researched & verified via Mindora AI Pipeline (9:00 AM & 6:00 PM PKT)
// Total Verified Live Apps: {len(merged_list)}

let AI_TOOLS_DATA = {json.dumps(merged_list, indent=2, ensure_ascii=False)};

// Available Categories
const AI_CATEGORIES = [
  {{ id: "all", name: "All Tools" }},
  {{ id: "reasoning", name: "Chat & Reasoning" }},
  {{ id: "coding", name: "Coding & App Builders" }},
  {{ id: "creative", name: "Video, Image & Music" }},
  {{ id: "voice", name: "Voice & Audio" }},
  {{ id: "research", name: "Research & Docs" }},
  {{ id: "opensource", name: "Open Source & Hubs" }}
];
"""

    with open(DATA_FILE_PATH, "w", encoding="utf-8") as f:
        f.write(output_js)

    print(
        f"[✓] Success: Added {added_count} newly verified live AI tools (rejected {rejected_count}). Total: {len(merged_list)} tools."
    )


def main():
    print("==========================================================")
    print("Mindora AI - Verified Global AI Tools Research Pipeline")
    print("==========================================================")
    existing = load_existing_tools()
    existing_names = [t.get("name", "") for t in existing if "name" in t]
    print(f"[*] Loaded {len(existing)} existing verified AI apps.")

    candidates = perform_global_research(existing_names)
    print(f"[*] Received {len(candidates)} real tool candidates for live URL verification.")

    merge_and_save_tools(existing, candidates)
    print("[*] Research & verification cycle finished.")


if __name__ == "__main__":
    main()
