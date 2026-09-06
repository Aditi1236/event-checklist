import {
  connectDB,
  getEventsCollection,
  ensureDefaultAdmin,
} from "./db.js";

const EVENTS = [
  {
    name: "Frontend Fundamentals & Awareness Session: Real-World Perspective",
    date: "",
    description: "An introductory session providing real-world perspectives on frontend development fundamentals and industry awareness.",
    location: "Main Auditorium",
    type: "event",
    mode: "offline",
    capacity: 100,
    budget: 3000,
    registrations: 0,
    teamMembers: "",
    techStack: "HTML, CSS, JavaScript",
  },
  {
    name: "BuildLab: Frontend Development Cohort",
    date: "",
    description: "A comprehensive frontend development cohort program covering modern tools, frameworks, and best practices.",
    location: "Tech Hub",
    type: "bootcamp",
    mode: "hybrid",
    capacity: 50,
    budget: 8000,
    registrations: 0,
    teamMembers: "",
    techStack: "React, Node.js, MongoDB",
  },
  {
    name: "Frontend Roulette: Creative Web Challenge",
    date: "",
    description: "A creative web challenge where participants build unique frontend solutions with randomized constraints.",
    location: "Online",
    type: "event",
    mode: "online",
    capacity: 75,
    budget: 2000,
    registrations: 0,
    teamMembers: "",
    techStack: "JavaScript, CSS, Creative Coding",
  },
  {
    name: "BuildSprint: Frontend Product Challenge",
    date: "",
    description: "An intensive sprint challenge to build a complete frontend product from concept to deployment.",
    location: "Innovation Lab",
    type: "event",
    mode: "offline",
    capacity: 60,
    budget: 5000,
    registrations: 0,
    teamMembers: "",
    techStack: "React, TypeScript, Tailwind",
  },
  {
    name: "NexaBuild: The 36-Hour Product Challenge",
    date: "",
    description: "A 36-hour hackathon-style product challenge where teams compete to build innovative frontend solutions.",
    location: "Main Campus",
    type: "event",
    mode: "offline",
    capacity: 120,
    budget: 10000,
    registrations: 0,
    teamMembers: "",
    techStack: "Full Stack, React, Next.js",
  },
  {
    name: "WebVerse: Foundations of Modern Web Development",
    date: "2026-07-30",
    description: "A comprehensive session covering the foundations of modern web development, from HTML/CSS basics to advanced JavaScript frameworks.",
    location: "Main Auditorium",
    type: "event",
    mode: "offline",
    capacity: 100,
    budget: 5000,
    registrations: 0,
    teamMembers: "",
    techStack: "HTML, CSS, JavaScript, React",
  },
  {
    name: "CodeFlow JS: JavaScript Essentials Bootcamp",
    date: "",
    description: "An intensive bootcamp focused on JavaScript essentials, covering ES6+, async programming, and modern development patterns.",
    location: "Online",
    type: "bootcamp",
    mode: "online",
    capacity: 50,
    budget: 3000,
    registrations: 0,
    teamMembers: "",
    techStack: "JavaScript, ES6, Node.js",
  },
  {
    name: "PixelCraft: Advanced CSS & UI Systems",
    date: "",
    description: "Master advanced CSS techniques and build scalable UI systems with modern design principles and animation libraries.",
    location: "Design Lab",
    type: "event",
    mode: "offline",
    capacity: 40,
    budget: 2500,
    registrations: 0,
    teamMembers: "",
    techStack: "CSS, Tailwind, Framer Motion",
  },
  {
    name: "AIFront: Frontend AI Tools & Bootstrap Mastery",
    date: "",
    description: "Explore the intersection of AI and frontend development, learning to integrate AI tools and master Bootstrap for rapid prototyping.",
    location: "Tech Hub",
    type: "event",
    mode: "hybrid",
    capacity: 60,
    budget: 4000,
    registrations: 0,
    teamMembers: "",
    techStack: "Bootstrap, AI Tools, React",
  },
  {
    name: "PortfolioForge: Portfolio Building & Freelance Toolkit",
    date: "",
    description: "Build a professional portfolio from scratch and learn the essential tools and strategies for a successful freelance career.",
    location: "Online",
    type: "bootcamp",
    mode: "online",
    capacity: 75,
    budget: 2000,
    registrations: 0,
    teamMembers: "",
    techStack: "Next.js, Vercel, Figma",
  },
];

async function seedEvents() {
  console.log("🌱 Seeding events...");
  
  await connectDB();
  await ensureDefaultAdmin();
  
  const events = getEventsCollection();
  
  // Clear all existing events first
  const deleteResult = await events.deleteMany({});
  console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing event(s)`);
  
  const newEvents = [];
  for (const evt of EVENTS) {
    const newEvent = {
      id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      ...evt,
      tasks: [],
      createdAt: Date.now(),
    };
    
    await events.insertOne(newEvent);
    newEvents.push(newEvent);
    console.log(`  ✅ Created: ${evt.name}`);
  }
  
  console.log(`\n🎉 Done! ${newEvents.length} event(s) created. Only your events are now in the system.`);
  console.log("   Log in as admin to view all events:");
  console.log("   📧 admin@nexasoul.com / 🔑 admin123");
  
  process.exit(0);
}

seedEvents().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});