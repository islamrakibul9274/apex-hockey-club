// Exit status only: never prints a provider credential.
import { existsSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const name = process.argv[2];
if (!["STRIPE_SECRET_KEY", "GROQ_API_KEY"].includes(name)) process.exit(2);
process.exit(process.env[name]?.trim() ? 0 : 1);
