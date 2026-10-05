# UNiSTREAK Documentation

Welcome to the UNiSTREAK project documentation. The documents below are arranged in sequential, logical reading order from product requirements down through architecture, data modeling, API contracts, algorithmic tradeoffs, object-oriented domain design, and iterative implementation planning.

---

## Table of Contents

1. [01. Requirements and Behavior Spec](./01-requirements-and-behavior-spec.md)
   * Product overview, MoSCoW scope, functional & non-functional requirements, anti-cheat rules, and study session lifecycle.
2. [02. System Design](./02-system-design.md)
   * High-level system components, modular monolith architecture, module boundaries, technology stack, and zero-budget hosting strategy.
3. [03. Database Design](./03-database-design.md)
   * Requirements analysis, conceptual data model, logical schema (Users, Login sessions, Study sessions, Freeze uses), physical indexing, and denormalization decisions.
4. [04. API Design](./04-api-design.md)
   * REST API design, user stories, security constraints, performance requirements, and endpoint contracts.
5. [05. Data Structures and Algorithms](./05-data-structures-and-algorithms.md)
   * Big-O analysis, feature-by-feature algorithm decisions (streaks, timing, XP tiers, indexing, ranking, and rate limiting).
6. [06. OOP and Class Design](./06-oop-and-class-design.md)
   * Domain model (`StudySession`), OOP pillars, SOLID principles applied, class interfaces, and closing the dependency inversion gap with repositories.
7. [07. Implementation Plan (SDLC)](./07-implementation-plan.md)
   * SDLC approach (waterfall design to structured iterative implementation), vertical slice order, per-slice process, and git/version control conventions.
