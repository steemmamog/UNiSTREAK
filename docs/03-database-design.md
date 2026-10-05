# UNiSTREAK Database Design Doc

*Phase deliverable. Builds on the System Design Doc and feeds the API Design Doc. Last updated October 5, 2026.*

## 1. Overview

This document follows the standard database design sequence: requirements analysis, conceptual design, logical design, and physical design, in that order, each one answering a narrower question than the last.

## 2. Requirements Analysis

What has to be stored, pulled directly from the Requirements Spec and the API contract, not guessed at independently: who a student is, their authenticated login sessions, every study session they run (timer or stopwatch, its duration, its outcome), their current streak and how it got there, their total XP, and which days a streak freeze was used.

## 3. Conceptual Design

Four entities, distinguishing authenticated web sessions from gamified study sessions:

- **Users**, one row per student.
- **Login sessions**, one row per active authenticated session token, many per user.
- **Study sessions**, one row per gamified study session, many per user.
- **Freeze uses**, one row per day a streak freeze was actually used, many per user.

Users has a one-to-many relationship with Login sessions, Study sessions, and Freeze uses.

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

**Login sessions (`login_sessions`)**
| Column | Type | Notes |
|---|---|---|
| id | identifier | primary key (session token) |
| user_id | identifier | foreign key to Users |
| created_at | timestamp | creation time |
| expires_at | timestamp | server-enforced session expiration |

**Study sessions (`study_sessions`)**
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

**Freeze uses (`freeze_uses`)**
| Column | Type | Notes |
|---|---|---|
| id | identifier | primary key |
| user_id | identifier | foreign key to Users |
| used_date | date | |

## 5. Physical Design

- Index on `users.xp`, supports the leaderboard's top-N query and the "count how many have more XP than me" rank query, both resolved against the same index.
- Index on `users.email` (lowercase or case-insensitive), supports login and the type-ahead friend search, a prefix query against this index is what makes "starts with" search cheap without a hand-built structure.
- Index on `login_sessions.user_id` and `login_sessions.expires_at`, supports fast session token validation and cleanup of expired tokens.
- Index on `study_sessions.user_id`, supports fetching a user's own study history and the reconnect flow's lookup by study session id.
- Index on `freeze_uses` (`user_id`, `used_date`), supports counting how many freezes a user has used in the current calendar month.

## 6. Design Decisions and Trade-offs

**Distinguishing login sessions from study sessions prevents domain confusion.** A "login session" represents an authentication token and security lifecycle on the web server, whereas a "study session" represents an active or completed period of academic work with timing and gamification rules. Naming the table `study_sessions` and adding `login_sessions` eliminates architectural ambiguity across the codebase.

**XP and streak are denormalized onto Users, not computed on demand.** Normalization exists to prevent duplicated facts and the update bugs that come from them, neither applies here, XP and streak are computed once, in one place, when a study session completes, then read constantly. Computing them fresh on every read would mean an ever-growing O(n) scan through a user's full study session history, slower the longer someone uses the app. A maintained value is O(1) to read regardless of history size, which the leaderboard's 30-second freshness rule requires.

**Streak freezes are tracked as a dated ledger, not a decrementing counter.** A counter needs something to reset it monthly, a scheduled job, a category of infrastructure this project doesn't otherwise have, with its own silent failure mode if it doesn't run. A ledger of dates needs no reset at all, "freezes used this month" is just a count filtered by date range, and last month's freeze stops counting automatically the moment the calendar turns over. This also composes cleanly with the future in-game shop (purchased freezes are just another dated row) without having designed for that feature directly.

## 7. Not Yet Decided

- Exact column sizes and constraints (text length limits, precision), left for implementation.
- Migration strategy for schema changes once the application is live.
