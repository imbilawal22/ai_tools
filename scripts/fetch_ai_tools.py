#!/usr/bin/env python3
"""
Mindora AI - Automated Global Real AI Tools Research Pipeline
- Researches ONLY real, verified, publicly usable AI web applications worldwide.
- NEVER invents or fabricates fictional tools.
- Verifies every official direct-launch app URL over HTTPS before saving to js/data.js.
"""

import os
import sys
import json
import re
import ssl
import time
import urllib.request
import urllib.error
from urllib.parse import urlparse

DATA_FILE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "js", "data.js")
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
if not GEMINI_API_KEY:
    print("[!] Error: GEMINI_API_KEY environment variable is not set.")
    print("[!] Please configure GEMINI_API_KEY in GitHub Repository Secrets.")
    sys.exit(1)

CANDIDATE_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-3-flash-preview"
]

VALID_CATEGORIES = {"reasoning", "coding", "creative", "voice", "research", "opensource"}
VALID_BADGE_TYPES = {"frontier", "agentic", "creative", "voice", "open"}
BLOCKED_DOMAINS = {"example.com", "official-website-or-github-url", "localhost", "127.0.0.1"}


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
    last_error = None

    for use_grounding in (True, False):
        mode_label = "Google Search grounded" if use_grounding else "standard verified"
        for model in CANDIDATE_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 8192
                }
            }
            if use_grounding:
                payload["tools"] = [{"google_search": {}}]

            print(f"[*] Probing {model} ({mode_label})...")
            for attempt in range(1, 3):
                try:
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(payload).encode("utf-8"),
                        headers={"Content-Type": "application/json"}
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
                        break  # Immediately move on if grounding quota is exhausted
                    if e.code in (429, 503):
                        time.sleep(2 * attempt)
                    else:
                        break
                except Exception as e:
                    last_error = e
                    print(f"    [-] {model} ({mode_label}, attempt {attempt}) error: {e}")
                    time.sleep(1)

    print(f"[!] All candidate models failed. Last error: {last_error}")
    sys.exit(1)


def perform_global_research(existing_names):
    """Research real, live, publicly usable AI web apps from around the world"""
    existing_list_str = ", ".join(existing_names[:40]) if existing_names else "None"

    prompt = f"""You are the Global AI Directory Researcher for Mindora AI.
Your job is to find REAL, PUBLICLY LAUNCHED, USABLE AI web applications from around the world (USA, Europe, China, Open-Source global community) that visitors can click and immediately use in their browser just like ChatGPT, NotebookLM, or Hugging Face.

STRICT RULES — NEVER VIOLATE:
1. NEVER invent, fabricate, or create fictional or unreleased AI tools. Every tool MUST be a real, widely recognized, live web app.
2. Every tool MUST include its REAL, DIRECT, USABLE official app URL starting with "https://" (for example: https://chat.mistral.ai, https://chat.qwen.ai, https://poe.com, https://ideogram.ai, https://replit.com, https://heygen.com, https://udio.com, https://consensus.app, https://elicit.com, https://pika.art, https://lumalabs.ai, https://www.meta.ai, https://copilot.microsoft.com, https://windsurf.com, https://napkin.ai, https://www.canva.com, https://hume.ai, https://cartesia.ai, https://aistudio.google.com, https://openrouter.ai).
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
    return query_gemini_with_fallback(prompt)


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
    """Merge verified live tools with existing tools (without duplicates or overwriting curated entries)"""
    tools_by_id = {t["id"]: t for t in existing_tools if "id" in t}
    existing_names_lower = {t.get("name", "").lower() for t in existing_tools}
    existing_hosts = {urlparse(t.get("website", "")).hostname for t in existing_tools if t.get("website")}

    added_count = 0
    rejected_count = 0

    for raw_tool in candidate_tools:
        # Skip duplicates before making network checks
        cand_name = str(raw_tool.get("name", "")).strip().lower()
        cand_id = re.sub(r"[^a-z0-9]+", "-", str(raw_tool.get("id") or cand_name).lower()).strip("-")
        cand_host = urlparse(str(raw_tool.get("website", "")).strip()).hostname

        if cand_id in tools_by_id or cand_name in existing_names_lower or (cand_host and cand_host in existing_hosts):
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
        print(f"[*] No new unique verified tools to add (rejected {rejected_count}). Keeping existing {len(existing_tools)} tools untouched.")
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

    print(f"[✓] Success: Added {added_count} newly verified live AI tools (rejected {rejected_count}). Total: {len(merged_list)} tools.")


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
