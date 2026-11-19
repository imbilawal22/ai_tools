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

## 💻 Local Windows Automation (9:00 AM & 6:00 PM Daily)

You can also run the automated research pipeline locally on your Windows machine:

1. **Automatic Scheduling**:
   Run PowerShell as Administrator and execute:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/setup_daily_schedule.ps1
   ```
   This registers two automated Windows Scheduled Tasks:
   - `MindoraAI_Research_9AM`: Runs daily at 9:00 AM
   - `MindoraAI_Research_6PM`: Runs daily at 6:00 PM

2. **One-Click Manual Run**:
   Double-click `scripts/run_daily_update.bat` to research, verify live URLs, and push newly discovered AI apps to the website immediately.

---

## 📁 Repository Structure

```
.
├── .github/
│   └── workflows/
│       └── update-ai-tools.yml   # Daily 9:00 AM & 6:00 PM PKT GitHub Actions automation
├── scripts/
│   ├── fetch_ai_tools.py        # Global research probe & live HTTPS URL validator
│   ├── run_daily_update.bat     # Windows automated runner & git sync script
│   ├── setup_daily_schedule.ps1 # Windows Task Scheduler auto-configurator (9 AM & 6 PM)
│   └── add_verified_tools.py    # Direct dataset merger script
├── index.html                   # Responsive frontend interface
├── css/
│   └── style.css                # Dark cybernetic theme & animations
├── js/
│   ├── data.js                  # Dynamic AI tools registry (46+ live apps)
│   └── script.js                # Neural canvas, live filtering, comparison & inspector
├── README.md                    # Documentation
└── .gitignore                   # Ignored files
```
