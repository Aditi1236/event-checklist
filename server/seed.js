import { connectDB, getEventsCollection } from "./db.js";

let counter = 0;
function genId(prefix) {
  return `${prefix}_${(Date.now() + counter++).toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const now = Date.now();

/* ──────────────────────────────────────────────────────
   Official Club Events & Bootcamps seed data
   ────────────────────────────────────────────────────── */
const seedEvents = [
  // ── 1. Frontend Fundamentals & Awareness Session ──
  {
    id: genId("evt"),
    name: "Frontend Fundamentals & Awareness Session: Real-World Perspective",
    type: "event",
    date: "2026-07-23",
    endDate: "",
    duration: "1 day",
    category: "Awareness session",
    description:
      "Intro session giving clarity on modern frontend workflows, how real-world web interfaces function, and initial exposure to building and showcasing practical projects.",
    location: "N/A",
    mode: "",
    capacity: 0,
    techStack: "",
    budget: 0,
    registrations: 0,
    teamMembers: "",
    speakers: "Senior Developers, Alumni Mentors",
    collaborators: "",
    learningOutcomes:
      "Understand modern frontend workflows\nLearn how real-world web interfaces function\nGet initial exposure to building and showcasing practical projects",
    studentBenefits:
      "Clarity on frontend development career path\nHands-on exposure to real-world projects\nGuidance from senior developers and alumni mentors",
    targetAudience: "All club members and interested students",
    prerequisites: "None — open to all beginners",
    registrationLink: "",
    highlights:
      "Real-world perspective on frontend\nPractical project exposure\nMentor guidance from industry professionals",
    tasks: [],
    createdAt: now + 1,
  },

  // ── 2. BuildLab: Frontend Development Cohort ──
  {
    id: genId("evt"),
    name: "BuildLab: Frontend Development Cohort",
    type: "bootcamp",
    date: "2026-07-30",
    endDate: "2026-08-31",
    duration: "~5 weeks (multi-session cohort)",
    category: "Cohort / training program",
    description:
      "Structured progression from fundamentals to building responsive, interactive web apps via hands-on challenges and mini contests; builds deployable projects and hackathon-ready portfolio.",
    location: "N/A",
    mode: "",
    capacity: 0,
    techStack: "HTML, CSS, JavaScript, React, Bootstrap",
    budget: 0,
    registrations: 0,
    teamMembers: "",
    speakers: "Senior Developers, Alumni Mentors",
    collaborators: "",
    learningOutcomes:
      "Master frontend fundamentals to advanced concepts\nBuild responsive, interactive web apps\nCreate deployable projects for your portfolio\nParticipate in hands-on challenges and mini contests",
    studentBenefits:
      "Hackathon-ready portfolio\nHands-on experience with real-world challenges\nStructured learning progression\nMentorship from senior developers and alumni",
    targetAudience: "Club members committed to a 5-week cohort",
    prerequisites: "Basic computer literacy; no prior coding experience required",
    registrationLink: "",
    highlights:
      "5-week structured cohort\nHands-on challenges and mini contests\nPortfolio development\nHackathon preparation",
    tasks: [],
    createdAt: now + 2,
  },

  // ── 3. Frontend Roulette: Creative Web Challenge ──
  {
    id: genId("evt"),
    name: "Frontend Roulette: Creative Web Challenge",
    type: "event",
    date: "2026-08-10",
    endDate: "",

  // ── 4. NexaBuild: The 36-Hour Product Challenge ──
  {
    id: genId("evt"),
    name: "NexaBuild: The 36-Hour Product Challenge",
    type: "event",
    date: "2026-09-24",
    endDate: "2026-09-25",
    duration: "36 hours",
    category: "Hackathon",
    description:
      "Competitive, time-constrained hackathon building functional real-world solutions; enhances teamwork and rapid development ability.",
    location: "N/A",
    mode: "",
    capacity: 0,
    techStack: "React, Node.js, MongoDB, Any preferred stack",
    budget: 150000,
    registrations: 0,
    teamMembers: "",
    speakers: "",
    collaborators: "Internal Panel, External Judges, Startup Founders",
    learningOutcomes:
      "Build functional real-world solutions under time constraints\nEnhance teamwork and rapid development skills\nExperience competitive hackathon environment",
    studentBenefits:
      "Interaction with industry judges and startup founders\nTeam collaboration experience\nReal-world product development exposure\nHackathon experience for resume",
    targetAudience: "All club members and students interested in product development",
    prerequisites: "Frontend development basics; team registration required",
    registrationLink: "",
    highlights:
      "36-hour time-constrained hackathon\nReal-world functional solutions\nJudged by industry experts and startup founders\nTeam-based competition",
    tasks: [],
    createdAt: now + 4,
  },

  // ── 5. BuildSprint: Frontend Product Challenge ──
  {
    id: genId("evt"),
    name: "BuildSprint: Frontend Product Challenge",
    type: "event",
    date: "2026-10-06",
    endDate: "",
    duration: "1 day",
    category: "Competition",
    description:

  // ── M2M – BuildLab Cohort Schedule (sub-events of BuildLab) ──

  // ── 6. WebVerse: Foundations of Modern Web Development ──
  {
    id: genId("evt"),
    name: "WebVerse: Foundations of Modern Web Development",
    type: "bootcamp",
    date: "2026-07-30",
    endDate: "",
    duration: "1 session",
    category: "Workshop",
    description:
      "Foundations of web dev — webpage structure, styling concepts, how frontend technologies work together. Part of the BuildLab: Frontend Development Cohort.",
    location: "N/A",
    mode: "",
    capacity: 0,
    techStack: "HTML, CSS",
    budget: 0,
    registrations: 0,
    teamMembers: "",
    speakers: "Mr. Ayush Negi, Mr. Sumanshu Jindal",
    collaborators: "",
    learningOutcomes:
      "Understand webpage structure and styling concepts\nLearn how frontend technologies work together\nBuild a strong foundation in modern web development",
    studentBenefits:
      "Strong foundation in web development\nHands-on understanding of frontend technologies",
    targetAudience: "BuildLab cohort participants",
    prerequisites: "None — first session of the cohort",
    registrationLink: "",
    highlights:
      "Foundational web development concepts\nHands-on HTML and CSS\nExpert-led instruction",
    tasks: [],
    createdAt: now + 6,
  },

  // ── 7. CodeFlow JS: JavaScript Essentials Bootcamp ──
  {
    id: genId("evt"),
    name: "CodeFlow JS: JavaScript Essentials Bootcamp",
    type: "bootcamp",
    date: "2026-08-06",
    endDate: "",

  // ── 8. PixelCraft: Advanced CSS & UI Systems ──
  {
    id: genId("evt"),
    name: "PixelCraft: Advanced CSS & UI Systems",
    type: "bootcamp",
    date: "2026-08-13",
    endDate: "",
    duration: "1 session",
    category: "Workshop",
    description:
      "Responsive layouts, Flexbox, Grid, animations, modern UI practices for visually appealing interfaces. Part of the BuildLab: Frontend Development Cohort.",
    location: "N/A",
    mode: "",
    capacity: 0,
    techStack: "CSS, Flexbox, Grid, Animations",
    budget: 0,
    registrations: 0,
    teamMembers: "",
    speakers: "Mr. Sumanshu Jindal, Alumni Mentors",
    collaborators: "",
    learningOutcomes:
      "Master responsive layouts with Flexbox and Grid\nCreate animations for modern interfaces\nLearn modern UI practices for visually appealing designs",
    studentBenefits:
      "Advanced CSS skills for professional UI development\nPortfolio-worthy design capabilities",
    targetAudience: "BuildLab cohort participants",
    prerequisites: "Completion of WebVerse session (or basic CSS knowledge)",
    registrationLink: "",
    highlights:
      "Advanced CSS techniques\nFlexbox and Grid mastery\nAnimation and modern UI practices",
    tasks: [],
    createdAt: now + 8,
  },

  // ── 9. AIFront: Frontend AI Tools & Bootstrap Mastery ──
  {
    id: genId("evt"),
    name: "AIFront: Frontend AI Tools & Bootstrap Mastery",
    type: "bootcamp",
    date: "2026-08-20",
    endDate: "",
    duration: "1 session",

  // ── 10. PortfolioForge: Portfolio Building & Freelance Toolkit ──
  {
    id: genId("evt"),
    name: "PortfolioForge: Portfolio Building & Freelance Toolkit",
    type: "bootcamp",
    date: "2026-08-27",
    endDate: "",
    duration: "1 session",
    category: "Workshop",
    description:
      "Portfolio development, GitHub showcasing, personal branding, freelance basics for internships/hackathons. Part of the BuildLab: Frontend Development Cohort.",
    location: "N/A",
    mode: "",
    capacity: 0,
    techStack: "GitHub, Personal Branding",
    budget: 0,
    registrations: 0,
    teamMembers: "",
    speakers: "Mr. Sumanshu Jindal, Alumni Mentors",
    collaborators: "",
    learningOutcomes:
      "Build a professional portfolio\nLearn GitHub showcasing and personal branding\nUnderstand freelance basics for internships and hackathons",
    studentBenefits:
      "Professional portfolio for job applications\nPersonal branding skills\nFreelance readiness",
    targetAudience: "BuildLab cohort participants",
    prerequisites: "Completion of prior cohort sessions; projects to showcase",
    registrationLink: "",
    highlights:
      "Portfolio development\nGitHub showcasing\nPersonal branding and freelance toolkit",
    tasks: [],
    createdAt: now + 10,
  },
];

/* ──────────────────────────────────────────────────────
   Seed runner — works with MongoDB AND JSON-file fallback
   ────────────────────────────────────────────────────── */
async function seed() {
  await connectDB();
  const events = getEventsCollection();

  // Check for existing events by name to avoid duplicates
  const existing = await events.find({}).toArray();
  const existingNames = new Set(existing.map((e) => e.name));

  const newEvents = seedEvents.filter((e) => !existingNames.has(e.name));

  if (newEvents.length === 0) {
    console.log("All club events already exist in the database.");
    console.log(`Total events in store: ${existing.length}`);
    return;
  }

  await events.insertMany(newEvents);
  console.log(`Successfully seeded ${newEvents.length} club events/bootcamps:`);
  newEvents.forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.name}  [${e.type} - ${e.category}]`);
  });
  console.log(`Total events in store: ${existing.length + newEvents.length}`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
    category: "Workshop",
    description:
      "Bootstrap framework, AI-assisted frontend tools, rapid UI development, efficient workflows. Part of the BuildLab: Frontend Development Cohort.",
    location: "N/A",
    mode: "",
    capacity: 0,
    techStack: "Bootstrap, AI Tools, HTML, CSS",
    budget: 0,
    registrations: 0,
    teamMembers: "",
    speakers: "Mr. Ayush Negi, Senior Developers",
    collaborators: "",
    learningOutcomes:
      "Master Bootstrap framework for rapid UI development\nLearn AI-assisted frontend tools\nDevelop efficient development workflows",
    studentBenefits:
      "Rapid UI development skills\nAI tool proficiency for modern development",
    targetAudience: "BuildLab cohort participants",
    prerequisites: "Completion of prior cohort sessions (or working HTML/CSS/JS knowledge)",
    registrationLink: "",
    highlights:
      "Bootstrap framework mastery\nAI-assisted development tools\nEfficient workflow training",
    tasks: [],
    createdAt: now + 9,
  },
    duration: "1 session",
    category: "Bootcamp",
    description:
      "JS fundamentals — variables, functions, events, DOM manipulation for interactive experiences and problem-solving. Part of the BuildLab: Frontend Development Cohort.",
    location: "N/A",
    mode: "",
    capacity: 0,
    techStack: "JavaScript, HTML, CSS",
    budget: 0,
    registrations: 0,
    teamMembers: "",
    speakers: "Mr. Ayush Negi, Senior Developers, Alumni Mentors",
    collaborators: "",
    learningOutcomes:
      "Master JavaScript variables, functions, and events\nLearn DOM manipulation for interactive experiences\nDevelop problem-solving skills with JS",
    studentBenefits:
      "Core JavaScript skills for frontend development\nInteractive web experience creation",
    targetAudience: "BuildLab cohort participants",
    prerequisites: "Completion of WebVerse session (or basic HTML/CSS knowledge)",
    registrationLink: "",
    highlights:
      "JavaScript essentials bootcamp\nDOM manipulation hands-on\nInteractive experience building",
    tasks: [],
    createdAt: now + 7,
  },
      "Rapid product-building competition focused on innovative web solutions, UI/UX thinking, teamwork, and real-world execution.",
    location: "N/A",
    mode: "",
    capacity: 0,
    techStack: "HTML, CSS, JavaScript, React, Tailwind CSS",
    budget: 25000,
    registrations: 0,
    teamMembers: "",
    speakers: "",
    collaborators: "TBD",
    learningOutcomes:
      "Practice rapid product-building methodologies\nDevelop UI/UX thinking and teamwork skills\nExecute innovative web solutions under pressure",
    studentBenefits:
      "Competitive product-building experience\nPortfolio enhancement\nReal-world execution skills",
    targetAudience: "All club members and frontend developers",
    prerequisites: "HTML, CSS, JavaScript; familiarity with any frontend framework",
    registrationLink: "",
    highlights:
      "Rapid product-building\nFocus on UI/UX thinking\nTeamwork and real-world execution",
    tasks: [],
    createdAt: now + 5,
  },
    duration: "1 day",
    category: "Competition",
    description:
      "Innovation-driven competition with randomized UI/UX constraints — tests responsive design, creativity, accessibility, and rapid implementation.",
    location: "N/A",
    mode: "",
    capacity: 0,
    techStack: "HTML, CSS, JavaScript, React",
    budget: 25000,
    registrations: 0,
    teamMembers: "",
    speakers: "",
    collaborators: "TBD",
    learningOutcomes:
      "Practice responsive design under randomized constraints\nImprove creativity and rapid implementation skills\nLearn to work with unpredictable UI/UX requirements",
    studentBenefits:
      "Competitive experience under pressure\nPortfolio-worthy creative projects\nExposure to accessibility and design thinking",
    targetAudience: "All club members and frontend enthusiasts",
    prerequisites: "Basic HTML, CSS, and JavaScript knowledge",
    registrationLink: "",
    highlights:
      "Randomized UI/UX constraints\nTests creativity and rapid implementation\nFocus on accessibility",
    tasks: [],
    createdAt: now + 3,
  },
];
