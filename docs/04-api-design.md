# UNiSTREAK API Design Doc

*Phase deliverable. Builds on the Requirements and Behavior Spec (Phase 1) and the System Design discussion (Phase 2). Last updated September 23, 2026.*

## 1. Overview

This document formalizes the design of UNiSTREAK's REST API, following a deliberate process: identify core use cases and user stories, define scope and boundaries, determine performance requirements, consider security constraints, agree on conventions, then design the actual endpoints. The approach taken is top-down (starting from what a student needs, not from the database schema) and contract-first (this document is the source of truth, written before any implementation).

## 2. Core Use Cases and User Stories

- As a UNILAG student, I want to start a study session, timer or stopwatch, so my study time gets tracked toward XP and my streak.
- As a UNILAG student, I want my session to survive my phone locking or the tab backgrounding, so I don't lose progress or get penalized for normal phone use.
- As a UNILAG student, I want to be alerted when my timer session ends, even if my phone is locked, so I don't lose track of my study time.
- As a UNILAG student, I want to see my current streak and remaining freezes, so I can manage my habit without feeling punished by one missed day.
- As a UNILAG student, I want to see how I rank on the leaderboard, updated quickly, so the competitive element feels real.
- As a UNILAG student, I want a dropped session to be recoverable, so a crash or network hiccup doesn't unfairly cost me my streak.

## 3. Scope and Boundaries

**In scope for this phase**: endpoints covering the Must-have tier only, sessions (timer and stopwatch), streaks, XP, leaderboard, and authentication.

**Out of scope for this phase**: Should-have and Could-have endpoints (friends, AI tutor, clans, quests, extending an active timer). These get their own user stories and design pass once their own requirements are formalized.

**Versioning**: all routes are prefixed with `/api/v1/`. Cheap to add now, expensive to retrofit later once a real client depends on the current response shape.

## 4. Performance Requirements

- Leaderboard reads must reflect a score change within 30 seconds; a short-lived cache (a few seconds, invalidated on write) keeps this fast without breaking that guarantee.
- Session-critical writes (start, heartbeat, complete) target a response time well under a second under normal load. Proposed working target, not yet load-tested.
- Leaderboard responses are paginated: the top N entries plus the requesting student's own rank, never the full list in one payload.

## 5. Security Constraints

- **Authentication**: session cookies, chosen over JWT because the server is a single instance and is already the source of truth for everything else in this system; a revocable, server-held session fits that model, and JWT's main advantage, no shared lookup across many instances, doesn't apply here.
- **Authorization**: a request can only read or modify the session, streak, or XP data belonging to the authenticated user, identity always derived from the session, never from a client-supplied ID. A request for a resource that exists but belongs to someone else returns 404, not 403, so the response never confirms whether the resource exists at all.
- **Input validation**: every request body is validated against its expected shape and types before it reaches any business logic.
- **Rate limiting**: an in-memory, per-user limiter is sufficient, since there is deliberately only one running instance to keep state in.
- **Anti-cheat carry-over**: the server never trusts a client-reported session duration; enforced at the endpoint level, not just assumed.

## 6. Conventions

- **Response envelope**: a successful response returns the resource directly at the top level, no `{ "success": true, "data": ... }` wrapper. The HTTP status code already communicates success.
- **Error shape**, consistent across every endpoint: `{ "error": { "code": "snake_case_code", "message": "human readable sentence" } }`.
- **Resource IDs** are prefixed by type, `usr_123`, `ses_abc123`, so the kind of thing an ID refers to is obvious wherever it shows up, logs included.

## 7. Endpoints

### Auth

```
POST /api/v1/auth/login
-> { "email": "...", "password": "..." }
<- 200 { "id": "usr_123", "email": "...", "name": "..." }   (sets the session cookie)
<- 401 { "error": { "code": "invalid_credentials", "message": "Email or password is incorrect." } }

POST /api/v1/auth/logout
<- 204 (no body, cookie cleared)
```
Normal email and password, no UNILAG-domain restriction.

### Sessions

```
POST /api/v1/sessions
-> { "mode": "timer" | "stopwatch", "plannedDurationMinutes": 45 }   (omit duration for stopwatch)
<- 201 {
     "id": "ses_abc1", "mode": "timer", "plannedDurationMinutes": 45,
     "startedAt": "2026-09-23T14:00:00Z", "targetEndAt": "2026-09-23T14:45:00Z",
     "status": "active"
   }
<- 400 { "error": { "code": "invalid_duration", "message": "Timer sessions must be at least 30 minutes." } }

POST /api/v1/sessions/:id/heartbeat
  Stopwatch mode only, the liveness ping that drives the 5-minute reconnect grace window (section 4.3 of the Requirements Spec). Named heartbeat rather than tick because its job is proving the client is still present, not marking a scheduled interval. Timer mode never calls this, its completion is decided by the server's own clock against the target end time.
<- 200 { "id": "ses_abc1", "status": "active", "lastHeartbeatAt": "..." }
<- 409 { "error": { "code": "session_finalized", "message": "This session has already ended." } }

POST /api/v1/sessions/:id/complete
<- 200 { "id": "ses_abc1", "status": "completed" | "partial" | "none", "verifiedMinutes": 45, "xpAwarded": 45, "streakCounted": true }

GET /api/v1/sessions/:id
  Same shape as above, current state, used by the reconnect flow after a drop.
<- 404 { "error": { "code": "not_found", "message": "Session not found." } }   (also returned if it exists but belongs to another user)
```

### Streak and XP

```
GET /api/v1/me/streak
<- 200 { "currentStreak": 12, "freezesRemaining": 1, "lastCountedDate": "2026-09-22" }

GET /api/v1/me/xp
<- 200 { "totalXp": 3400 }
```

### Leaderboard

```
GET /api/v1/leaderboard?limit=20&cursor=...
<- 200 { "entries": [ { "rank": 1, "userId": "usr_1", "name": "...", "xp": 5200 } ], "nextCursor": "..." }

GET /api/v1/leaderboard/me
<- 200 { "rank": 42, "xp": 3400 }
```

## 8. Not Yet Decided

- Concrete performance target for write endpoints, once validated under real load.
