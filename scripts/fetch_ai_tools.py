#!/usr/bin/env python3
"""
Mindora AI - Automated Evolving AI Tools Research Pipeline
Powered by Gemini API with multi-model fallback & automatic retry logic.
"""

import os
import sys
import json
import re
import time
import urllib.request
import urllib.error

# Path to the website data file
DATA_FILE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "js", "data.js")
)

# API Configuration - read strictly from environment variable
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
if not GEMINI_API_KEY:
    print("[!] Error: GEMINI_API_KEY environment variable is not set.")
    print("[!] Please set the GEMINI_API_KEY environment variable or GitHub Actions Secret.")
    sys.exit(1)

# Resilient Model Fallback Hierarchy
CANDIDATE_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-2.5-pro",
    "gemini-3-flash-preview"
]


def load_existing_tools():
    """Extract existing AI_TOOLS_DATA from js/data.js"""
    if not os.path.exists(DATA_FILE_PATH):
        print(f"[!] Data file not found at {DATA_FILE_PATH}")
        return []

    try:
        with open(DATA_FILE_PATH, "r", encoding="utf-8") as f:
            content = f.read()

        match = re.search(r"let\s+AI_TOOLS_DATA\s*=\s*(\[.*?\]);", content, re.DOTALL)
        if match:
            raw_json = match.group(1)
            # Remove single line comments
            clean_json = re.sub(r"//.*", "", raw_json)
            return json.loads(clean_json)
    except Exception as e:
        print(f"[!] Error parsing existing data.js: {e}")

    return []


def query_gemini_with_fallback(prompt):
    """Query Gemini with automatic retry and model fallback"""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 8192
        }
    }

    last_error = None

    for model in CANDIDATE_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
        print(f"[*] Probing research agent with model: {model}...")

        for attempt in range(1, 3):
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=45) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    raw_text = res_data["candidates"][0]["content"]["parts"][0]["text"].strip()

                    # Strip code block markers if present
                    if raw_text.startswith("```"):
                        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
                        raw_text = re.sub(r"\s*```$", "", raw_text)

                    parsed_data = json.loads(raw_text)
                    print(f"[✓] Model {model} succeeded on attempt {attempt}.")
                    return parsed_data

            except urllib.error.HTTPError as e:
                last_error = e
                print(f"    [-] {model} (attempt {attempt}) HTTP {e.code}: {e.reason}")
                if e.code in (429, 503):
                    time.sleep(2 * attempt)
                else:
                    break
            except Exception as e:
                last_error = e
                print(f"    [-] {model} (attempt {attempt}) error: {e}")
                time.sleep(1)

    print(f"[!] All candidate models failed. Last error: {last_error}")
    sys.exit(1)


