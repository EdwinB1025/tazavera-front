import { describe, it, expect, beforeEach } from "vitest";
import {
  previousUrl,
  recordNavigation,
  resetNavigationHistory,
} from "@/shared/lib/navigation-history";

/**
 * The navigation record behind the back link (fix-production-aut-findings
 * design.md D5; the base-controls spec "Back link to the previous page"). One
 * case per scenario; "No previous page" is covered by `BackLink.test.tsx`.
 */

beforeEach(() => {
  resetNavigationHistory();
});

describe("navigation history (design.md D5)", () => {
  it("keeps the page the user came from, with its query (spec: Back to the previous page)", () => {
    recordNavigation("/es/offerings?page=2");
    recordNavigation("/es/offerings/01A");
    expect(previousUrl()).toBe("/es/offerings?page=2");
  });

  it("keeps the previous page when only the query of the page in view changes (spec: Query changes on the page in view)", () => {
    recordNavigation("/es/offerings?page=2");
    recordNavigation("/es/offerings/01A");
    recordNavigation("/es/offerings/01A?tab=consensus");
    expect(previousUrl()).toBe("/es/offerings?page=2");
  });

  it("keeps the previous page in the new language (spec: Language change)", () => {
    recordNavigation("/es/offerings?page=2");
    recordNavigation("/es/offerings/01A");
    recordNavigation("/es/offerings/01A?tab=consensus");
    recordNavigation("/en/offerings/01A?tab=consensus");
    expect(previousUrl()).toBe("/en/offerings?page=2");
  });
});
