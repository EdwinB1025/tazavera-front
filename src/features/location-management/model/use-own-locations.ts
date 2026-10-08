"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { readOwnLocations } from "../api/locations";
import type { ListState } from "./types";

export type OwnLocations = {
  list: ListState;
  /** Reads the list again through the loading state. */
  reload: () => void;
  /** False once the panel has unmounted. */
  mounted: RefObject<boolean>;
};

/** The session user's locations, read on mount (design.md D3). */
export function useOwnLocations(userUlid: string): OwnLocations {
  const mounted = useRef(true);
  const [list, setList] = useState<ListState>({ status: "loading" });

  const read = useCallback(async (): Promise<void> => {
    const next = await readOwnLocations(userUlid);
    if (mounted.current) setList(next);
  }, [userUlid]);

  useEffect(() => {
    mounted.current = true;
    void read();
    return () => {
      mounted.current = false;
    };
  }, [read]);

  function reload(): void {
    setList({ status: "loading" });
    void read();
  }

  return { list, reload, mounted };
}
