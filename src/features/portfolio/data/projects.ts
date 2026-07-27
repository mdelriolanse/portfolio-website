import type { Project } from "../types/projects"

export const PROJECTS: Project[] = [
  {
    id: "dispatch",
    title: "Dispatch",
    period: {
      start: "02.2026",
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
- Orchestrates security agents using Mastra and OpenRouter, with isolated execution via Blaxel Sandboxes
- Slackbot and Datadog middleware for triggering scans and ingesting logs to surface findings
- Converts raw scan output into reviewable, mergeable remediation PRs
`,
    isExpanded: true,
  },
  {
    id: "open-weight-open-risk",
    title: "Open Weight, Open Risk",
    period: {
      start: "10.2025",
    },
    link: "https://aochong-li.github.io/open-weight-open-risk/",
    skills: [
      "Python",
      "vLLM",
      "SGLang",
      "LLM Safety",
      "Red Teaming",
      "Evaluation",
      "Research",
    ],
    description: `Training-free jailbreak in which an uncensored model steers the target's chain-of-thought. / [Publication](https://aochong-li.github.io/open-weight-open-risk/) · [Source](https://github.com/Aochong-Li/open-weight-open-risk)
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
    description: `Moderated, unbiased debate platform built on organized layouts and AI summaries. / [Source](https://github.com/mdelriolanse/Debately)
- Fact-checking pipelines with web data normalization, preventing hallucinations in consensus
- LLM-driven consensus tracker built on the Anthropic API, Supabase, and Vercel/Railway
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
    description: `PyTorch interface with automatic optimization and profiling, built to cut boilerplate in ML research. / [Source](https://github.com/mdelriolanse/tensor-atelier)
- Pluggable architecture with configurable multi-accelerator support
- Automatic data splitting and built-in profiling hooks
`,
  },
]
