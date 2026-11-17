# Mindora AI — Evolving AI Tools Hub & Automated Pipeline

An attractive, interactive web platform tracking, cataloging, and benchmarking the evolving landscape of Artificial Intelligence tools around the globe.

---

## ⚡ Automated AI Research & Deployment Pipeline

Mindora AI features an automated GitHub Actions pipeline that performs global AI research and updates the tool registry twice daily:

- **Schedule**: Every day at **9:00 AM PKT** and **6:00 PM PKT** (Pakistan Standard Time, UTC+5).
  - *Cron equivalent*: `0 4,13 * * *` (04:00 UTC and 13:00 UTC)
- **Intelligence Engine**: Google Gemini API (`gemini-3.1-flash-lite`, `gemini-3.8-flash`, etc.) with multi-model fallback.
- **Global Scope**: Discovers and indexes evolving AI tools across reasoning models, agentic coding tools, creative video & image generators, real-time voice, research engines, and open-source local inference stacks.
- **Auto-Publish & Deploy**: Automatically commits newly cataloged tools to the `main` branch and deploys the live site to GitHub Pages.

---

## 🚀 Manual Workflow Trigger

You can also run the research cycle manually anytime:
1. Navigate to [GitHub Actions](https://github.com/ittrackinstitute0-lgtm/mindora-AI-/actions).
2. Select **Mindora AI - Automated Evolving AI Tools Pipeline**.
3. Click **Run workflow** -> **Branch: main** -> **Run workflow**.

---

## 🔐 Configuring GitHub Secret (Recommended)

To securely manage your Gemini API key in GitHub:
1. Go to repository **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret**.
3. Name: `GEMINI_API_KEY`
4. Value: Paste your Gemini API key.
5. Click **Add secret**.

---

## 📁 Repository Structure

```
.
├── .github/
│   └── workflows/
│       └── update-ai-tools.yml   # Daily 9:00 AM & 6:00 PM PKT automation & deployment
├── scripts/
│   └── fetch_ai_tools.py        # Gemini-powered global research probe & data merger
├── index.html                   # Responsive frontend interface
├── css/
│   └── style.css                # Dark cybernetic theme & animations
├── js/
│   ├── data.js                  # Dynamic AI tools registry
│   └── script.js                # Neural canvas, live filtering, comparison & inspector
├── README.md                    # Documentation
└── .gitignore                   # Ignored files
```
