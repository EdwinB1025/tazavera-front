import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  Button,
  Link,
  Loader2,
  ArrowLeft,
  Field,
  Input,
  PasswordInput,
  Select,
  Textarea,
  Checkbox,
  RadioGroup,
  Logo,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Sheet,
  SheetTrigger,
  SheetContent,
  SidebarProvider,
  Sidebar,
  Card,
  CardAside,
  CardContent,
  CardFooter,
  Badge,
  BADGE_GEOMETRY_CLASSES as SEGMENT_BADGE_GEOMETRY_CLASSES,
  Pagination,
  PageSection,
  FlavorWheel,
} from "@/shared/ui";
// Inside `src/shared/ui` the geometry comes from `./Badge` (design.md D5):
// this is the single definition the segment entry must re-export.
import { BADGE_GEOMETRY_CLASSES } from "./Badge";

// Pagination pushes through the app router; the hook is mocked here — test
// infrastructure only.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

// jsdom has no matchMedia; the sidebar reads the md breakpoint through it.
// Test infrastructure only.
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

/**
 * Segment-entry smoke test (design.md "Files" table: `src/shared/ui/index.ts`
 * is the segment entry exporting Button, Link and the icon module).
 *
 * Written before the entry exists (task 5.1); the import from `@/shared/ui`
 * fails to resolve until `src/shared/ui/index.ts` is created in task 5.2, so
 * the file runs and fails as required.
 */
describe("shared/ui segment entry (@/shared/ui)", () => {
  it("renders both action controls exported from the segment", () => {
    render(
      <>
        <Button>Save</Button>
        <Link href="/home">Home</Link>
      </>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Home" })).toBeDefined();
  });

  it("re-exports the icon module", () => {
    expect(Loader2).toBeDefined();
    expect(ArrowLeft).toBeDefined();
  });

  it("renders the field control exported from the segment", () => {
    render(
      <Field label="E-mail" error="Enter a valid e-mail">
        <input aria-label="E-mail address" />
      </Field>,
    );
    expect(
      screen.getByRole("textbox", { name: "E-mail address" }),
    ).toBeDefined();
    expect(screen.getByText("Enter a valid e-mail")).toBeDefined();
  });

  it("renders the text input exported from the segment", () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole("textbox", { name: "Name" })).toBeDefined();
  });

  it("renders the password input exported from the segment", () => {
    render(
      <PasswordInput
        aria-label="Password"
        showPasswordLabel="Reveal the secret"
        hidePasswordLabel="Mask the secret"
      />,
    );
    expect(screen.getByLabelText("Password")).toBeDefined();
  });

  it("renders the select exported from the segment", () => {
    render(
      <Select aria-label="Size">
        <option value="m">Medium</option>
      </Select>,
    );
    expect(screen.getByRole("combobox", { name: "Size" })).toBeDefined();
  });

  it("renders the textarea exported from the segment", () => {
    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole("textbox", { name: "Notes" })).toBeDefined();
  });

  it("renders the checkbox exported from the segment", () => {
    render(<Checkbox label="Accept terms" />);
    expect(
      screen.getByRole("checkbox", { name: "Accept terms" }),
    ).toBeDefined();
  });

  it("renders the radio group exported from the segment", () => {
    render(
      <RadioGroup
        legend="Grind"
        options={[{ value: "whole", label: "Whole bean" }]}
      />,
    );
    expect(screen.getByRole("radio", { name: "Whole bean" })).toBeDefined();
  });

  it("renders the brand logotype exported from the segment", () => {
    render(<Logo variant="inline" size={32} locale="es" />);
    expect(screen.getByText("TAZAVERA")).toBeDefined();
    expect(screen.getByRole("link", { name: "TAZAVERA" })).toBeDefined();
  });

  it("renders the dropdown menu exported from the segment", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Entry</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toBeDefined();
  });

  it("renders the sheet exported from the segment", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="left">Panel</SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toBeDefined();
  });

  it("renders the sidebar exported from the segment", () => {
    render(
      <SidebarProvider>
        <Sidebar>Navigation</Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByText("Navigation")).toBeDefined();
  });

  it("renders the card exported from the segment", () => {
    render(
      <Card>
        <CardAside>SCORE 84.25</CardAside>
        <CardContent>COFFEE NAME</CardContent>
        <CardFooter>FOOTER ACTIONS</CardFooter>
      </Card>,
    );
    expect(screen.getByText("SCORE 84.25")).toBeDefined();
    expect(screen.getByText("COFFEE NAME")).toBeDefined();
    expect(screen.getByText("FOOTER ACTIONS")).toBeDefined();
  });

  it("renders the badge exported from the segment", () => {
    render(<Badge variant="verified">Verified</Badge>);
    expect(screen.getByText("Verified")).toBeDefined();
  });

  it("exports the badge geometry constant from the segment", () => {
    // The geometry other compact chips import through `@/shared/ui`
    // (design.md D4) is the very value `Badge.tsx` defines.
    expect(SEGMENT_BADGE_GEOMETRY_CLASSES).toBeDefined();
    expect(SEGMENT_BADGE_GEOMETRY_CLASSES).toBe(BADGE_GEOMETRY_CLASSES);
  });

  it("renders the pagination exported from the segment", () => {
    render(
      <Pagination
        currentPage={1}
        lastPage={2}
        path="/es"
        texts={{ previousLabel: "Previous", nextLabel: "Next" }}
      />,
    );
    expect(screen.getByRole("button", { name: "Next" })).toBeDefined();
  });

  it("renders the page section exported from the segment", () => {
    render(<PageSection>SECTION CONTENT</PageSection>);
    expect(screen.getByText("SECTION CONTENT")).toBeDefined();
  });

  it("renders the flavor wheel exported from the segment", () => {
    render(
      <FlavorWheel
        nodes={[
          {
            id: "fruity",
            name: "Fruity",
            description: null,
            color: "#da1d23",
            level: 0,
            count: 4,
            countLabel: "4 of 5 evaluators",
            children: [],
          },
        ]}
        total={5}
        texts={{ label: "Flavor wheel", hint: "Hint", emptyMessage: "Empty" }}
      />,
    );
    expect(
      screen.getByRole("treeitem", { name: "Fruity, 4 of 5 evaluators" }),
    ).toBeDefined();
  });
});
