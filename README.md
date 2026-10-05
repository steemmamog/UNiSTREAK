# UNiSTREAK 🔥

> **"Snapchat, but for studying."**  
> A gamified study web application designed for University of Lagos (UNILAG) students to build consistent daily study habits through game mechanics, persistent anti-cheat session tracking, and social accountability.

---

## ⚡ Key Features

- **⏱️ Study Session Tracking**: 
  - **Timer Mode**: Fixed upfront duration (minimum 30 min) with server-clock verification that survives phone locking, browser backgrounding, and sleep.
  - **Stopwatch Mode**: Open-ended study tracking with periodic liveness heartbeats and a 5-minute reconnect grace window.
- **🔥 Streaks & Freeze Ledger**: WAT-aligned (West Africa Time) server midnight boundaries with 2 monthly freeze allowances and grace windows.
- **⭐ XP & Milestones**: Verified study time rewards XP once the 30-minute threshold is cleared.
- **🏆 Live Leaderboard**: Near real-time ranking powered by indexed database queries and cached reads.
- **🛡️ Anti-Cheat Session Integrity**: Server-side validation as the single source of truth—client-reported elapsed times are never blindly trusted.

---

## 📚 Project Architecture & Documentation

This project follows a structured engineering design process. Full specifications and architectural deliverables can be explored in the [`/docs`](./docs) directory:

1. **[01. Requirements & Behavior Spec](./docs/01-requirements-and-behavior-spec.md)** — MoSCoW scope, functional & non-functional requirements, and anti-cheat session lifecycle.
2. **[02. System Design](./docs/02-system-design.md)** — Modular monolith architecture, module boundaries, TypeScript/Next.js stack, and zero-budget hosting model.
3. **[03. Database Design](./docs/03-database-design.md)** — Conceptual, logical, and physical Postgres schemas, B-tree indexes, and state denormalization.
4. **[04. API Design](./docs/04-api-design.md)** — REST contracts, cookie-based session auth, error formats, and endpoint specifications.
5. **[05. Data Structures & Algorithms](./docs/05-data-structures-and-algorithms.md)** — Big-O performance analysis and engineering trade-offs.
6. **[06. OOP & Class Design](./docs/06-oop-and-class-design.md)** — Domain model, OOP pillars, SOLID principles, and repository pattern.
7. **[07. Implementation Plan (SDLC)](./docs/07-implementation-plan.md)** — Vertical slice roadmap, engineering loop, and version control standards.

👉 **[View the complete Documentation Index](./docs/README.md)**

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript (End-to-End)
- **Database**: PostgreSQL ([Neon](https://neon.tech/))
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the local development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.
