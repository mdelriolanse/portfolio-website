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
    companyWebsite: "https://www.options-it.com",
    location: "New York, New York",
    locationType: "On-site",
    positions: [
      {
        id: "options-swe-intern",
        title: "Software Engineering Intern, PrivateMind Platform",
        employmentPeriod: {
          start: "06.2026",
        },
        employmentType: "Internship",
        icon: <CodeXmlIcon />,
        description: `- Developing PrivateMind, Options IT's secure and private AI infrastructure for enterprise environments.
- Deploying distributed systems to serve open-weight models across NVIDIA B300/B200 GPU infrastructure.
- Leveraging data center colocation across major financial hubs New York and London to deliver low-latency compute while enforcing hardware-isolated, zero-trust boundaries for T1 financial institutions.`,
        skills: [
          "Kubernetes",
          "OpenShift",
          "vLLM",
          "SGLang",
          "CUDA C++",
          "Distributed Systems",
        ],
        isExpanded: true,
      },
    ],
    isCurrentEmployer: true,
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
        },
        employmentType: "Part-time",
        icon: <UsersIcon />,
        description: `- Led 8-person engineering team at Cornell in building an ESG risk monitoring platform for Investcorp's investment portfolio business, driving engineering efforts while coordinating with stakeholders worldwide (Feb. 2026 – May 2026).
- Implemented vendor due diligence agentic pipeline with fintech company QuickFi (Sept. 2025 – Dec. 2025).`,
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
        title: "Undergraduate Research Assistant, Cornell NLP Group",
        employmentPeriod: {
          start: "10.2025",
        },
        employmentType: "Part-time",
        icon: <FlaskConicalIcon />,
        description: `- Collaborated with a PhD researcher in Cornell NLP Group on LLM safety alignment.
- Engineered pipeline to evaluate safety-alignment across frontier models in adversarial prompt settings.
- Worked with B200-class GPUs to run LLMs locally, using tools like vLLM and SGLang.`,
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
        description: `- Collaborated with Dr. Amit Lakhanpal to analyze immunological datasets and extract clinical insights.
- Generated protein embeddings using Meta's ESM model to support rheumatoid arthritis treatment research.`,
        skills: ["Python", "ESM", "Protein Embeddings", "R"],
      },
    ],
  },
]
