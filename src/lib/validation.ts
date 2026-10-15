import { z } from "zod";

/**
 * Shared validation. Imported by BOTH client forms and API routes so a rule can
 * never drift between the two.
 */

const EMAIL_MAX = 254;

/**
 * Single source of truth for the password policy.
 * `score()` drives the strength meter in the UI so the meter cannot disagree
 * with what the server actually enforces.
 */
export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  minLowercase: 1,
  minUppercase: 1,
  minDigits: 1,
} as const;

export type PasswordCheck = {
  id: string;
  label: string;
  passed: boolean;
};

export function checkPassword(password: string): PasswordCheck[] {
  return [
    {
      id: "length",
      label: `At least ${PASSWORD_POLICY.minLength} characters`,
      passed: password.length >= PASSWORD_POLICY.minLength,
    },
    {
      id: "lowercase",
      label: "A lowercase letter",
      passed: /[a-z]/.test(password),
    },
    {
      id: "uppercase",
      label: "An uppercase letter",
      passed: /[A-Z]/.test(password),
    },
    {
      id: "digit",
      label: "A number",
      passed: /\d/.test(password),
    },
  ];
}

/** 0–4. Used only for the meter; the server still enforces the full policy. */
export function passwordScore(password: string): number {
  return checkPassword(password).filter((c) => c.passed).length;
}

export function passwordStrengthLabel(score: number): string {
  return ["Too weak", "Weak", "Fair", "Good", "Strong"][score] ?? "Too weak";
}

export const emailSchema = z
  .string({ error: "Enter a valid email address" })
  .trim()
  .toLowerCase()
  .min(3, "Enter your email address")
  .max(EMAIL_MAX, "Email address is too long")
  .email("Enter a valid email address");

export const passwordSchema = z
  .string({ error: `Use at least ${PASSWORD_POLICY.minLength} characters` })
  .min(PASSWORD_POLICY.minLength, `Use at least ${PASSWORD_POLICY.minLength} characters`)
  .max(PASSWORD_POLICY.maxLength, "Password is too long")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/\d/, "Add a number");

export const nameSchema = z
  .string({ error: "Enter your full name" })
  .trim()
  .min(2, "Enter your full name")
  .max(80, "Name must be 80 characters or fewer");

export const phoneSchema = z
  .string({ error: "Enter a valid phone number" })
  .trim()
  .max(32, "Phone number is too long")
  .regex(/^[+()\d\s.-]*$/, "Enter a valid phone number");

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    phone: phoneSchema.optional().default(""),
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string({ error: "Enter your password" }).min(1, "Enter your password"),
    remember: z.boolean().optional().default(false),
  })
  .strict();

export const forgotPasswordSchema = z.object({ email: emailSchema }).strict();

export const resetPasswordSchema = z
  .object({
    token: z.string({ error: "This reset link is invalid" }).min(20, "This reset link is invalid"),
    password: passwordSchema,
  })
  .strict();

export const addressSchema = z.object({
  street: z.string().trim().max(160, "Street is too long").optional().default(""),
  city: z.string().trim().max(80, "City is too long").optional().default(""),
  zip: z.string().trim().max(20, "Postal code is too long").optional().default(""),
  country: z.string().trim().max(80, "Country is too long").optional().default(""),
});

export const updateProfileSchema = z
  .object({
    name: nameSchema,
    phone: phoneSchema.optional().default(""),
    avatar: z
      .string()
      .trim()
      .max(500, "Avatar URL is too long")
      .refine((v) => v === "" || v.startsWith("/") || v.startsWith("https://"), {
        message: "Avatar must be a relative path or an https URL",
      })
      .optional()
      .default(""),
    address: addressSchema.optional(),
    preferences: z
      .object({
        matchAlerts: z.boolean(),
        trainingReminders: z.boolean(),
        gearDrops: z.boolean(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Flattens a ZodError into `{ field: message }` for API responses.
 *
 * Each schema carries its own human-readable message (see the `error:`
 * options above), so this only needs to supply a form-level fallback and
 * translate Zod's developer-facing "Unrecognized key" message.
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (key in out) continue;

    out[key] =
      issue.code === "unrecognized_keys"
        ? "The request contained unexpected fields"
        : issue.message;
  }

  return out;
}