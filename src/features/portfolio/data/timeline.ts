import type { TimelineMilestone } from "../types/timeline"

// Used only to render the age column beside each milestone on /timeline.
// TODO: set to your actual birth year — the résumé didn't state one, so this is
// a guess derived from an Aug. 2024 college start.
export const TIMELINE_BIRTH_YEAR = 2006

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    year: 2024,
    content:
      "Machine Learning Research Intern at Hospital for Special Surgery. Started B.S. Electrical & Computer Engineering at Cornell. 2nd Place in Computer Science, Regeneron WESEF.",
  },
  {
    year: 2025,
    content:
      "Joined the Cornell NLP Group as an Undergraduate Research Assistant, working on LLM safety alignment. Became Engineering Manager at Generative AI at Cornell. 2nd Place in Computer Science, Regeneron WESEF.",
  },
  {
    year: 2026,
    content:
      "Won Best Developer Tool at the Cornell AI Hackathon with Dispatch. Published Open Weight, Open Risk. Joined Options Technology as a Software Engineering Intern on the PrivateMind platform.",
  },
  { year: 2027 },
  {
    year: 2028,
    content: "Expected graduation from Cornell.",
  },
]
