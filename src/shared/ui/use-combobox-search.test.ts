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
  it("with one character runs no search and stays idle", () => {
    const search = vi.fn<ComboboxSearch>();
    const { result } = renderHook(({ term }) => useComboboxSearch(search, term), {
      initialProps: { term: "c" },
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(search).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
  });

  it("debounces: ca then caf within 300 ms runs one search for caf", async () => {
    const pending = deferred();
    const search = vi.fn<ComboboxSearch>(() => pending.promise);
    const { result, rerender } = renderHook(({ term }) => useComboboxSearch(search, term), {
      initialProps: { term: "ca" },
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ term: "caf" });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(search).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(search).toHaveBeenCalledTimes(1);
    expect(search.mock.calls[0]![0]).toBe("caf");
    expect(search.mock.calls[0]![1]).toBeInstanceOf(AbortSignal);
    expect(result.current.status).toBe("loading");
    await act(async () => {
      pending.resolve(CAFES);
    });
    expect(result.current.status).toBe("success");
    expect(result.current.results).toEqual(CAFES);
  });

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

  it("a rejection that is not an abort sets error", async () => {
    const pending = deferred();
    const search = vi.fn<ComboboxSearch>(() => pending.promise);
    const { result } = renderHook(({ term }) => useComboboxSearch(search, term), {
      initialProps: { term: "caf" },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    await act(async () => {
      pending.reject(new Error("network"));
    });
    expect(result.current.status).toBe("error");
  });

  it("trims the term before the length check and the call", () => {
    const search = vi.fn<ComboboxSearch>(() => new Promise<ComboboxOption[]>(() => {}));
    const { result, rerender } = renderHook(({ term }) => useComboboxSearch(search, term), {
      initialProps: { term: " c " },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(search).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
    rerender({ term: "  caf " });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(search).toHaveBeenCalledTimes(1);
    expect(search.mock.calls[0]![0]).toBe("caf");
  });
});
