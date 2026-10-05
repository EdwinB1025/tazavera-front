"use client";

import { useEffect } from "react";
import { completeCallback } from "@/features/auth";

/**
 * The callback screen (design.md D4 and D6; spec "Return through the
 * callback"). It renders no text and no status region: whatever the outcome the
 * page shows nothing, and the result is completed or forwarded through
 * `completeCallback` — posted to the front's origin when the window has its
 * opener, completed here otherwise.
 */
export function CallbackScreen({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  useEffect(() => {
    void completeCallback(searchParams);
  }, [searchParams]);

  return null;
}
