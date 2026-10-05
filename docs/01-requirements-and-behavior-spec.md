# UNiSTREAK Rebuild: Requirements and Behavior Spec

*Living document. Update in place as decisions evolve; last updated September 22, 2026.*

## 1. Overview

A two-week sprint rebuilding UNiSTREAK from scratch, doubling as a structured software engineering learning curriculum (programming fundamentals, data structures and algorithms, OOP and software design, SDLC and engineering practices, testing, git and collaboration, web and backend fundamentals, and engineering judgment), taught through the actual rebuild rather than as separate lessons.

Product: a gamified study webapp for University of Lagos (UNILAG) students, pitched as "Snapchat, but for studying."

Core value proposition: the game mechanics should make studying more fun than just setting a timer.

Audience: the general UNILAG student body, not a narrow group of coursemates.

## 2. Scope (MoSCoW)

**Must have (this sprint)**
- Study session tracking (timer mode and stopwatch mode)
- Persistent, accurate session timer that survives backgrounding and phone sleep, with an alarm-style notification when time elapses (guaranteed on reopen, best-effort while the screen is locked)
- Streaks
- XP / milestones
- Leaderboard

**Should have (this sprint, if time allows)**
- Friends
- One AI tutor study mode

**Could have (after this sprint)**
- Clans
- Quests
- Remaining AI tutor study mode techniques (Feynman, Socratic, Active Recall, Elaborative Interrogation)
- Extending an active timer mid-session

**Won't have (this sprint)**
- Snapchat-style interactive/dress-up avatars (decorative only)

## 3. Functional Requirements

### 3.1 Study Sessions
- Two session types are offered:
  - Timer mode: the student picks a duration upfront.
  - Stopwatch mode: open-ended; the student starts and stops it manually.
- A session must reach at least 30 minutes of verified study time to earn any XP or streak credit at all.
- Timer mode should not offer duration presets under 30 minutes, since they could never earn credit.

### 3.2 Streaks
- A streak day is defined by a fixed server-side day boundary: midnight WAT (West Africa Time), the same for every user, not each device's local clock.
- Two "streak freeze" skips are allowed per calendar month.
- A one-hour grace window past midnight is allowed before a missed day breaks the streak.

### 3.3 XP / Milestones
- XP is awarded per verified minute of study time, once the 30-minute floor is cleared.
- Milestone tiers and reward curve: not yet defined; to be specified during the data-modeling phase.

### 3.4 Leaderboard
- Must reflect score changes in near real time.
- A few seconds of lag is acceptable only for a specific technical reason; anything over 30 seconds is not acceptable.

### 3.5 Timer Persistence and Alarm
- The timer's correctness does not depend on the tab staying active or the phone staying awake. It is derived from the server-recorded start time and chosen duration, checked against the server's own clock.
- When a timer session's target time is reached:
  - Guaranteed: the alarm fires immediately the moment the app is reopened or foregrounded, if the target time has already passed.
  - Best-effort: the app also attempts to trigger a notification and sound while the screen is locked or the tab is backgrounded, using push notifications. Reliability is platform-dependent; expect it to be materially more reliable on Android/Chrome than iOS Safari, even when the site is added to the home screen. This is accepted as a Must-have with a known platform ceiling, not a bug to chase to 100 percent.

## 4. Non-Functional Requirements and Business Rules

### 4.1 Session Integrity (Anti-Cheat)
- The server independently verifies how long a session actually ran; the client's self-reported duration is never trusted on its own. This directly addresses the integrity bug in the original build.
- Verification method: the client sends a periodic heartbeat (a small "still here" signal) to the server every few seconds while a session is active. The server's own record of the last heartbeat received is the source of truth for elapsed time, not anything the client reports at the end.

### 4.2 Session Completion States
Every session resolves into one of three states:
- **Completed**: timer mode reaches its full chosen duration; stopwatch mode ends via an explicit stop after clearing 30 minutes. Eligible for XP and streak credit.
- **Partial**: the session ends before its intended point (an early intentional stop past 30 minutes, or a disconnect/crash not recovered within the reconnect grace window, past 30 minutes). Eligible for XP only, never streak credit.
- **None**: total verified time never reaches the 30-minute floor. No XP, no streak credit.

### 4.3 Reliability and Failure Handling (Disconnects/Crashes)
This rule applies differently depending on session type, because timer mode and stopwatch mode carry different amounts of information upfront.

**Timer mode**: completion is determined purely by the server-recorded start time plus the chosen duration, checked against the server's own clock. The client does not need to stay connected, keep the tab active, or send heartbeats for this to work correctly; backgrounding, phone sleep, or switching tabs does not affect whether the session counts. This is what makes the timer genuinely persistent (section 3.5) without reopening the original anti-cheat problem, since real time still has to actually pass either way.

**Stopwatch mode**: since there is no predetermined end time, the server still needs an ongoing liveness signal (a periodic heartbeat) to know a session is genuinely still active.
- If that heartbeat stops (crash, dropped connection, force-close), the server allows a 5-minute reconnect grace window.
  - Reconnect within 5 minutes: the session resumes exactly where it paused, treated as uninterrupted, and remains eligible for full completion and streak credit.
  - No reconnect within 5 minutes: the session auto-finalizes at the last verified heartbeat and falls under the Session Completion States rules above (4.2).
- This intentionally treats an unrecovered crash the same as an intentional early exit in stopwatch mode, because the server cannot reliably tell the two apart, and trying to would reopen the same trust problem as the original anti-cheat bug.

Heartbeats are also used more generally for live presence, such as an "actively studying" indicator on the leaderboard, independent of whether they affect a given session's validity.

## 5. Historical Context (why these rules exist)

The original UNiSTREAK had unresolved bugs directly related to several of these rules: streak and date-logic bugs, unreliable leaderboard/presence updates, and a session-integrity issue where the client's reported completion time was trusted directly. The non-functional requirements in section 4 exist specifically to prevent a repeat of those failures, not as speculative hardening.

## 6. Not Yet Decided

- Development approach for the two-week sprint (a fully spec-first, waterfall-style approach versus an iterative, build-a-thin-slice-then-expand approach).
- Technology stack and architecture (deliberately deferred until requirements were solid).
- Detailed design of the Should-have and Could-have tiers (friends system specifics, which AI tutor mode ships first, clans/quests mechanics).
- XP milestone thresholds and specific reward curve.
- Push notification implementation approach for the locked-screen alarm (browser support matrix, permission request UX).
