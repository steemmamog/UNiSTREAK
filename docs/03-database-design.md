# UNiSTREAK Database Design Doc

*Phase deliverable. Builds on the System Design Doc and feeds the API Design Doc. Last updated October 3, 2026.*

## 1. Overview

This document follows the standard database design sequence: requirements analysis, conceptual design, logical design, and physical design, in that order, each one answering a narrower question than the last.

## 2. Requirements Analysis

What has to be stored, pulled directly from the Requirements Spec and the API contract, not guessed at independently: who a student is, every session they run (timer or stopwatch, its duration, its outcome), their current streak and how it got there, their total XP, and which days a streak freeze was used.

## 3. Conceptual Design

Three entities, decided deliberately as three rather than two:

- **Users**, one row per student.
- **Sessions**, one row per study session, many per user.
- **Freeze uses**, one row per day a streak freeze was actually used, many per user.

Users has a one-to-many relationship with both Sessions and Freeze uses.

## 4. Logical Design

**Users**
| Column | Type | Notes |
|---|---|---|
| id | identifier | primary key |
| email | text | unique |
| password_hash | text | never exposed outside the User class |
| name | text | |
| xp | integer | denormalized, see section 6 |
| streak | integer | denormalized, see section 6 |
| last_counted_date | date, nullable | the once-per-day cap for streak increments |

**Sessions**
| Column | Type | Notes |
|---|---|---|
| id | identifier | primary key |
| user_id | identifier | foreign key to Users |
| mode | enum: timer, stopwatch | |
| planned_duration_minutes | integer, nullable | null for stopwatch mode |
| started_at | timestamp | server-recorded, never client-reported |
| target_end_at | timestamp, nullable | timer mode only |
| last_heartbeat_at | timestamp, nullable | stopwatch mode only |
| status | enum: active, completed, partial, none | |

**Freeze uses**
| Column | Type | Notes |
|---|---|---|
| id | identifier | primary key |
| user_id | identifier | foreign key to Users |
| used_date | date | |

## 5. Physical Design

- Index on `users.xp`, supports the leaderboard's top-N query and the "count how many have more XP than me" rank query, both resolved against the same index.
- Index on `users.email` (lowercase or case-insensitive), supports login and the type-ahead friend search, a prefix query against this index is what makes "starts with" search cheap without a hand-built structure.
- Index on `sessions.user_id`, supports fetching a user's own session history and the reconnect flow's lookup by session id.
- Index on `freeze_uses` (`user_id`, `used_date`), supports counting how many freezes a user has used in the current calendar month.

## 6. Design Decisions and Trade-offs

**XP and streak are denormalized onto Users, not computed on demand.** Normalization exists to prevent duplicated facts and the update bugs that come from them, neither applies here, XP and streak are computed once, in one place, when a session completes, then read constantly. Computing them fresh on every read would mean an ever-growing O(n) scan through a user's full session history, slower the longer someone uses the app. A maintained value is O(1) to read regardless of history size, which the leaderboard's 30-second freshness rule requires.

**Streak freezes are tracked as a dated ledger, not a decrementing counter.** A counter needs something to reset it monthly, a scheduled job, a category of infrastructure this project doesn't otherwise have, with its own silent failure mode if it doesn't run. A ledger of dates needs no reset at all, "freezes used this month" is just a count filtered by date range, and last month's freeze stops counting automatically the moment the calendar turns over. This also composes cleanly with the future in-game shop (purchased freezes are just another dated row) without having designed for that feature directly.

## 7. Not Yet Decided

- Exact column sizes and constraints (text length limits, precision), left for implementation.
- Migration strategy for schema changes once the application is live.
