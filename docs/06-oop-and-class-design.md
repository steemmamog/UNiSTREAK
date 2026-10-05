# UNiSTREAK OOP and Class Design Doc

*Phase deliverable. The last design doc before implementation. Last updated October 3, 2026.*

## 1. Overview

This document records how the five OOP pillars and the five SOLID principles were actually applied to design UNiSTREAK's core domain classes, and the one real gap the SOLID check surfaced before it was closed.

## 2. OOP Pillars Applied

**Encapsulation**: internal state can only change through methods the owning class exposes, never by outside code reaching in directly. A user's XP only changes through a method the User class exposes; a session's status only changes through `complete()`. This is what protects every traced rule, the once-per-day streak cap, freeze coverage, the reset to one, from being silently bypassed by a stray direct assignment somewhere in the codebase later.

**Abstraction**: callers of `session.complete()` don't need to know about the 30-minute floor, timer versus stopwatch, or how verified minutes get calculated. All of that complexity is hidden behind one simple call.

**Inheritance**: `TimerSession` and `StopwatchSession` are both genuinely a `Session`, sharing the same core shape, differing only in how completion is determined.

**Polymorphism**: calling `.complete()` on either subtype does the right thing for that type, without the caller needing to branch on which kind it is first.

**Composition**: a `User` has a `Streak`, has an `Xp`, has many `Sessions`. None of these are "is-a" relationships, so none of them are modeled with inheritance.

**Interfaces**: `Completable` is a contract requiring a `complete()` method, letting `TimerSession` and `StopwatchSession` both promise the same capability while implementing it differently, enforced by the type system rather than hoped for by convention.

## 3. The Class Design

```typescript
interface Completable {
  complete(): SessionResult;
}

abstract class Session implements Completable {
  protected readonly id: string;
  protected readonly userId: string;
  protected readonly startedAt: Date;
  protected lastHeartbeatAt: Date;
  protected status: "active" | "completed" | "partial" | "none";

  protected verifiedMinutes(): number {
    // (lastHeartbeatAt or now) minus startedAt, in minutes
  }

  heartbeat(): void {
    this.lastHeartbeatAt = new Date();
  }

  abstract complete(): SessionResult;
}

class TimerSession extends Session {
  private readonly targetEndAt: Date;

  complete(): SessionResult {
    // reached targetEndAt -> completed
    // >=30 verified minutes but short of target -> partial
    // otherwise -> none
  }
}

class StopwatchSession extends Session {
  complete(): SessionResult {
    // explicit stop with >=30 verified minutes -> completed
    // heartbeat gap past the grace window is resolved before this is even called
  }
}

class Streak {
  private count: number;
  private lastCountedDate: Date | null;
  private freezeUses: Date[];

  private freezesAvailableThisMonth(): number {
    // 2 minus how many freezeUses fall in the current calendar month
  }

  registerQualifyingSession(date: Date): void {
    // once-per-day cap, consecutive day increments,
    // freeze coverage continues the count, uncovered gaps reset to 1
  }

  get current(): number {
    return this.count;
  }
}

class Xp {
  private total: number;

  award(verifiedMinutes: number): void {
    // 30-59 / 60-89 / 90+ threshold check
  }

  get value(): number {
    return this.total;
  }
}

class User {
  private readonly id: string;
  private readonly email: string;
  private readonly passwordHash: string;
  private readonly streak: Streak;
  private readonly xp: Xp;
  private readonly sessions: Session[];

  completeSession(session: Session): void {
    const result = session.complete();
    if (result.verifiedMinutes >= 30) {
      this.xp.award(result.verifiedMinutes);
      if (result.status === "completed") {
        this.streak.registerQualifyingSession(today());
      }
    }
  }
}
```

## 4. SOLID Principles Applied

**Single Responsibility**: `Session` owns lifecycle and timing, `Streak` owns streak math, `Xp` owns XP math, `User` owns identity and coordinates between them. Four jobs, four owners.

**Open/Closed**: a future third session type implements `Completable` and extends `Session`; nothing already written needs to change to allow it.

**Liskov Substitution**: anywhere a `Session` is expected, a `TimerSession` or `StopwatchSession` behaves correctly, no special-casing required, enforced by both returning the same `SessionResult` shape.

**Interface Segregation**: `Completable` asks for exactly one method, nothing dragged along that an implementing class doesn't actually need.

**Dependency Inversion**: this one did not hold in the first pass. `User.completeSession` never hardcoded Postgres calls, but nothing in the original design defined how data actually gets saved, or how a notification gets triggered. That gap was real, not cosmetic.

## 5. Closing the Dependency Inversion Gap: Repositories

```typescript
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

interface SessionRepository {
  findById(id: string): Promise<Session | null>;
  save(session: Session): Promise<void>;
}

interface NotificationService {
  notify(userId: string, message: string): Promise<void>;
}

class CompleteSessionUseCase {
  constructor(
    private users: UserRepository,
    private sessions: SessionRepository,
    private notifications: NotificationService
  ) {}

  async execute(userId: string, sessionId: string): Promise<void> {
    const user = await this.users.findById(userId);
    const session = await this.sessions.findById(sessionId);

    user.completeSession(session);

    await this.sessions.save(session);
    await this.users.save(user);
  }
}
```

The real implementations, `PostgresUserRepository`, `PostgresSessionRepository`, `PushNotificationService`, only get constructed at the outer edge, the API route handler. `User`, `Session`, `Streak`, and `Xp` never see Postgres or the notification system directly, which is what makes Dependency Inversion actually hold rather than just claimed.

This also pays off directly in the Testing phase: an `InMemoryUserRepository` can swap in for `PostgresUserRepository` with zero changes to `CompleteSessionUseCase`, turning every traced streak scenario into a fast, automated test with no real database required.

## 6. Not Yet Decided

- The concrete implementation details of each repository (query shapes, connection handling), left for the Testing and Implementation phases.
