import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  updateProfileSchema,
  checkPassword,
  passwordScore,
  passwordStrengthLabel,
  fieldErrors,
  PASSWORD_POLICY,
} from "@/lib/validation";

/**
 * The validation layer guards authentication, checkout and profile writes, so
 * these tests pin the behaviour rather than just the happy path.
 */

describe("emailSchema", () => {
  it("accepts and normalises a normal address", () => {
    const result = emailSchema.safeParse("  Athlete@Example.COM ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("athlete@example.com");
  });

  it.each([
    ["", "empty"],
    ["not-an-email", "missing @"],
    ["a@b", "no TLD"],
    ["no-at-sign.example.com", "no @"],
    ["spaces in@example.com", "whitespace"],
  ])("rejects %s (%s)", (value) => {
    expect(emailSchema.safeParse(value).success).toBe(false);
  });

  it("rejects addresses longer than the RFC limit", () => {
    const tooLong = `${"a".repeat(250)}@example.com`;
    expect(emailSchema.safeParse(tooLong).success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts a password meeting every rule", () => {
    expect(passwordSchema.safeParse("StrongPass1").success).toBe(true);
  });

  it.each([
    ["short1A", "too short"],
    ["nouppercase1", "no uppercase"],
    ["NOLOWERCASE1", "no lowercase"],
    ["NoDigitsHere", "no digit"],
    ["waytoolong" + "A1".repeat(80), "too long"],
  ])("rejects %s (%s)", (value) => {
    expect(passwordSchema.safeParse(value).success).toBe(false);
  });

  it("enforces a minimum length of at least 8", () => {
    expect(PASSWORD_POLICY.minLength).toBeGreaterThanOrEqual(8);
  });
});

describe("checkPassword / score", () => {
  it("reports each unmet rule individually", () => {
    const checks = checkPassword("abc");
    const byId = Object.fromEntries(checks.map((c) => [c.id, c.passed]));
    expect(byId.length).toBe(false);
    expect(byId.uppercase).toBe(false);
    expect(byId.digit).toBe(false);
  });

  it("scores a fully compliant password at 4", () => {
    expect(passwordScore("StrongPass1")).toBe(4);
  });

  it("scores an empty password at 0", () => {
    expect(passwordScore("")).toBe(0);
  });

  it("labels the score", () => {
    expect(passwordStrengthLabel(0)).toBe("Too weak");
    expect(passwordStrengthLabel(4)).toBe("Strong");
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "Jordan Matthews",
    email: "jordan@example.com",
    password: "StrongPass1",
    phone: "+1 555 0182",
  };

  it("accepts a valid registration", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("defaults phone to an empty string when omitted", () => {
    const { phone: _phone, ...withoutPhone } = valid;
    const result = registerSchema.safeParse(withoutPhone);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe("");
  });

  // Regression guard: the old register route read `role` off the body.
  it("rejects unknown keys so a caller cannot smuggle in `role`", () => {
    const result = registerSchema.safeParse({ ...valid, role: "admin" });
    expect(result.success).toBe(false);
  });

  it("rejects a name that is too short or too long", () => {
    expect(registerSchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, name: "x".repeat(200) }).success).toBe(false);
  });

  it("rejects a phone containing letters", () => {
    expect(registerSchema.safeParse({ ...valid, phone: "call me" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("defaults remember to false", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "x",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.remember).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("requires a long enough token", () => {
    expect(resetPasswordSchema.safeParse({ token: "short", password: "StrongPass1" }).success).toBe(
      false
    );
  });

  it("accepts a full token and a compliant password", () => {
    expect(
      resetPasswordSchema.safeParse({ token: "a".repeat(64), password: "StrongPass1" }).success
    ).toBe(true);
  });
});

describe("updateProfileSchema", () => {
  const base = { name: "Valid Name", phone: "", avatar: "", address: {} };

  it("accepts a relative avatar path", () => {
    expect(updateProfileSchema.safeParse({ ...base, avatar: "/images/x.webp" }).success).toBe(true);
  });

  it("accepts an https avatar", () => {
    expect(updateProfileSchema.safeParse({ ...base, avatar: "https://example.com/a.png" }).success).toBe(
      true
    );
  });

  // Regression guard: an unvalidated avatar was a stored-XSS vector.
  it("rejects a javascript: avatar", () => {
    expect(
      updateProfileSchema.safeParse({ ...base, avatar: "javascript:alert(1)" }).success
    ).toBe(false);
  });

  it("accepts the preferences object used by the account toggles", () => {
    const result = updateProfileSchema.safeParse({
      ...base,
      preferences: { matchAlerts: false, trainingReminders: true, gearDrops: true },
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown preference key", () => {
    expect(
      updateProfileSchema.safeParse({
        ...base,
        preferences: { matchAlerts: true, rogue: true },
      }).success
    ).toBe(false);
  });
});

describe("fieldErrors", () => {
  it("turns a ZodError into a field -> message map", () => {
    const result = registerSchema.safeParse({ name: "A", email: "bad", password: "x" });
    expect(result.success).toBe(false);
    if (result.success) return;

    const errors = fieldErrors(result.error);
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
  });

  // Regression guard: Zod's raw "Unrecognized key" was shown to users.
  it("translates an unexpected-key error into plain English", () => {
    const result = registerSchema.safeParse({
      name: "Valid Name",
      email: "a@b.com",
      password: "StrongPass1",
      nope: true,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(fieldErrors(result.error).form).toBe("The request contained unexpected fields");
  });
});