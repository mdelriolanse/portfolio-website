import {
  BriefcaseBusinessIcon,
  CodeXmlIcon,
  FlaskConicalIcon,
  UsersIcon,
} from "lucide-react"

import type { Experience } from "@/features/portfolio/types/experiences"

export const EXPERIENCES: Experience[] = [
  {
    id: "options-technology",
    companyName: "Options Technology",
    companyWebsite: "https://www.options-it.com/",
    location: "New York, New York",
    locationType: "On-site",
    positions: [
      {
        id: "options-swe-intern",
        title: "Software Engineering Intern, PrivateMind Platform",
        employmentPeriod: {
          start: "06.2026",
          end: "08.2026",
        },
        employmentType: "Internship",
        icon: <CodeXmlIcon />,
        description: `- Owned and shipped an OpenAI-compatible REST Batch API end-to-end on cloud-native Kubernetes infrastructure: async GPU workers, exactly-once billing for consistency, DB schema, SDK, Helm deployment, ~7,000 lines of tests.
- Benchmarked frontier LLMs before production serving: Poisson-distributed concurrency sweeps measuring time-to-first-token, inter-token latency, and throughput at p50/p95/p99 across multi-GPU HGX deployments.
- Owned LLM inference gateway load management on NVIDIA B200/B300 GPUs: priority scheduling so batch cannot starve interactive chat, per-model streaming timeouts, and token-budget admission control on GPU memory pressure.
- Deployed a novel text-to-image model to production (GPU config, gateway routing, bounded concurrency, pricing, UI) and built the content-safety guardrail layer: a moderation API and an actionable error taxonomy for opaque refusals.
- Merged 133 PRs across 10 repos in Rust, TypeScript, Python, SQL, and Helm through GitHub Actions CI/CD, building distributed systems for scalability; unified two agent execution paths, deleting ~6,000 legacy lines.
- Shipped a nightly memory-consolidation engine, an automation builder driven by a backend tool-calling loop, chat streaming hardened against state bugs, and an inline co-editing canvas with conflict auto-resolution.`,
        skills: [
          "Linux",
          "Kubernetes",
          "OpenShift",
          "Helm",
          "vLLM",
          "SGLang",
          "GitHub Actions",
          "Rust",
          "TypeScript",
          "Python",
          "PostgreSQL",
        ],
        isExpanded: true,
      },
    ],
  },
  {
    id: "cornell",
    companyName: "Cornell University",
    companyWebsite: "https://www.cornell.edu",
    location: "Ithaca, New York",
    locationType: "On-site",
    positions: [
      {
        id: "cornell-genai",
        title: "Engineering Manager & ML Engineer, Generative AI at Cornell",
        employmentPeriod: {
          start: "10.2025",
          end: "05.2026",
        },
        employmentType: "Part-time",
        icon: <UsersIcon />,
        description: `- Led an 8-person team on full-stack development of an ESG risk monitoring platform for Investcorp ($60B+ AUM).
- Built a vendor due-diligence agentic data pipeline with fintech company QuickFi, reconciling vendor data from filings.`,
        skills: [
          "TypeScript",
          "Python",
          "Agentic Pipelines",
          "Engineering Management",
        ],
        isExpanded: true,
      },
      {
        id: "cornell-nlp",
        title: "AI Alignment Undergraduate Researcher, Cornell NLP Group",
        employmentPeriod: {
          start: "10.2025",
          end: "05.2026",
        },
        employmentType: "Part-time",
        icon: <FlaskConicalIcon />,
        description: `- Built the AI security evaluation pipeline behind "[Open Weight, Open Risk](https://www.aochongoliverli.com/open-weight-open-risk)" (co-author): 15 frontier open-weight LLMs across 800 WMDP-derived adversarial bio/chem requests, run locally on B200-class GPUs with vLLM and SGLang.
- Co-designed the training-free inception attack: a small uncensored 7B architect model pivots target reasoning, lifting compliance from ~10% to >95% in 5 iterations, exposing shallow alignment in open-weight reasoning models.`,
        skills: ["Python", "vLLM", "SGLang", "LLM Safety", "Evaluation"],
        isExpanded: true,
      },
    ],
  },
  {
    id: "hss",
    companyName: "Hospital for Special Surgery",
    companyWebsite: "https://www.hss.edu",
    location: "New York, New York",
    locationType: "On-site",
    positions: [
      {
        id: "hss-ml-intern",
        title: "Machine Learning Research Intern",
        employmentPeriod: {
          start: "06.2024",
          end: "08.2024",
        },
        employmentType: "Internship",
        icon: <BriefcaseBusinessIcon />,
        description: `- Analyzed immunological datasets with Dr. Amit Lakhanpal (Pandas, NumPy, scikit-learn, PyTorch, TensorFlow, VAEs, t-SNE) to extract rheumatoid arthritis signatures; fine-tuned neural networks, generated ESM embeddings.`,
        skills: ["Python", "PyTorch", "TensorFlow", "scikit-learn", "ESM"],
      },
    ],
  },
]
