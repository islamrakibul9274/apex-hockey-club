/**
 * Centralised environment access.
 *
 * Secrets fail CLOSED. A missing AUTH_SECRET must never silently fall back to a
 * value that lives in a public repository, because anyone could then mint a
 * token for any user with any role.
 */

const REQUIRED_SECRETS = ["AUTH_SECRET", "MONGODB_URI"] as const;
void REQUIRED_SECRETS;

export class MissingEnvError extends Error {
  constructor(name: string) {
    super(
      `Missing required environment variable ${name}. ` +
        `Refusing to continue — falling back to a default would make authentication forgeable.`
    );
    this.name = "MissingEnvError";
  }
}

/** Returns a required secret or throws. Never returns a fallback. */
export function requireEnv(name: (typeof REQUIRED_SECRETS)[number]): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new MissingEnvError(name);
  }
  return value;
}

/** Returns a secret, or undefined when absent. Only for optional integrations. */
export function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * The canonical origin used for auth callbacks and reset links.
 * Configured on Netlify as AUTH_URL.
 */
export function authUrl(): string {
  return optionalEnv("AUTH_URL") ?? "http://localhost:3000";
}