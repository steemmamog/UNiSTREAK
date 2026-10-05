# UNiSTREAK Data Structures and Algorithms Doc

*Phase deliverable. Builds on the System Design and Database Design docs. Last updated October 5, 2026.*

## 1. Overview

This document records how data structures and algorithms thinking was actually applied to UNiSTREAK's Must-have features, not as abstract exercises, but as traced decisions against real requirements already locked in earlier phases.

## 2. Big-O, the Shared Measuring Stick

Big-O describes how the amount of work grows as the amount of data grows, the shape of that growth, not seconds on a particular machine. O(1): the work stays the same no matter how much data exists. O(n): work grows in a straight line with the data. O(log n): work grows very slowly even as data increases a great deal, because each step discards a large portion of what's left. This is the shared standard every decision below is measured against.

## 3. Feature-by-Feature Decisions

### Streak calculation
**Question**: recompute the streak from a user's full study session history on every read, or maintain it as a stored value.
**Decision**: maintained state, an O(1) read, updated with a small, fixed amount of work only when a study session completes.
**Reasoning**: the streak is read constantly, every leaderboard view, every profile check, while history only ever grows. Recomputing from scratch each time is O(n) and gets slower the longer someone uses the app. Paying a small, fixed cost at write time avoids an ever-growing cost at read time.

### Study session timing and the heartbeat sequence
**Question**: does determining a study session's outcome require processing every heartbeat received, or just the most recent one.
**Decision**: maintained state again, two timestamps, not a stored list of every heartbeat. Timer mode needs no heartbeat at all, completion is the server's own clock checked against a pre-known target time.
**Reasoning**: the actual business rule, any gap under five minutes counts as fully connected, never needs the full history to evaluate, only the latest value, so storing the whole sequence buys nothing.

### XP milestone lookup
**Question**: how to map verified study session minutes to an XP tier.
**Decision**: a plain ordered if/else chain, checked top to bottom. A hash table was explicitly considered and rejected.
**Reasoning**: the actual question being asked is "which range does this fall into," and a hash table only answers "do you have this exact key," a fundamentally different question that happens to also be O(1). Three tiers doesn't justify anything more structured; a sorted list with binary search would only start earning its keep in the dozens of tiers, solving a scale problem that doesn't exist yet.

### Leaderboard ranking
**Question**: "show me the top 20" and "what's my own rank" look like one ranking problem but are actually two.
**Decision**: both resolved against the same database index (a B-tree) on XP, not a hand-written sorting algorithm. "Top N" is a direct indexed range read. "My rank" is a count of how many rows have strictly more XP, plus one, not a search through a sorted list looking for a match.
**Reasoning**: the database's index is already a real, continuously maintained tree structure doing this work; reimplementing sorting or searching by hand would duplicate an already-solved problem.

### Friend search
**Question**: exact username entry, prefix match ("starts with"), or substring match ("contains anywhere").
**Decision**: prefix match, using the same B-tree index already in place.
**Reasoning**: a hand-built trie, the classic structure for prefix search, is only justified at a much larger scale, millions of entries, sub-millisecond expectations, not a few thousand UNILAG students. Substring search was explicitly ruled out, it needs a fundamentally different, heavier index (trigram-based), not something to introduce without an actual need for it.

### Rate limiting
**Question**: a precise sliding-window queue of timestamps, or a simple counter with a reset time.
**Decision**: the simple counter, accepting a known, low-stakes edge case at the reset boundary.
**Reasoning**: the cost of that known gap is genuinely small, nobody is harmed, nothing breaks. This is distinct from, for example, trusting client-reported study session time, where the simpler option would have enabled real cheating. Same shape of trade-off, different stakes, different answer.

### Study session and login session lookup
**Decision**: a straightforward indexed exact-match lookup on `study_sessions.id` and `login_sessions.id`, left unembellished since there is no real branching logic or edge case underneath it.

## 4. Governing Principle

Every decision above runs through the same filter: choose the best approach for each case while maintaining simplicity. This is the same instinct that ruled out Redis, a hand-built trie, a trigram index, and a scheduled job elsewhere in this project, each one a real, well-known tool, each one solving a problem this project does not actually have at its current scale.

## 5. Noted for Later, Not Designed Yet

Friendship is conceptually a graph, even though it is implemented as a simple join table for now; features like mutual friends or suggestions later would be genuine graph traversal. Clan membership belongs to the same family, many-to-many, and a clan leaderboard would combine grouping with the ranking approach already designed above. None of this is in scope for the Must-have tier; noted here so it is not accidentally designed against later.
