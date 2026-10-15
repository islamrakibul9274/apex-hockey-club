import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { escapeRegex, normaliseTerm, singleLine } from "@/lib/text";
import {
  MEMBERSHIP_PLANS,
  normalisePlan,
  resolveTicketPrice,
  formatMoney,
} from "@/lib/pricing";
import { withId, withIdAll, normaliseCatalogue } from "@/lib/serialise";
import { rateLimit } from "@/lib/rateLimit";

describe("escapeRegex", () => {
  // Regression: `?search=.*` used to match every product.
  it("neutralises a wildcard so it cannot match everything", () => {
    expect(escapeRegex(".*")).toBe("\\.\\*");
  });

  it.each([
    ["a.b", "a\\.b"],
    ["a+b", "a\\+b"],
    ["a(b)", "a\\(b\\)"],
    ["a|b", "a\\|b"],
    ["a$b^c", "a\\$b\\^c"],
    ["a{1,2}", "a\\{1,2\\}"],
  ])("escapes %s", (input, expected) => {
    expect(escapeRegex(input)).toBe(expected);
  });

  it("leaves ordinary text untouched", () => {
    expect(escapeRegex("carbonflex stick")).toBe("carbonflex stick");
  });
});

describe("normaliseTerm", () => {
  it("returns an empty string for null", () => {
    expect(normaliseTerm(null)).toBe("");
  });

  it("trims and caps length", () => {
    expect(normaliseTerm("  spaced  ")).toBe("spaced");
    expect(normaliseTerm("x".repeat(500), 10)).toHaveLength(10);
  });
});

describe("singleLine", () => {
  // Regression: a newline in the contact subject could inject mail headers.
  it("strips newlines", () => {
    expect(singleLine("Hello\r\nBcc: attacker@evil.test")).toBe("Hello Bcc: attacker@evil.test");
  });
});

describe("normalisePlan", () => {
  it("normalises display names to plan keys", () => {
    expect(normalisePlan("Teen Academy")).toBe("teen-academy");
    expect(normalisePlan("  Professional & League Masterclass ")).toBe(
      "professional-league-masterclass"
    );
  });
});

describe("MEMBERSHIP_PLANS", () => {
  it("prices plans in integer cents, never from client input", () => {
    for (const [key, plan] of Object.entries(MEMBERSHIP_PLANS)) {
      expect(Number.isInteger(plan.amount), `${key} amount`).toBe(true);
      expect(plan.amount).toBeGreaterThanOrEqual(50);
    }
  });

  it("exposes a blurb for every plan", () => {
    for (const plan of Object.values(MEMBERSHIP_PLANS)) {
      expect(plan.blurb.length).toBeGreaterThan(0);
    }
  });
});

describe("resolveTicketPrice", () => {
  it("resolves a real match and tier", () => {
    const ticket = resolveTicketPrice("match-1", "General Admission");
    expect(ticket).not.toBeNull();
    expect(ticket?.price).toBe(15);
    expect(ticket?.availableSeats).toBe(120);
  });

  it("returns null for an unknown match", () => {
    expect(resolveTicketPrice("match-999", "General Admission")).toBeNull();
  });

  it("returns null for an unknown tier", () => {
    expect(resolveTicketPrice("match-1", "Box Seat Deluxe")).toBeNull();
  });

  it("returns null for an empty tier rather than defaulting", () => {
    expect(resolveTicketPrice("match-1", "")).toBeNull();
  });
});

describe("formatMoney", () => {
  it("formats USD with two decimals", () => {
    expect(formatMoney(15)).toBe("$15.00");
    expect(formatMoney(1234.5)).toBe("$1,234.50");
  });
});

describe("withId", () => {
  // Regression: MongoDB documents have _id and no id, so every client key was
  // undefined and two different products merged into one cart line.
  it("uses an existing id when present", () => {
    const doc = { id: "prod-1" } as { id?: unknown; _id?: unknown };
    expect(withId(doc).id).toBe("prod-1");
  });

  it("falls back to _id, stringified", () => {
    const doc = { _id: { toString: () => "abc123" } } as { id?: unknown; _id?: unknown };
    expect(withId(doc).id).toBe("abc123");
  });

  it("falls back to the positional key", () => {
    const doc = { title: "Stick" } as { title?: unknown };
    expect(withId(doc, "item-7").id).toBe("item-7");
  });

  it("never returns an undefined id", () => {
    for (const doc of [{}, { _id: null }, { title: "X" }] as Record<string, unknown>[]) {
      const result = withId(doc, "fallback");
      expect(typeof result.id).toBe("string");
      expect(result.id.length).toBeGreaterThan(0);
    }
  });

  it("assigns unique ids across a list", () => {
    const list = withIdAll([{ title: "A" }, { title: "B" }, { title: "C" }] as Record<string, unknown>[]);
    const ids = list.map((i) => i.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("never spreads a Mongoose document's internals", () => {
    // A document spreads to { $__: {...} } unless toObject() is used first.
    const fakeDoc = {
      $__: { activePaths: { secret: true } },
      title: "Stick",
      toObject() {
        return { title: "Stick" };
      },
    };
    const result = withId(fakeDoc as unknown as Record<string, unknown>, "item-0");
    expect(result).not.toHaveProperty("$__");
    expect(result.id).toBe("item-0");
  });
});

describe("normaliseCatalogue", () => {
  it("prefers database rows when present", () => {
    const result = normaliseCatalogue([{ _id: "db1" }] as Record<string, unknown>[], [
      { id: "seed1" },
    ] as Record<string, unknown>[]);
    expect(result[0].id).toBe("db1");
  });

  it("falls back to the catalogue when the database is empty", () => {
    const result = normaliseCatalogue([] as Record<string, unknown>[], [
      { id: "seed1" },
    ] as Record<string, unknown>[]);
    expect(result[0].id).toBe("seed1");
  });
});

describe("rateLimit", () => {
  // The integration suite sets RATE_LIMIT_DISABLED so it can create fixtures
  // on repeat runs. The limiter's own behaviour must be tested with it OFF.
  beforeEach(() => {
    delete process.env.RATE_LIMIT_DISABLED;
  });

  it("allows up to the limit then blocks", () => {
    const key = "test:allow";
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);

    const blocked = rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("keeps separate budgets per key", () => {
    expect(rateLimit("a", 1, 60_000).ok).toBe(true);
    expect(rateLimit("b", 1, 60_000).ok).toBe(true);
    expect(rateLimit("a", 1, 60_000).ok).toBe(false);
  });

  it("is bypassed when RATE_LIMIT_DISABLED is set", () => {
    process.env.RATE_LIMIT_DISABLED = "true";
    const key = "test:bypassed";
    for (let i = 0; i < 50; i += 1) {
      expect(rateLimit(key, 1, 60_000).ok).toBe(true);
    }
    delete process.env.RATE_LIMIT_DISABLED;
  });

  it("reports remaining calls", () => {
    const key = "test:remaining";
    expect(rateLimit(key, 3, 60_000).remaining).toBe(2);
    expect(rateLimit(key, 3, 60_000).remaining).toBe(1);
    expect(rateLimit(key, 3, 60_000).remaining).toBe(0);
  });
});
afterAll(() => {
  delete process.env.RATE_LIMIT_DISABLED;
});
