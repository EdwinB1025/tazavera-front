import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  DescriptorChipGroup,
  type ChipRow,
} from "@/shared/ui/DescriptorChipGroup";
import { Badge, BADGE_GEOMETRY_CLASSES } from "./Badge";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * Descriptor chip group tests (the `form-fields` spec "Descriptor chip
 * group"; design.md D2, D6, D7). Written before the component body exists
 * (task 4.1): `DescriptorChipGroup` is not exported yet, so the file runs and
 * fails as required.
 *
 * jsdom has no CSS engine: the chip shells are asserted through their exact
 * classes, the chip content against `BADGE_GEOMETRY_CLASSES` and a reference
 * taxonomy `Badge`, the contract through roles, attributes and focus.
 */

const ROWS: ChipRow[] = [
  {
    id: "fruity",
    title: "Fruity",
    options: [
      { value: "01BERRY", label: "Berry", color: "#8B1E3F", level: 1 },
      { value: "01CITRUS", label: "Citrus", color: "#F2C14E", level: 1 },
    ],
  },
  {
    id: "shared",
    options: [{ value: "01NUTTY", label: "Nutty", color: "#7A4E2D", level: 0 }],
  },
];

function chip(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

function tokensOf(element: Element): string[] {
  return element.getAttribute("class")!.split(/\s+/).filter(Boolean);
}

function renderGroup(
  props: Partial<{
    value: string[];
    help: string;
    error: string;
    disabled: boolean;
  }> = {},
  onValueChange = vi.fn(),
) {
  return render(
    <DescriptorChipGroup
      legend="Aroma descriptors"
      rows={ROWS}
      value={props.value ?? []}
      onValueChange={onValueChange}
      help={props.help}
      error={props.error}
      disabled={props.disabled}
    />,
  );
}

describe("DescriptorChipGroup", () => {
  describe("toggling (spec: Toggling a descriptor)", () => {
    it("renders each option as a button exposing aria-pressed", () => {
      renderGroup({ value: ["01CITRUS"] });
      expect(screen.getAllByRole("button")).toHaveLength(3);
      expect(chip("Berry").getAttribute("aria-pressed")).toBe("false");
      expect(chip("Citrus").getAttribute("aria-pressed")).toBe("true");
      expect(chip("Nutty").getAttribute("aria-pressed")).toBe("false");
    });

    it("adds an option to the chosen set when its chip is activated", () => {
      const onValueChange = vi.fn();
      renderGroup({ value: ["01CITRUS"] }, onValueChange);
      fireEvent.click(chip("Nutty"));
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith(["01CITRUS", "01NUTTY"]);
    });

    it("removes a chosen option when its chip is activated", () => {
      const onValueChange = vi.fn();
      renderGroup({ value: ["01CITRUS", "01NUTTY"] }, onValueChange);
      fireEvent.click(chip("Citrus"));
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith(["01NUTTY"]);
    });
  });

  describe("unselected chip (spec: Unselected chip, design.md D6)", () => {
    it("is the border shell around the badge geometry, a data-color dot and the label in text-text-strong", () => {
      renderGroup();
      const button = chip("Berry");
      for (const token of [
        "inline-flex",
        "items-center",
        "rounded-field",
        "border-2",
        "border-border-muted",
        "cursor-pointer",
        "focus-visible:focus-ring",
        "disabled:opacity-50",
        "disabled:cursor-not-allowed",
      ]) {
        expect(tokensOf(button)).toContain(token);
      }
      expect(button.children).toHaveLength(1);
      const content = button.children[0]!;
      expect(content.tagName).toBe("SPAN");
      expect(content.hasAttribute("data-taxonomy")).toBe(false);
      expect(tokensOf(content)).toEqual(BADGE_GEOMETRY_CLASSES.split(" "));
      const [dot, label] = Array.from(content.children);
      expect(tokensOf(dot!)).toEqual(["size-2", "rounded-full"]);
      expect(dot!.getAttribute("aria-hidden")).toBe("true");
      expect((dot as HTMLElement).style.backgroundColor).toBe(
        "rgb(139, 30, 63)",
      );
      expect(label!.textContent).toBe("Berry");
      expect(tokensOf(label!)).toContain("text-text-strong");
    });
  });

  describe("chosen chip (spec: Chosen chip, design.md D6)", () => {
    it("keeps the same shell and renders the option's taxonomy badge with the check mark before the label", () => {
      renderGroup({ value: ["01BERRY"] });
      const button = chip("Berry");
      expect(tokensOf(button)).toContain("border-2");
      expect(tokensOf(button)).toContain("border-border-muted");
      expect(tokensOf(button)).toContain("rounded-field");
      expect(button.children).toHaveLength(1);
      const badge = button.children[0]!;
      expect(badge.hasAttribute("data-taxonomy")).toBe(true);

      const { container: reference } = render(
        <Badge variant="taxonomy" color="#8B1E3F" level={1}>
          Berry
        </Badge>,
      );
      const referenceBadge = reference.querySelector("[data-taxonomy]")!;
      expect(badge.getAttribute("style")).toBe(
        referenceBadge.getAttribute("style"),
      );
      expect(badge.getAttribute("class")).toBe(
        referenceBadge.getAttribute("class"),
      );

      const [icon, label] = Array.from(badge.childNodes);
      expect((icon as Element).tagName.toLowerCase()).toBe("svg");
      expect((icon as Element).getAttribute("aria-hidden")).toBe("true");
      expect((icon as Element).getAttribute("class")).toContain("lucide-check");
      expect(tokensOf(icon as Element)).toContain("size-4");
      expect(tokensOf(icon as Element)).toContain("shrink-0");
      expect(label!.textContent).toBe("Berry");
    });
  });

  describe("group and row titles (spec: Group and row titles, Rows wrap)", () => {
    it("names the block by its legend, each titled row by its type-meta title, and keeps the shared row untitled", () => {
      const { container } = renderGroup();
      const block = screen.getByRole("group", { name: "Aroma descriptors" });
      expect(block.tagName).toBe("FIELDSET");
      expect(tokensOf(block.querySelector("legend")!)).toContain("type-label");

      const fruity = screen.getByRole("group", { name: "Fruity" });
      const title = document.getElementById(
        fruity.getAttribute("aria-labelledby")!,
      )!;
      expect(tokensOf(title)).toContain("type-meta");
      expect(fruity.contains(chip("Berry"))).toBe(true);
      expect(fruity.contains(chip("Citrus"))).toBe(true);
      expect(fruity.contains(chip("Nutty"))).toBe(false);
      expect(block.contains(chip("Nutty"))).toBe(true);
      expect(chip("Nutty").closest("[aria-labelledby]")).not.toBe(fruity);

      const rowsOfChips = container.querySelectorAll('[data-slot="chips"]');
      expect(rowsOfChips).toHaveLength(2);
      for (const row of rowsOfChips) {
        expect(tokensOf(row)).toEqual(["flex", "flex-wrap", "gap-2"]);
      }
    });
  });

  describe("keyboard operation (spec: Keyboard operation, design.md D7)", () => {
    it("offers a single tab stop for the block", () => {
      const { container } = renderGroup({ value: ["01CITRUS"] });
      const stops = container.querySelectorAll('[tabindex="0"]');
      expect(stops).toHaveLength(1);
      for (const name of ["Berry", "Citrus", "Nutty"]) {
        expect(chip(name).getAttribute("tabindex")).toBe("-1");
      }
      // Keyboard entry into the block lands on a chip: the primitive's
      // roving focus enters on the first chosen chip.
      (stops[0] as HTMLElement).focus();
      expect(document.activeElement).toBe(chip("Citrus"));
    });

    const cases: [string, string, string][] = [
      ["ArrowRight", "Berry", "Citrus"],
      ["ArrowDown", "Citrus", "Nutty"],
      ["ArrowRight", "Nutty", "Berry"],
      ["ArrowLeft", "Berry", "Nutty"],
      ["ArrowUp", "Nutty", "Citrus"],
      ["ArrowLeft", "Citrus", "Berry"],
    ];

    for (const [key, from, to] of cases) {
      it(`${key} on ${from} moves focus to ${to} in reading order without toggling`, () => {
        const onValueChange = vi.fn();
        renderGroup({}, onValueChange);
        chip(from).focus();
        const notPrevented = fireEvent.keyDown(chip(from), { key });
        expect(notPrevented).toBe(false);
        expect(document.activeElement).toBe(chip(to));
        expect(chip(to).getAttribute("tabindex")).toBe("0");
        expect(chip(from).getAttribute("tabindex")).toBe("-1");
        expect(onValueChange).not.toHaveBeenCalled();
      });
    }

    it("leaves Space to the native button, which toggles the chip", () => {
      renderGroup();
      const button = chip("Berry");
      expect(button.tagName).toBe("BUTTON");
      expect(button.getAttribute("type")).toBe("button");
      expect(fireEvent.keyDown(button, { key: " " })).toBe(true);
    });
  });

  describe("own-field contract (spec: Help and error, Error state)", () => {
    it("renders help in type-meta and error in type-error, wired to the fieldset help first, with aria-invalid", () => {
      renderGroup({ help: "Choose any", error: "Choose at least one" });
      const block = screen.getByRole("group", { name: "Aroma descriptors" });
      const help = screen.getByText("Choose any");
      const error = screen.getByText("Choose at least one");
      expect(tokensOf(help)).toContain("type-meta");
      expect(tokensOf(error)).toContain("type-error");
      expect(block.getAttribute("aria-describedby")).toBe(
        `${help.id} ${error.id}`,
      );
      expect(block.getAttribute("aria-invalid")).toBe("true");
    });

    it("renders and wires nothing for empty help and error strings", () => {
      const { container } = renderGroup({ help: "", error: "" });
      const block = screen.getByRole("group", { name: "Aroma descriptors" });
      expect(block.hasAttribute("aria-describedby")).toBe(false);
      expect(block.hasAttribute("aria-invalid")).toBe(false);
      expect(container.querySelector("p")).toBeNull();
    });
  });

  describe("disabled (spec: Data-entry control states)", () => {
    it("disables every chip", () => {
      renderGroup({ disabled: true });
      for (const name of ["Berry", "Citrus", "Nutty"]) {
        expect(chip(name).hasAttribute("disabled")).toBe(true);
        expect(chip(name).className).toContain("disabled:opacity-50");
        expect(chip(name).className).toContain("disabled:cursor-not-allowed");
      }
    });
  });

  describe("read-only display (spec: Read-only display)", () => {
    it("renders only the chosen options as plain taxonomy badges in their rows, omitting empty rows, with no button", () => {
      const { container } = render(
        <DescriptorChipGroup
          legend="Aroma descriptors"
          rows={ROWS}
          value={["01CITRUS"]}
          emptyText="Nothing chosen"
          readOnly
        />,
      );
      expect(container.querySelectorAll("button")).toHaveLength(0);
      const badges = container.querySelectorAll("[data-taxonomy]");
      expect(badges).toHaveLength(1);
      expect(badges[0]!.textContent).toBe("Citrus");
      expect(badges[0]!.querySelector("svg")).toBeNull();
      const fruity = screen.getByRole("group", { name: "Fruity" });
      expect(fruity.contains(badges[0]!)).toBe(true);
      expect(screen.queryByText("Berry")).toBeNull();
      expect(screen.queryByText("Nutty")).toBeNull();
      expect(container.querySelectorAll('[data-slot="chips"]')).toHaveLength(1);
      expect(screen.queryByText("Nothing chosen")).toBeNull();
    });

    it("renders the empty text when nothing is chosen", () => {
      const { container } = render(
        <DescriptorChipGroup
          legend="Aroma descriptors"
          rows={ROWS}
          value={[]}
          emptyText="Nothing chosen"
          readOnly
        />,
      );
      expect(screen.getByText("Nothing chosen")).toBeDefined();
      expect(container.querySelectorAll("[data-taxonomy]")).toHaveLength(0);
      expect(container.querySelectorAll('[data-slot="chips"]')).toHaveLength(0);
      expect(container.querySelectorAll("button")).toHaveLength(0);
    });
  });

  describe("type contract (design.md D2)", () => {
    it("rejects a missing onValueChange without readOnly", () => {
      // `npx tsc --noEmit` fails (TS2578, unused directive) if the case ever
      // becomes accepted.
      render(
        // @ts-expect-error onValueChange required without readOnly
        <DescriptorChipGroup legend="Aroma" rows={ROWS} value={[]} />,
      );
      expect(screen.getAllByRole("button")).toHaveLength(3);
    });
  });
});
