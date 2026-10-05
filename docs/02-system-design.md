# UNiSTREAK System Design Doc

*Phase deliverable. Sits between the Requirements and Behavior Spec and the API Design Doc. Last updated October 5, 2026.*

## 1. Overview

System design is the layer of thinking between requirements (what the system must do, and how well) and implementation (the actual code). It answers four questions, in order: what are the separate pieces, how do they talk to each other, where does data live, and what does each piece need to be true given the already-locked requirements. Only after those are answered does a specific technology choice become a real decision rather than a guess.

## 2. System Components

- **Client**: the student's browser or phone. Displays study sessions, the timer, streaks, and the leaderboard.
- **Backend server**: the single source of truth. Holds the business rules (study session integrity, streak logic, XP calculation, authentication) and is the only thing the client is allowed to trust.
- **Database**: stores users, login sessions, study sessions, streak state, and XP persistently.
- **Notification service**: triggers the timer's alarm, including the best-effort locked-screen case.
- **AI tutor** (future, Should-have tier): an external LLM integration, not part of this phase's design.

## 3. Architecture: Modular Monolith

**Decision**: one deployable backend, not microservices.

**Reasoning**: this project does not need horizontal scaling at UNILAG's scale, a few thousand students, not a global user base. Microservices introduce real, concrete costs, network calls between services, multiple things to deploy, and handling partial failure when one service is down but another isn't, with no payoff at this size. Choosing microservices here would be solving a problem the project doesn't have.

A monolith does not inherently mean disorganized code. Past project experience showed that codebases degrade not because of a single-deployable architecture itself, but because nothing stops any part of the code from reaching directly into any other part. Bad coupling and poor cohesion cause that rot, not the deployment shape.

**Module boundary test**: a module owns one clear piece of data and responsibility, exposes a small, deliberate set of functions other code goes through to touch it, and can be described in one sentence without needing the word "and" more than once.

**Modules identified**: Auth (Login Sessions), Study Sessions, Streak, XP, Leaderboard, Notifications. Each of these later maps directly onto the domain classes in the OOP/Class Design deliverable.

## 4. Technology Stack

- **Language**: TypeScript, end to end, frontend and backend both. Chosen to keep one language across the whole system rather than splitting, and because it matches the original UNiSTREAK's stack.
- **Frontend**: Next.js.
- **Backend**: Node.js, via Next.js API routes, running as serverless functions.
- **Database**: PostgreSQL. Chosen over a document-store (NoSQL) database because the data is structured and interrelated, users, login sessions, study sessions, streaks, with real transactional needs, study session completion has to update XP and the streak together, safely.

## 5. Hosting

- **Frontend and backend**: Vercel. API routes run as serverless functions, not a continuously running process.
- **Database**: Neon, provisioned through Vercel's dashboard. Vercel no longer offers a first-party Postgres product; what Vercel calls "Postgres" today is a Neon database wired in through a marketplace integration, with billing and setup folded into the Vercel dashboard.
- **Budget**: $0. Every choice here is a genuinely free tier, not a trial credit.
- **Known trade-off, accepted deliberately**: serverless functions and Neon's free tier both suspend when idle and add a short delay to the first request after a quiet period. This is the standard cost of building at zero budget across the industry right now, not a flaw specific to this stack.
- **Note on the "real server" learning goal**: understanding what a genuinely persistent, always-on server is comes from running the code locally during development (`node server.js`, listening, not sleeping), not from whichever platform eventually hosts the public, deployed version.

## 6. Not Yet Decided

- Specific serverless function configuration (memory limits, any cold-start mitigation), to be addressed during implementation rather than design.
