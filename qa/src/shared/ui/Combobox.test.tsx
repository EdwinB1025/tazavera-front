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

  it("focus stays on the input while the popup is open", () => {
    render(local());
    input().focus();
    type("fin");
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(document.activeElement).toBe(input());
  });

  it("the chosen value's option shows the check icon", () => {
    render(local({ value: FINCAS[0]! }));
    type("fin");
    const [chosen, other] = screen.getAllByRole("option");
    expect(chosen!.querySelector("svg")).not.toBeNull();
    expect(other!.querySelector("svg")).toBeNull();
  });

  it("emptying the input and pressing Enter with a value reports null", () => {
    const onChange = vi.fn();
    render(local({ value: FINCAS[0]!, onChange }));
    type("");
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(null);
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

describe("Combobox — abandoned text (refine-facet-controls design.md D2)", () => {
  it("Escape with the popup closed restores the label in search mode", () => {
    render(
      <Combobox
        label="Roaster"
        search={vi.fn<ComboboxSearch>(async () => [])}
        value={{ value: "1", label: "Café Uno" }}
        onChange={() => {}}
        texts={TEXTS}
      />,
    );
    const box = screen.getByRole("combobox", { name: "Roaster" }) as HTMLInputElement;
    fireEvent.change(box, { target: { value: "c" } });
    expect(box.getAttribute("aria-expanded")).toBe("false");
    fireEvent.keyDown(box, { key: "Escape" });
    expect(box.value).toBe("Café Uno");
    expect(box.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("Combobox — search mode", () => {

  function searchInput(): HTMLInputElement {
    return screen.getByRole("combobox", { name: "Roaster" }) as HTMLInputElement;
  }

  describe("only typed text searches (refine-facet-controls design.md D3)", () => {
    const UNO = { value: "1", label: "Café Uno" };

    function withValue(search: ComboboxSearch, value: ComboboxOption | null) {
      return <Combobox label="Roaster" search={search} value={value} onChange={() => {}} texts={TEXTS} />;
    }

    it("after a restore, typed text searches again", () => {
      vi.useFakeTimers();
      const search = vi.fn<ComboboxSearch>(async () => []);
      render(withValue(search, UNO));
      fireEvent.change(searchInput(), { target: { value: "zz" } });
      fireEvent.keyDown(searchInput(), { key: "Escape" });
      search.mockClear();
      fireEvent.change(searchInput(), { target: { value: "ca" } });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(search).toHaveBeenCalledTimes(1);
      expect(search.mock.calls[0]![0]).toBe("ca");
    });
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

describe("Combobox — search mode inside a Field (spec keyboard and pointer choice)", () => {
  const RESULTS: ComboboxOption[] = [
    { value: "1", label: "Café Uno" },
    { value: "2", label: "Café Dos" },
  ];

  async function typeAndLoad(onChange: (option: ComboboxOption | null) => void) {
    vi.useFakeTimers();
    let resolve!: (options: ComboboxOption[]) => void;
    const search = vi.fn<ComboboxSearch>(
      () => new Promise<ComboboxOption[]>((res) => (resolve = res)),
    );
    render(
      <Field label="Coffee" required help="Field help">
        <Combobox label="Coffee" search={search} value={null} onChange={onChange} texts={TEXTS} />
      </Field>,
    );
    const box = screen.getByRole("combobox", { name: "Coffee" }) as HTMLInputElement;
    act(() => box.focus());
    fireEvent.change(box, { target: { value: "caf" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    await act(async () => {
      resolve(RESULTS);
    });
    return box;
  }

  it("when results render, the input keeps focus, its text and the open list", async () => {
    const box = await typeAndLoad(() => {});
    expect(document.activeElement).toBe(box);
    expect(box.value).toBe("caf");
    expect(box.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getAllByRole("option")).toHaveLength(2);
    const label = screen.getByText("Coffee");
    expect(label.getAttribute("for")).toBe(box.id);
    expect(box.getAttribute("aria-describedby")).toBe(screen.getByText("Field help").id);
  });

  it("a click on a result chooses it", async () => {
    const onChange = vi.fn();
    const box = await typeAndLoad(onChange);
    fireEvent.click(screen.getByRole("option", { name: /Café Dos/ }));
    expect(onChange).toHaveBeenCalledWith(RESULTS[1]);
    expect(box.value).toBe("Café Dos");
  });

  it("ArrowDown, Enter chooses the first result", async () => {
    const onChange = vi.fn();
    const box = await typeAndLoad(onChange);
    fireEvent.keyDown(box, { key: "ArrowDown" });
    fireEvent.keyDown(box, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(RESULTS[0]);
    expect(box.value).toBe("Café Uno");
  });
});
