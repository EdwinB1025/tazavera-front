"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { completeCallback } from "@/features/auth";

/**
 * The callback screen (design.md D4 and D6; spec "Return through the
 * callback"). It renders no text and no status region: whatever the outcome the
 * page shows nothing, and the result is completed or forwarded through
 * `completeCallback` — posted to the front's origin when the window has its
 * opener, completed here otherwise, the return route then opening through the
 * App Router's `replace` in place of the `/callback` entry.
 */
export function CallbackScreen({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const router = useRouter();

  useEffect(() => {
    void completeCallback(searchParams, router.replace);
  }, [searchParams, router]);

  return null;
}
