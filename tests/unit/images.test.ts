import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Guards against referencing images that do not exist.
 *
 * Nine such references survived a commit and silently 404'd — including the
 * carousel, which rendered the hero as a black box because the database still
 * pointed at deleted PNGs.
 */
function collectFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe("image references", () => {
  const files = collectFiles("src");
  const references: { file: string; ref: string }[] = [];

  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    // Literal /images/... strings only; template-built paths are resolved at
    // runtime by src/lib/images.ts and checked by its own tests.
    // exec() rather than matchAll(): tsconfig targets es5.
    const pattern = /["'`](\/images\/[^"'`$\s]+)["'`]/g;
    let match: RegExpExecArray | null = pattern.exec(src);
    while (match !== null) {
      references.push({ file, ref: match[1] });
      match = pattern.exec(src);
    }
  }

  it("found image references to check", () => {
    expect(references.length).toBeGreaterThan(0);
  });

  it.each(references.map((r) => [r.file, r.ref]))(
    "%s references an existing file: %s",
    (file, ref) => {
      const onDisk = path.join("public", ref);
      expect(
        fs.existsSync(onDisk),
        `${file} references ${ref}, which does not exist`
      ).toBe(true);
    }
  );

  it("the manifest generates paths that exist", () => {
    const keys = ["hero-action", "hero-puck", "arena-empty", "team-action"];
    const roles = ["wide", "card", "thumb"];
    for (const key of keys) {
      for (const role of roles) {
        expect(
          fs.existsSync(path.join("public", "images", `${key}-${role}.webp`)),
          `images/${key}-${role}.webp is referenced by the manifest but missing`
        ).toBe(true);
      }
    }
  });
});
