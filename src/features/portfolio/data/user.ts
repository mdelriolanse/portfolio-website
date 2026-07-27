import type { User } from "@/features/portfolio/types/user"

export const USER: User = {
  firstName: "Mateo",
  lastName: "del Rio Lanse",
  displayName: "Mateo del Rio Lanse",
  username: "mdelriolanse",
  // TODO: set these to what you actually use — they feed the vCard and JSON-LD.
  gender: "male",
  pronouns: "he/him",
  bio: "Building AI infrastructure, and probing where it breaks.",
  flipSentences: [
    "Building AI infrastructure, and probing where it breaks.",
    "ECE @ Cornell.",
    "LLM safety researcher.",
    "Software engineer.",
  ],
  address: "Ithaca, New York",
  // Left blank on purpose: a number on a résumé is not the same as a number on
  // a public page. To publish it, base64-encode E.164 (+19147582446).
  phoneNumberB64: "",
  emailB64: "bWQyMjkyQGNvcm5lbGwuZWR1", // md2292@cornell.edu
  website: "https://mdelriolanse.com",
  jobTitle: "Software Engineering Intern",
  jobs: [
    {
      title: "Software Engineering Intern",
      company: "Options Technology",
      website: "https://www.options-it.com",
      experienceId: "options-technology",
    },
    {
      title: "Engineering Manager & ML Engineer",
      company: "Generative AI at Cornell",
      website: "https://www.gencornell.com",
      experienceId: "cornell",
    },
  ],
  about: `- I’m Mateo — an Electrical & Computer Engineering student at Cornell, working on the infrastructure that serves large models and the research that stress-tests them.
- At [Options Technology](https://www.options-it.com) I build PrivateMind, private AI infrastructure serving open-weight models on B300/B200 GPUs across colocated data centers in New York and London.
- At the [Cornell NLP Group](https://nlp.cornell.edu) I work on LLM safety alignment, evaluating frontier models under adversarial prompting.
- Author of [Open Weight, Open Risk](https://aochong-li.github.io/open-weight-open-risk/), a training-free jailbreak that steers a target model’s chain-of-thought, and [Dispatch](https://dispatch-eosin.vercel.app/), an agentic pentesting platform that won Best Developer Tool at the 2026 Cornell AI Hackathon.
`,
  // TODO: replace with your own images (see /public). The upstream avatar-lights
  // effect wants a matched set: light/dark × on/off.
  avatar: "/avatar.webp",
  avatarVariants: {
    lightOff: "/avatar-light-off.webp",
    lightOn: "/avatar-light-on.webp",
    darkOff: "/avatar-dark-off.webp",
    darkOn: "/avatar-dark-on.webp",
  },
  ogImage: "/og-image.png",
  namePronunciationUrl: "",
  timeZone: "America/New_York",
  keywords: [
    "mdelriolanse",
    "mateo del rio lanse",
    "mateo del rio",
    "cornell ece",
    "llm safety",
    "ai infrastructure",
  ],
  dateCreated: "2026-07-26", // YYYY-MM-DD
}
