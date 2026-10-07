import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useComboboxSearch } from "@/shared/ui/use-combobox-search";
import type { ComboboxOption, ComboboxSearch } from "@/shared/ui/use-combobox-search";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/**
 * Combobox search hook (spec filtering "Combobox"; design.md D9): at least 2
 * trimmed characters, 300 ms after the last change, the older search
 * aborted, a non-abort rejection reported as an error.
 */

type Deferred = {
  promise: Promise<ComboboxOption[]>;
  resolve: (options: ComboboxOption[]) => void;
  reject: (error: unknown) => void;
};

function deferred(): Deferred {
  let resolve!: Deferred["resolve"];
  let reject!: Deferred["reject"];
  const promise = new Promise<ComboboxOption[]>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const CAFE: ComboboxOption[] = [{ value: "1", label: "Café Uno" }];
const CAFES: ComboboxOption[] = [
  { value: "1", label: "Café Uno" },
  { value: "2", label: "Café Dos" },
];

describe("useComboboxSearch", () => {
  it("a newer search aborts the pending one and only its results are kept", async () => {
    const first = deferred();
    const second = deferred();
    const search = vi
      .fn<ComboboxSearch>()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    const { result, rerender } = renderHook(({ term }) => useComboboxSearch(search, term), {
      initialProps: { term: "caf" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    const firstSignal = search.mock.calls[0]![1];
    rerender({ term: "cafe" });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(search).toHaveBeenCalledTimes(2);
    expect(firstSignal.aborted).toBe(true);
    await act(async () => {
      second.resolve(CAFE);
    });
    await act(async () => {
      first.resolve(CAFES);
    });
    expect(result.current.status).toBe("success");
    expect(result.current.results).toEqual(CAFE);
  });
});
