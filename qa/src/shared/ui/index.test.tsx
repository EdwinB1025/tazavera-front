import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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
  useSidebar,
  SIDEBAR_ID,
  Card,
  CardAside,
  CardContent,
  CardFooter,
  Badge,
  BADGE_GEOMETRY_CLASSES as SEGMENT_BADGE_GEOMETRY_CLASSES,
  Pagination,
  PageSection,
  Collapsible,
  CollapsibleHeader,
  CollapsibleBody,
  FlavorWheel,
  BeanScale,
  IntensitySlider,
  DescriptorChipGroup,
  ConfirmDialog,
  LabelValueRow,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  LoadingStatus,
  FormStatus,
  StepUpNotice,
  SessionGate,
  SignedOutPrompt,
  ViewToggle,
  LocationsMapLoader,
} from "@/shared/ui";
// Inside `src/shared/ui` the geometry comes from `./Badge` (design.md D5):
// this is the single definition the segment entry must re-export.
import { BADGE_GEOMETRY_CLASSES } from "@/shared/ui/Badge";

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

  it("exports the sidebar hook and id from the segment (design.md D3)", () => {
    expect(typeof useSidebar).toBe("function");
    expect(typeof SIDEBAR_ID).toBe("string");
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
        texts={{
          navigationLabel: "Pagination",
          previousLabel: "Previous",
          nextLabel: "Next",
          pageLabel: "Page {page}",
        }}
      />,
    );
    expect(screen.getByRole("button", { name: "Next" })).toBeDefined();
  });

  it("renders the page section exported from the segment", () => {
    render(<PageSection>SECTION CONTENT</PageSection>);
    expect(screen.getByText("SECTION CONTENT")).toBeDefined();
  });

  it("renders the collapsible section exported from the segment", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleHeader>SECTION TITLE</CollapsibleHeader>
        <CollapsibleBody>SECTION BODY</CollapsibleBody>
      </Collapsible>,
    );
    expect(screen.getByRole("button", { name: "SECTION TITLE" })).toBeDefined();
    expect(screen.getByText("SECTION BODY")).toBeDefined();
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
        texts={{
          label: "Flavor wheel",
          hint: "Hint",
          emptyMessage: "Empty",
          notesToggle: "Notes",
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Notes" }));
    expect(
      screen.getByRole("treeitem", { name: "Fruity, 4 of 5 evaluators" }),
    ).toBeDefined();
  });

  it("renders the bean scale exported from the segment", () => {
    render(
      <BeanScale
        label="Aroma"
        value={null}
        valueText="–/9"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "Aroma" })).toBeDefined();
  });

  it("renders the intensity slider exported from the segment", () => {
    render(
      <IntensitySlider
        label="Acidity"
        value={null}
        valueText="0/15"
        valueLabel="0 de 15"
        scaleLabels={["LOW", "MEDIUM", "HIGH"]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("slider", { name: "Acidity" })).toBeDefined();
  });

  it("renders the descriptor chip group exported from the segment", () => {
    render(
      <DescriptorChipGroup
        legend="Aroma descriptors"
        rows={[
          {
            id: "shared",
            options: [
              { value: "01NUTTY", label: "Nutty", color: "#7A4E2D", level: 0 },
            ],
          },
        ]}
        value={[]}
        onValueChange={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Nutty" })).toBeDefined();
  });

  it("renders the confirmation dialog exported from the segment", () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="Delete this evaluation?"
        description="The evaluation will be removed permanently."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {}}
      />,
    );
    expect(
      screen.getByRole("alertdialog", { name: "Delete this evaluation?" }),
    ).toBeDefined();
  });

  it("renders the label/value row exported from the segment", () => {
    render(
      <dl>
        <LabelValueRow label="Country" value="Colombia" />
      </dl>,
    );
    expect(screen.getByText("Country").tagName).toBe("DT");
    expect(screen.getByText("Colombia").tagName).toBe("DD");
  });

  it("renders the tabs exported from the segment", () => {
    render(
      <Tabs value="one" onValueChange={() => {}}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">Panel one</TabsContent>
        <TabsContent value="two">Panel two</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "One" })).toBeDefined();
    expect(screen.getByRole("tabpanel").textContent).toBe("Panel one");
  });

  it("renders the loading status exported from the segment", () => {
    render(<LoadingStatus text="Loading" />);
    expect(screen.getByRole("status").textContent).toBe("Loading");
  });

  it("renders the form status exported from the segment", () => {
    render(<FormStatus kind="error" text="Something failed" />);
    expect(screen.getByRole("alert").textContent).toBe("Something failed");
  });

  it("renders the step-up notice exported from the segment", () => {
    render(
      <StepUpNotice
        text="Confirm it is you"
        actionLabel="Confirm identity"
        onConfirm={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Confirm identity" }),
    ).toBeDefined();
  });

  it("renders the session gate exported from the segment", () => {
    render(
      <SessionGate
        session={{ state: "anonymous" }}
        loading={<p>Loading</p>}
        signedOut={<p>Signed out</p>}
      >
        {() => <p>Content</p>}
      </SessionGate>,
    );
    expect(screen.getByText("Signed out")).toBeDefined();
  });

  it("renders the signed-out prompt exported from the segment", () => {
    render(
      <SignedOutPrompt
        text="Sign in to continue"
        signInLabel="Sign in"
        onSignIn={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDefined();
  });

  it("renders the view toggle exported from the segment (add-coffeeshop-directory design.md D13)", () => {
    render(<ViewToggle label="View" value="list" items={[{ value: "list", label: "List", icon: ArrowLeft }]} onValueChange={() => {}} />);
    expect(screen.getByRole("radio", { name: "List" })).toBeDefined();
  });

  it("exports the map loader from the segment (add-coffeeshop-directory design.md D14)", () => {
    expect(LocationsMapLoader).toBeTypeOf("function");
  });
});
