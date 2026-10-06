import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { Combobox, Field, type ComboboxOption, type ComboboxSearch } from "@/shared/ui";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// jsdom lacks ResizeObserver (Radix popper, cmdk list) and scrollIntoView
// (cmdk scrolls the active option into view). Test-only stubs.
beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

/**
 * Combobox (spec filtering "Combobox"; design.md D9): cmdk Command with the
 * project Input as its input, Radix Popover popup, the aria-expanded and
 * label `for` workaround, local filtering and search mode.
 */

const TEXTS = {
  searching: "Searching…",
  noMatches: "No matches",
  loadError: "Results could not be loaded",
  optionCount: "Options: {count}",
};

const FINCAS: ComboboxOption[] = [
  { value: "a", label: "Finca A" },
  { value: "b", label: "Finca B", detail: "Huila" },
  { value: "c", label: "Lomas" },
];

function local(
  props: Partial<{
    value: ComboboxOption | null;
    onChange: (option: ComboboxOption | null) => void;
    variant: "default" | "inverse";
    disabled: boolean;
    help: string;
  }> = {},
) {
  return (
    <Combobox
      label="Producer"
      options={FINCAS}
      value={props.value ?? null}
      onChange={props.onChange ?? (() => {})}
      variant={props.variant}
      disabled={props.disabled}
      help={props.help}
      texts={TEXTS}
    />
  );
}

function input(): HTMLInputElement {
  return screen.getByRole("combobox", { name: "Producer" }) as HTMLInputElement;
}

function type(text: string): void {
  fireEvent.change(input(), { target: { value: text } });
}

