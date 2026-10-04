import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
// Top-level import: the file fails to load until `messages.ts` exists (task
// 6.2), which is the expected state of task 6.1.
import { getMessages } from "@/shared/lib/i18n/messages";

/**
 * Message loading contract (design.md D10). One catalog per area and locale
 * at `messages/{locale}/{area}.json`; `messages.ts` returns one area's catalog
 * for a locale and rejects a locale the application does not support. Written
 * before the module exists (task 6.2); the import fails to resolve until
 * then, so the file runs and fails as required.
 */
describe("message catalogs (design.md D10)", () => {
  it("returns one area's catalog for a locale", () => {
    const catalog = getMessages("shell", "ca");
    const onDisk = JSON.parse(
      readFileSync(
        pathResolve(process.cwd(), "messages/ca/shell.json"),
        "utf-8",
      ),
    ) as Record<string, string>;
    expect(catalog).toEqual(onDisk);
  });

  it("rejects an unsupported locale", () => {
    expect(() => getMessages("shell", "fr")).toThrow();
  });
});
