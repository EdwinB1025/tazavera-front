/**
 * The write scope of a granted step-up (scope-write-token-to-action design.md
 * D4; spec "Step-up to the write scope"): the write grant lasts only the action
 * that asked for it, and ending the action puts the read grant back in use
 * with no request.
 */
import { useEffect } from "react";
import { restoreReadTokens } from "@/shared/api";

/** Ends the action: the write grant is discarded and the read grant is in use again. */
export function endProfileWrite(): void {
  restoreReadTokens();
}

/** The mounted consumers that hold the write scope open. */
let activeScopes = 0;

/**
 * Holds the write scope open while `active` and ends it when `active` is
 * `false` or the last active consumer unmounts. The unmount end runs in a
 * microtask and is skipped when another active consumer mounted meanwhile
 * (React's development double mount, or a hand-over between two write views
 * in the same commit).
 */
export function useProfileWriteScope(active: boolean): void {
  useEffect(() => {
    if (!active) {
      endProfileWrite();
      return;
    }
    activeScopes += 1;
    return () => {
      activeScopes -= 1;
      queueMicrotask(() => {
        if (activeScopes === 0) endProfileWrite();
      });
    };
  }, [active]);
}
