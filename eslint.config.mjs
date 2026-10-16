import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

/**
 * ESLint 9 flat config.
 *
 * Replaces .eslintrc.json. Next 16 removed `next lint`, so the lint script is
 * now a direct `eslint .` call and this file is the whole configuration.
 *
 * The rules below carry over unchanged from the .eslintrc.json they replace.
 */
export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "@next/next/no-img-element": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "react/no-unescaped-entities": "off",
    },
  },
  {
    // Scripts and tests were never linted under the old config, and the
    // migration scripts use loose types against the driver. Keeping the
    // previous behaviour rather than silently expanding scope.
    ignores: ["scripts/**", "tests/**"],
  }
);