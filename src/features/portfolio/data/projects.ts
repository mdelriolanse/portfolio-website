import type { Project } from "../types/projects"

export const PROJECTS: Project[] = [
  {
    id: "marko",
    title: "Marko",
    period: {
      start: "10.2026",
      end: "10.2026",
    },
    link: "https://get-marko.vercel.app",
    skills: [
      "Swift",
      "ARKit",
      "PyTorch",
      "RoMa",
      "Open3D",
      "RunPod",
      "ElevenLabs",
    ],
    description: `Indoor AR navigation app piloted on a multi-story Cornell academic building. / 2nd Place — MLH Big Red Hacks 2026 · [Write-up](/blog/marko)
- Mapped a multi-story Cornell academic building for routing (Swift, ARKit)
- Solved indoor positioning, where GPS is unreliable, with quick, precise localization from what the camera sees and no beacons or routers, via PyTorch/RoMa and Open3D on RunPod GPUs; added an ElevenLabs voice agent
`,
    isExpanded: true,
  },
  {
    id: "groundwork",
    title: "Groundwork",
    period: {
      start: "09.2026",
      end: "09.2026",
    },
    link: "https://get-groundwork.vercel.app",
    skills: [
      "Qwen3.6-35B-A3B",
      "llama.cpp",
      "OpenShell",
      "NemoClaw",
      "MCP",
      "SQLite",
      "Node.js",
      "Python",
    ],
    description: `On-premises AI maintenance agent that turns machinery fault signals into cited, verified work orders. / 2nd Place — Dell × NVIDIA AI Hackathon at Cornell 2026 · [Write-up](/blog/groundwork) · [Source](https://github.com/mdelriolanse/groundwork)
- Co-built the agent loop that turns fault signals into cited, verified work orders
- Served Qwen3.6-35B-A3B via llama.cpp on Grace Blackwell inside OpenShell; its egress policy denied exfiltration
`,
    isExpanded: true,
  },
  {
    id: "dispatch",
    title: "Dispatch",
    period: {
      start: "03.2026",
    },
    link: "https://dispatch-eosin.vercel.app/",
    skills: [
      "TypeScript",
      "Mastra",
      "OpenRouter",
      "Blaxel Sandboxes",
      "Datadog",
      "Slack API",
      "Agentic Systems",
      "Security",
    ],
    description: `Agentic penetration testing platform that turns vulnerability findings into ready-to-merge GitHub PRs. / Best Developer Tool — [Cornell AI Hackathon 2026](https://github.com/Arsh-S/Dispatch)
- Built the backend of a multi-agent security platform: an orchestrator agent reads the target codebase (routes, auth logic, raw SQL), plans targeted attacks, and dispatches pentester workers into isolated Blaxel sandboxes
- Closed the loop from finding to fix: content-hash IDs deduplicate findings, constructor workers patch code and open GitHub PRs, and an Express REST API plus Slack/Linear/GitHub integrations trigger fixes and ticket findings
`,
    isExpanded: true,
  },
  {
    id: "open-weight-open-risk",
    title: "Open Weight, Open Risk",
    period: {
      start: "10.2025",
    },
    link: "https://www.aochongoliverli.com/open-weight-open-risk/",
    skills: [
      "Python",
      "vLLM",
      "SGLang",
      "LLM Safety",
      "Red Teaming",
      "Evaluation",
      "Research",
    ],
    description: `Training-free jailbreak in which an uncensored model steers the target's chain-of-thought. / [Publication](https://www.aochongoliverli.com/open-weight-open-risk/)
- Achieves near-universal compliance across open-weight models (DeepSeek, Kimi, GLM, Qwen)
- Iterative prompt injection and LLM-as-judge pipelines to streamline evaluation
- Evaluated 15 frontier models across 800 WMDP-derived biosecurity and chemical security requests
`,
    isExpanded: true,
  },
  {
    id: "debately",
    title: "Debately",
    period: {
      start: "05.2025",
    },
    link: "https://debately-delta.vercel.app/",
    skills: [
      "TypeScript",
      "React",
      "Anthropic API",
      "Supabase",
      "Vercel",
      "Railway",
    ],
    description: `Moderated, unbiased debate platform with organized layouts and AI summaries. / [Source](https://github.com/mdelriolanse/Debately)
- Engineered web-data fact-checking pipelines to prevent hallucinations and an LLM consensus tracker (Anthropic API)
`,
  },
  {
    id: "tensor-atelier",
    title: "TensorAtelier",
    period: {
      start: "01.2025",
    },
    link: "https://github.com/mdelriolanse/tensor-atelier",
    skills: ["Python", "PyTorch", "CUDA", "Profiling", "ML Infrastructure"],
    description: `Pluggable PyTorch interface with automatic optimization/profiling and configurable multi-accelerator support, reducing boilerplate in ML research. / [Source](https://github.com/mdelriolanse/tensor-atelier)
`,
  },
]