describe("Combobox — local mode", () => {
  it("is a combobox named by its visible label, collapsed", () => {
    render(local());
    const box = input();
    const label = screen.getByText("Producer", { selector: "label:not([cmdk-label])" });
    expect(label.getAttribute("for")).toBe(box.id);
    expect(box.getAttribute("aria-expanded")).toBe("false");
  });

  it("typing opens the popup with the matching options and bold match", () => {
    render(local());
    type("fin");
    const box = input();
    expect(box.getAttribute("aria-expanded")).toBe("true");
    const options = screen.getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["Finca A", "Finca BHuila"]);
    expect(options[0]!.querySelector("strong")!.textContent).toBe("Fin");
    expect(box.getAttribute("aria-controls")).toBe(screen.getByRole("listbox").id);
  });

  it("ArrowDown, ArrowDown, Enter chooses Finca B and closes", () => {
    const onChange = vi.fn();
    render(local({ onChange }));
    type("fin");
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(FINCAS[1]);
    expect(input().value).toBe("Finca B");
    expect(input().getAttribute("aria-expanded")).toBe("false");
  });

  it("with three options shown, ArrowDown, ArrowDown, Enter chooses the second", () => {
    const three: ComboboxOption[] = [
      { value: "1", label: "Finca Uno" },
      { value: "2", label: "Finca Dos" },
      { value: "3", label: "Finca Tres" },
    ];
    const onChange = vi.fn();
    render(
      <Combobox label="Producer" options={three} value={null} onChange={onChange} texts={TEXTS} />,
    );
    type("finca");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(three[1]);
    expect(input().value).toBe("Finca Dos");
    expect(input().getAttribute("aria-expanded")).toBe("false");
  });

  it("Escape closes the popup", () => {
    render(local());
    type("fin");
    fireEvent.keyDown(input(), { key: "Escape" });
    expect(input().getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("focus stays on the input while the popup is open", () => {
    render(local());
    input().focus();
    type("fin");
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(document.activeElement).toBe(input());
  });

  it('no match shows "No matches" and no option', () => {
    render(local());
    type("zz");
    expect(screen.getByText("No matches", { selector: "[role=presentation]" })).toBeTruthy();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("the chosen value's option shows the check icon", () => {
    render(local({ value: FINCAS[0]! }));
    type("fin");
    const [chosen, other] = screen.getAllByRole("option");
    expect(chosen!.querySelector("svg")).not.toBeNull();
    expect(other!.querySelector("svg")).toBeNull();
  });

  it("emptying the input and blurring with a value reports null", () => {
    const onChange = vi.fn();
    render(local({ value: FINCAS[0]!, onChange }));
    expect(input().value).toBe("Finca A");
    type("");
    fireEvent.blur(input());
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("while open, the popup carries exactly the D9 popup classes", () => {
    render(local());
    type("fin");
    const popup = screen.getByRole("listbox").parentElement!;
    expect(popup.getAttribute("class")!.split(/\s+/).sort()).toEqual(
      [
        "z-50",
        "w-(--radix-popover-trigger-width)",
        "max-h-60",
        "overflow-y-auto",
        "rounded-field",
        "border",
        "border-border-strong",
        "bg-nav-surface",
        "p-1",
        "text-nav-text",
        "shadow-md",
      ].sort(),
    );
  });

  it("emptying the input and pressing Enter with a value reports null", () => {
    const onChange = vi.fn();
    render(local({ value: FINCAS[0]!, onChange }));
    type("");
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("variant inverse puts the input's inverse classes on it, default does not", () => {
    const { rerender } = render(local({ variant: "inverse" }));
    expect(input().className).toContain("variant-inverse");
    expect(input().className).toContain("bg-transparent");
    rerender(local({ variant: "default" }));
    expect(input().className).not.toContain("variant-inverse");
    expect(input().className).toContain("bg-surface-input");
  });

  it("disabled with help disables the input and wires the help", () => {
    render(local({ disabled: true, help: "Options unavailable" }));
    expect(input().disabled).toBe(true);
    const help = screen.getByText("Options unavailable");
    expect(input().getAttribute("aria-describedby")).toBe(help.id);
  });

  it("option rows render the detail line when given", () => {
    render(local());
    type("finca b");
    const option = screen.getByRole("option");
    expect(option.querySelector(".type-option")!.textContent).toBe("Finca B");
    expect(option.querySelector(".type-option-detail")!.textContent).toBe("Huila");
  });
});

describe("Combobox — search mode", () => {
  function searchBox(search: ComboboxSearch) {
    return (
      <Combobox label="Roaster" search={search} value={null} onChange={() => {}} texts={TEXTS} />
    );
  }

  function searchInput(): HTMLInputElement {
    return screen.getByRole("combobox", { name: "Roaster" }) as HTMLInputElement;
  }

  it("searches after 300 ms and shows Searching… while pending, then the rows", async () => {
    vi.useFakeTimers();
    let resolve!: (options: ComboboxOption[]) => void;
    const search = vi.fn<ComboboxSearch>(
      () => new Promise<ComboboxOption[]>((res) => (resolve = res)),
    );
    render(searchBox(search));
    fireEvent.change(searchInput(), { target: { value: "caf" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(search).toHaveBeenCalledTimes(1);
    expect(search.mock.calls[0]![0]).toBe("caf");
    expect(search.mock.calls[0]![1]).toBeInstanceOf(AbortSignal);
    expect(screen.getByText("Searching…", { selector: "[role=presentation]" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("Searching…");
    await act(async () => {
      resolve([
        { value: "1", label: "Café Uno" },
        { value: "2", label: "Café Dos" },
      ]);
    });
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.queryByText("Searching…", { selector: "[role=presentation]" })).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Options: 2");
  });

  it('a rejection shows "Results could not be loaded"', async () => {
    vi.useFakeTimers();
    let reject!: (error: unknown) => void;
    const search = vi.fn<ComboboxSearch>(
      () => new Promise<ComboboxOption[]>((_, rej) => (reject = rej)),
    );
    render(searchBox(search));
    fireEvent.change(searchInput(), { target: { value: "caf" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    await act(async () => {
      reject(new Error("network"));
    });
    expect(
      screen.getByText("Results could not be loaded", { selector: "[role=presentation]" }),
    ).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("Results could not be loaded");
  });

  it("one character makes no call", () => {
    vi.useFakeTimers();
    const search = vi.fn<ComboboxSearch>();
    render(searchBox(search));
    fireEvent.change(searchInput(), { target: { value: "c" } });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(search).not.toHaveBeenCalled();
  });
});

describe("Combobox — inside a Field (design.md D14)", () => {
  function inField(error?: string) {
    return (
      <Field label="Coffee" required help="Field help" error={error}>
        <Combobox
          label="Coffee"
          options={FINCAS}
          value={null}
          onChange={() => {}}
          help="Own help"
          texts={TEXTS}
        />
      </Field>
    );
  }

  it("shows one label, which names the input, and only the Field's help", () => {
    render(inField());
    expect(screen.getAllByText("Coffee")).toHaveLength(1);
    const box = screen.getByRole("combobox", { name: "Coffee" });
    const label = screen.getByText("Coffee");
    expect(label.getAttribute("for")).toBe(box.id);
    const help = screen.getByText("Field help");
    expect(box.getAttribute("aria-describedby")).toBe(help.id);
    expect(screen.queryByText("Own help")).toBeNull();
    expect(box.hasAttribute("required")).toBe(true);
  });

  it("with an error, the input is described by the help and the error", () => {
    render(inField("Choose a coffee"));
    expect(screen.getAllByText("Coffee")).toHaveLength(1);
    const box = screen.getByRole("combobox", { name: "Coffee" });
    const help = screen.getByText("Field help");
    const error = screen.getByText("Choose a coffee");
    expect(box.getAttribute("aria-describedby")?.split(" ")).toEqual([help.id, error.id]);
    expect(box.getAttribute("aria-invalid")).toBe("true");
    expect(screen.queryByText("Own help")).toBeNull();
  });
});
