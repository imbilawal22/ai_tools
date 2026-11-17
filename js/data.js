// Mindora AI - Evolving AI Tools Ecosystem Dataset
// Automatically updated via Mindora AI Research Pipeline powered by Gemini API
// Total Tools Cataloged: 8

let AI_TOOLS_DATA = [
  {
    "id": "deepseek-r1",
    "name": "DeepSeek R1",
    "category": "reasoning",
    "provider": "DeepSeek",
    "badge": "Frontier",
    "badgeType": "frontier",
    "tagline": "A massive leap in open-weights reasoning performance rivaling top-tier proprietary models.",
    "description": "DeepSeek R1 utilizes a large-scale reinforcement learning approach to achieve advanced chain-of-thought reasoning without extensive supervised fine-tuning. It demonstrates exceptional capabilities in complex mathematical problem solving and logical deduction, setting a new benchmark for open-weights efficiency.",
    "releaseYear": "2025",
    "contextWindow": "128k Tokens",
    "openSource": true,
    "pricing": "Open Weights / API",
    "modalities": [
      "Text",
      "Code"
    ],
    "metrics": {
      "reasoning": 98,
      "speed": 85,
      "costEfficiency": 95,
      "coding": 92
    },
    "useCases": [
      "Complex mathematical proofs",
      "Logical reasoning tasks",
      "Scientific research analysis"
    ],
    "website": "https://www.deepseek.com",
    "trending": true
  },
  {
    "id": "claude-3-7-sonnet",
    "name": "Claude 3.7 Sonnet",
    "category": "reasoning",
    "provider": "Anthropic",
    "badge": "Frontier",
    "badgeType": "frontier",
    "tagline": "The first hybrid reasoning model capable of toggling between instant and extended thinking.",
    "description": "Claude 3.7 Sonnet introduces a breakthrough 'extended thinking' mode that allows the model to deliberate on complex tasks before responding. It provides unparalleled nuance and accuracy in high-stakes reasoning while maintaining the speed of a standard LLM for simpler queries.",
    "releaseYear": "2025",
    "contextWindow": "200k Tokens",
    "openSource": false,
    "pricing": "Commercial API / Subscription",
    "modalities": [
      "Text",
      "Code",
      "Vision"
    ],
    "metrics": {
      "reasoning": 99,
      "speed": 90,
      "costEfficiency": 80,
      "coding": 97
    },
    "useCases": [
      "Strategic planning",
      "Advanced coding architecture",
      "Legal document analysis"
    ],
    "website": "https://www.anthropic.com",
    "trending": true
  },
  {
    "id": "cursor",
    "name": "Cursor",
    "category": "coding",
    "provider": "Cursor AI",
    "badge": "Agentic",
    "badgeType": "agentic",
    "tagline": "The AI-native code editor that treats your entire codebase as context.",
    "description": "Cursor integrates frontier models directly into the IDE, enabling 'Composer' mode to write, edit, and refactor entire files simultaneously. It leverages deep codebase indexing to provide context-aware suggestions that far exceed standard autocomplete tools.",
    "releaseYear": "2024",
    "contextWindow": "1M Tokens",
    "openSource": false,
    "pricing": "Free Tier / Subscription",
    "modalities": [
      "Code",
      "Text"
    ],
    "metrics": {
      "reasoning": 90,
      "speed": 95,
      "costEfficiency": 85,
      "coding": 100
    },
    "useCases": [
      "Full-stack application development",
      "Codebase refactoring",
      "Debugging complex systems"
    ],
    "website": "https://cursor.com",
    "trending": true
  },
  {
    "id": "kling-ai",
    "name": "Kling AI",
    "category": "creative",
    "provider": "Kuaishou",
    "badge": "Video Engine",
    "badgeType": "creative",
    "tagline": "High-fidelity, long-duration video generation with realistic physics.",
    "description": "Kling AI utilizes a 3D spatiotemporal attention mechanism to generate videos up to 2 minutes long with consistent character movement and realistic physical interactions. It represents a significant advancement in temporal coherence for generative video models.",
    "releaseYear": "2024",
    "contextWindow": "Video Stream",
    "openSource": false,
    "pricing": "Freemium",
    "modalities": [
      "Video",
      "Text"
    ],
    "metrics": {
      "reasoning": 70,
      "speed": 75,
      "costEfficiency": 80,
      "coding": 60
    },
    "useCases": [
      "Cinematic content creation",
      "Marketing video production",
      "Storyboarding"
    ],
    "website": "https://klingai.com",
    "trending": true
  },
  {
    "id": "hume-evi-2",
    "name": "Hume EVI 2",
    "category": "voice",
    "provider": "Hume AI",
    "badge": "Realtime Voice",
    "badgeType": "voice",
    "tagline": "The first empathetic voice interface that understands vocal prosody and emotion.",
    "description": "Hume EVI 2 uses a proprietary Empathic Voice Interface that analyzes the tone, pitch, and cadence of speech to interpret user intent beyond literal text. This allows for fluid, human-like conversations that adapt to the user's emotional state in real-time.",
    "releaseYear": "2025",
    "contextWindow": "Audio Stream",
    "openSource": false,
    "pricing": "Commercial API",
    "modalities": [
      "Audio",
      "Text"
    ],
    "metrics": {
      "reasoning": 85,
      "speed": 98,
      "costEfficiency": 75,
      "coding": 65
    },
    "useCases": [
      "Customer support automation",
      "Mental health coaching",
      "Interactive gaming NPCs"
    ],
    "website": "https://hume.ai",
    "trending": true
  },
  {
    "id": "notebooklm",
    "name": "NotebookLM",
    "category": "research",
    "provider": "Google",
    "badge": "Frontier",
    "badgeType": "frontier",
    "tagline": "Transforming documents into interactive, audio-first knowledge hubs.",
    "description": "NotebookLM uses RAG (Retrieval-Augmented Generation) to ground AI responses exclusively in your uploaded source materials. Its 'Audio Overview' feature generates natural-sounding podcast-style discussions that synthesize complex research papers and documents.",
    "releaseYear": "2024",
    "contextWindow": "50 Sources / 25M Tokens",
    "openSource": false,
    "pricing": "Free",
    "modalities": [
      "Text",
      "Audio",
      "PDF"
    ],
    "metrics": {
      "reasoning": 88,
      "speed": 80,
      "costEfficiency": 100,
      "coding": 60
    },
    "useCases": [
      "Academic research synthesis",
      "Corporate knowledge management",
      "Personal learning"
    ],
    "website": "https://notebooklm.google.com",
    "trending": true
  },
  {
    "id": "ollama",
    "name": "Ollama",
    "category": "opensource",
    "provider": "Community",
    "badge": "Open Weights",
    "badgeType": "open",
    "tagline": "The standard for running high-performance LLMs locally on consumer hardware.",
    "description": "Ollama simplifies the deployment of open-source models like Llama 3.3 and Mistral by managing dependencies and hardware acceleration automatically. It has become the foundational layer for local AI development and private inference.",
    "releaseYear": "2024",
    "contextWindow": "Hardware Dependent",
    "openSource": true,
    "pricing": "Free",
    "modalities": [
      "Text",
      "Code",
      "Vision"
    ],
    "metrics": {
      "reasoning": 80,
      "speed": 90,
      "costEfficiency": 100,
      "coding": 80
    },
    "useCases": [
      "Private local inference",
      "Offline AI development",
      "Edge computing"
    ],
    "website": "https://ollama.com",
    "trending": true
  },
  {
    "id": "flux-1-1-pro",
    "name": "FLUX.1.1 Pro",
    "category": "creative",
    "provider": "Black Forest Labs",
    "badge": "Frontier",
    "badgeType": "creative",
    "tagline": "State-of-the-art image generation with unmatched prompt adherence and text rendering.",
    "description": "FLUX.1.1 Pro utilizes a rectified flow transformer architecture to deliver superior image quality and prompt fidelity compared to previous diffusion models. It excels at rendering complex text within images and maintaining consistent anatomical accuracy.",
    "releaseYear": "2024",
    "contextWindow": "N/A",
    "openSource": false,
    "pricing": "Commercial API",
    "modalities": [
      "Image",
      "Text"
    ],
    "metrics": {
      "reasoning": 65,
      "speed": 85,
      "costEfficiency": 75,
      "coding": 60
    },
    "useCases": [
      "Graphic design",
      "Asset generation for games",
      "High-end photography synthesis"
    ],
    "website": "https://blackforestlabs.ai",
    "trending": true
  }
];

// Available Categories for new tools
const AI_CATEGORIES = [
  { id: "all", name: "All Tools" },
  { id: "reasoning", name: "Reasoning & Frontier" },
  { id: "coding", name: "Agentic Engineering" },
  { id: "creative", name: "Generative Vision & Video" },
  { id: "voice", name: "Voice & Multimodal" },
  { id: "research", name: "Research & Knowledge" },
  { id: "opensource", name: "Open Source & Local" }
];
