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
        description: `- Owned and shipped an OpenAI-compatible Batch API end-to-end (async worker draining against GPU capacity, per-request billing, DB schema, SDK, Helm deployment), backed by ~7,000 lines of contract tests; integrated Pure Storage FlashBlade S3 results storage for large inference artifacts.
- Benchmarked frontier LLMs before production serving: Poisson-distributed concurrency sweeps measuring time-to-first-token, inter-token latency, end-to-end latency, pre-emption, and throughput at p50/p95/p99 across multi-GPU HGX deployments.
- Owned the gateway load-management layer (priority scheduling, per-model streaming timeouts/keepalive, per-key concurrency limits, token-budget admission control gating batch work on GPU memory pressure) on NVIDIA B200/B300 GPUs.
- Brought a novel text-to-image model through full production deployment (GPU configuration, gateway routing, bounded concurrency, per-image pricing, UI) and built the platform content-safety layer.
- Merged 133 PRs across 10 repos (Rust, TypeScript, Python, SQL, Helm); unified two divergent agent execution paths, deleting ~6,000 lines of legacy code.`,
        skills: [
          "Linux",
          "Kubernetes",
          "OpenShift",
          "Helm",
          "vLLM",
          "SGLang",
          "Pure Storage FlashBlade S3",
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
        description: `- Led an 8-person engineering team building an ESG risk monitoring platform for Investcorp ($60B+ AUM).
- Implemented a vendor due-diligence agentic pipeline with fintech company QuickFi.
- Collected vendor data from government websites, regulatory filings, and public databases; reconciled it into consolidated profiles and generated written due-diligence reports.`,
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
        description: `- Built the evaluation pipeline behind "[Open Weight, Open Risk](https://www.aochongoliverli.com/open-weight-open-risk)" (co-author): 15 frontier open-weight models across 800 WMDP-derived adversarial bio/chem requests, run locally on B200-class GPUs with vLLM and SGLang.
- Co-designed the training-free "inception" attack, in which a small uncensored 7B architect model pivots target reasoning and lifts compliance from a ~10% baseline to >95% under 5 iterations, exposing "shallow alignment" in open-weight reasoning models, with a PhD researcher at the Cornell NLP Group.`,
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
        description: `- Analyzed immunological datasets with Dr. Amit Lakhanpal and generated protein embeddings using Meta's ESM model to support rheumatoid arthritis treatment research.`,
        skills: ["Python", "ESM", "Protein Embeddings", "R"],
      },
    ],
  },
]
