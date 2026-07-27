import type { Education } from "@/features/portfolio/types/education"

export const EDUCATION: Education[] = [
  {
    id: "cornell",
    school: "Cornell University, College of Engineering",
    degree: "B.S.",
    fieldOfStudy: "Electrical & Computer Engineering",
    period: {
      start: "08.2024",
      end: "12.2028",
    },
    description: `- Bachelor of Science in Electrical & Computer Engineering, GPA 3.75 / 4.00.
- Expected graduation: December 2028.
- Undergraduate Research Assistant, Cornell NLP Group — LLM safety alignment.
- Engineering Manager, Generative AI at Cornell.`,
    skills: [
      "C",
      "C++",
      "CUDA C++",
      "Python",
      "Rust",
      "Computer Architecture",
      "Machine Learning",
    ],
    isExpanded: true,
  },
]
