# UNiSTREAK Implementation Plan (SDLC)

*Phase deliverable. Builds on the Requirements and Behavior Spec, the System Design discussion, and the API Design Doc. Last updated October 3, 2026.*

## 1. Overview

This document formalizes the Software Development Life Cycle approach for the rest of this build: which model was used for design, which model is used for implementation, and the concrete plan that follows from that choice.

## 2. SDLC Approach

**Design phases** (Requirements Engineering, System Design, Database Design, API Design, OOP/Class Design): waterfall. Each phase was completed fully before the next began, in strict sequence. This worked specifically because the scope was well understood and stable enough to plan against properly, not as a default choice made out of habit.

**Implementation**: structured iterative. Rather than building every class for every feature and only then testing any of it, one complete vertical slice, domain class through repository, use case, and API route, is built, tested, and verified before the next slice begins.

**Why the switch**: design can be entirely correct on paper and still break the moment it touches real infrastructure, Postgres behaving differently than assumed, Next.js's cookie handling having its own quirks, TypeScript surfacing a case the design never considered. Building one slice at a time surfaces that kind of problem immediately, while there is still almost nothing built to unwind, rather than after a large amount of code already exists on top of a wrong assumption.

"Iterative" here is not the same as "unstructured." The slice order below is fixed in advance, not chosen day to day, and every slice repeats the same defined steps rather than being approached freshly each time.

## 3. Vertical Slice Order

1. **Auth** (login, logout, session cookie), nothing else works without a logged-in user.
2. **Timer session creation and completion**, the simplest full path through every architectural layer, proven once, end to end.
3. **Stopwatch mode and heartbeat/reconnect logic**, reuses the pattern proven in slice 2.
4. **Streak**, triggered off the session-completion event already designed.
5. **XP**, triggered off the same session-completion event.
6. **Leaderboard**, depends on XP already existing.

Notifications and rate limiting are layered into whichever slice they naturally belong to as that slice is built, not treated as standalone slices of their own.

## 4. Per-Slice Process

The same steps, repeated for every slice, in order:

1. Write the domain class.
2. Write tests against it before wiring anything else up.
3. Connect the repository.
4. Connect the use case.
5. Connect the API route.
6. Verify it actually works.
7. Commit with a proper message.
8. Move to the next slice.

## 5. Version Control Conventions

- **Branch strategy**: `main` always stays stable and working. Each slice, or sub-piece of a slice, gets its own short-lived branch, merged back via pull request even though this is currently a solo project, since the eventual open-source audience benefits from a clean, reviewable history.
- **Commit messages**: Conventional Commits format, `type: short description`, for example `feat: add session completion endpoint`, `fix: correct streak reset on uncovered gap`, `chore: initial project structure`.

## 6. Not Yet Decided

- Testing framework and tooling specifics, belongs to the Testing phase (Days 12 to 13), not a blocker for starting implementation.
