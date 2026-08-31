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
    description: `- Bachelor of Science in Electrical & Computer Engineering, GPA 3.75 / 4.00. Expected graduation: December 2028.
- Coursework: CS 4414 (Systems Programming), ECE 3140 (Embedded Systems), ECE 2300 (Digital Logic and Computer Organization), MATH 2940, PHYS 2213, MATH 2930.`,
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
