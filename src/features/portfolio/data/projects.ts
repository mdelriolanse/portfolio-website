import {
  CpuIcon,
  MessagesSquareIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
} from "lucide-react"

import type { Project } from "../types/projects"

export const PROJECTS: Project[] = [
  {
    id: "dispatch",
    title: "Dispatch",
    icon: ShieldCheckIcon,
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
- Orchestrated security agents using Mastra and OpenRouter, with isolated execution via Blaxel Sandboxes
- Designed Slackbot and Datadog middleware for triggering scans and ingesting logs to surface findings
`,
    isExpanded: true,
  },
  {
    id: "open-weight-open-risk",
    title: "Open Weight, Open Risk",
    icon: ShieldOffIcon,
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
    icon: MessagesSquareIcon,
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
    description: `Moderated debate platform with fact-checking pipelines and an LLM-driven consensus tracker (Anthropic API, Supabase, Vercel/Railway). / [Source](https://github.com/mdelriolanse/Debately)
- Engineered fact-checking pipelines with web data normalization, preventing hallucinations in consensus
`,
  },
  {
    id: "tensor-atelier",
    title: "TensorAtelier",
    icon: CpuIcon,
    period: {
      start: "01.2025",
    },
    link: "https://github.com/mdelriolanse/tensor-atelier",
    skills: ["Python", "PyTorch", "CUDA", "Profiling", "ML Infrastructure"],
    description: `Pluggable PyTorch interface with automatic optimization/profiling and configurable multi-accelerator support, reducing boilerplate in ML research. / [Source](https://github.com/mdelriolanse/tensor-atelier)
`,
  },
]