def perform_global_research(existing_names):
    """Generate prompt and fetch researched tools from around the world"""
    existing_list_str = ", ".join(existing_names[:30]) if existing_names else "None yet"

    prompt = f"""You are the Frontier AI Intelligence Research Agent for Mindora AI.
Your mission is to perform automated research from every corner of the world (US, Europe, Asia, Open-Source community, frontier labs) to discover and catalog the newest, most impactful, and evolving Artificial Intelligence tools.

Existing tools already in database: [{existing_list_str}].

Conduct a global survey and select 8 to 12 cutting-edge AI tools across diverse categories:
1. "reasoning" (Frontier Reasoning & Large Models, e.g. DeepSeek R1, Claude 3.7 Sonnet, GPT-4o, Gemini 2.5/3, Qwen)
2. "coding" (Agentic Software Engineering & IDEs, e.g. Cursor, Devin, Windsurf, Bolt.new, Antigravity)
3. "creative" (Generative Video, Visuals & Music, e.g. Sora, Runway Gen-3/4, Kling AI, FLUX.1, Midjourney v7, Suno)
4. "voice" (Real-Time Audio & Multimodal, e.g. ElevenLabs, Hume AI EVI, Cartesia, OpenAI Realtime)
5. "research" (Knowledge Synthesis & Deep Search, e.g. Perplexity Pro, NotebookLM, Consensus)
6. "opensource" (Open-Source Weights & Local Inference Engines, e.g. Ollama, vLLM, Llama 3.3, Hugging Face)

IMPORTANT RULES:
- Focus on real, active, frontier tools with significant evolutionary breakthroughs.
- Return ONLY a valid JSON array of objects. Do not include markdown codeblocks or explanation.
- Each object must have this exact JSON schema:
{{
  "id": "slug-name-lowercase",
  "name": "Full Tool Name",
  "category": "reasoning" | "coding" | "creative" | "voice" | "research" | "opensource",
  "provider": "Company / Laboratory / Community",
  "badge": "Frontier" | "Open Weights" | "Agentic" | "Realtime Voice" | "Video Engine",
  "badgeType": "frontier" | "agentic" | "creative" | "voice" | "open",
  "tagline": "A crisp, compelling 1-sentence hook on what makes this tool revolutionary",
  "description": "2-3 detailed sentences explaining architectural breakthrough and capabilities",
  "releaseYear": "2024-2026",
  "contextWindow": "e.g. 128k Tokens or 2M Tokens or Audio Stream",
  "openSource": true or false,
  "pricing": "e.g. Free Tier / Open Weights / Commercial API",
  "modalities": ["Text", "Code", "Vision", etc.],
  "metrics": {{
    "reasoning": integer 60-100,
    "speed": integer 60-100,
    "costEfficiency": integer 60-100,
    "coding": integer 60-100
  }},
  "useCases": ["Practical use case 1", "Practical use case 2", "Practical use case 3"],
  "website": "https://official-website-or-github-url",
  "trending": true
}}
"""
    return query_gemini_with_fallback(prompt)


def merge_and_save_tools(existing_tools, new_tools):
    """Merge new tools with existing list without duplicates and save to data.js"""
    tools_by_id = {t["id"]: t for t in existing_tools if "id" in t}

    added_count = 0
    updated_count = 0

    for tool in new_tools:
        tid = tool.get("id")
        if not tid:
            tid = re.sub(r"[^a-z0-9]+", "-", tool.get("name", "tool").lower()).strip("-")
            tool["id"] = tid

        if tid in tools_by_id:
            tools_by_id[tid].update(tool)
            updated_count += 1
        else:
            tools_by_id[tid] = tool
            added_count += 1

    merged_list = list(tools_by_id.values())

    output_js = f"""// Mindora AI - Evolving AI Tools Ecosystem Dataset
// Automatically updated via Mindora AI Research Pipeline powered by Gemini API
// Total Tools Cataloged: {len(merged_list)}

let AI_TOOLS_DATA = {json.dumps(merged_list, indent=2, ensure_ascii=False)};

// Available Categories for new tools
const AI_CATEGORIES = [
  {{ id: "all", name: "All Tools" }},
  {{ id: "reasoning", name: "Reasoning & Frontier" }},
  {{ id: "coding", name: "Agentic Engineering" }},
  {{ id: "creative", name: "Generative Vision & Video" }},
  {{ id: "voice", name: "Voice & Multimodal" }},
  {{ id: "research", name: "Research & Knowledge" }},
  {{ id: "opensource", name: "Open Source & Local" }}
];
"""

    with open(DATA_FILE_PATH, "w", encoding="utf-8") as f:
        f.write(output_js)

    print(f"[✓] Success: Added {added_count} new tools, updated {updated_count} tools. Total: {len(merged_list)} tools in Mindora AI.")


def main():
    print("==================================================")
    print("Mindora AI - Automated Global AI Research Probe")
    print("==================================================")
    existing = load_existing_tools()
    existing_names = [t.get("name", "") for t in existing if "name" in t]
    print(f"[*] Found {len(existing)} existing tools in registry.")

    new_tools = perform_global_research(existing_names)
    print(f"[*] Researched {len(new_tools)} evolving tools globally.")

    merge_and_save_tools(existing, new_tools)
    print("[*] Research cycle completed successfully.")


if __name__ == "__main__":
    main()
