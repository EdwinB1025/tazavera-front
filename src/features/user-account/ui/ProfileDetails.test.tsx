import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ProfileDetails, type ProfileDetailsTexts } from "@/features/user-account";

/**
 * The read-only Profile section's content (spec "Profile settings";
 * drop-step-up-for-everyday-writes design.md D2). Every text comes from the
 * fixture below.
 */

const TEXTS: ProfileDetailsTexts = {
  nameLabel: "fx-name",
  surnameLabel: "fx-surname",
  emailLabel: "fx-email",
  roleLabel: "fx-role",
  emailVerificationLabel: "fx-email-verification",
  emailVerified: "fx-verified",
  emailNotVerified: "fx-not-verified",
};

afterEach(() => {
  cleanup();
});

describe("ProfileDetails", () => {
  it("shows one labelled row per non-null value in order, with no field to edit", () => {
    render(
      <ProfileDetails
        user={{ ulid: "u1", name: "Ana", email: "ana@example.com", role: "specialist" }}
        texts={TEXTS}
      />,
    );
    const rows = Array.from(document.querySelectorAll("dl > div")).map((row) => [
      row.querySelector("dt")?.textContent,
      row.querySelector("dd")?.textContent,
    ]);
    expect(rows).toEqual([
      [TEXTS.nameLabel, "Ana"],
      [TEXTS.emailLabel, "ana@example.com"],
      [TEXTS.roleLabel, "specialist"],
    ]);
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("shows data.role exactly as returned", () => {
    render(<ProfileDetails user={{ ulid: "u1", role: "coffeeshop" }} texts={TEXTS} />);
    expect(screen.getByText(TEXTS.roleLabel).nextElementSibling?.textContent).toBe(
      "coffeeshop",
    );
  });

  it("shows Verified right after the email row when emailVerifiedAt is set", () => {
    render(
      <ProfileDetails
        user={{ email: "ana@example.com", emailVerifiedAt: "2026-10-09T10:00:00Z" }}
        texts={TEXTS}
      />,
    );
    const row = screen.getByText(TEXTS.emailLabel).parentElement!.nextElementSibling!;
    expect(row.querySelector("dt")?.textContent).toBe(TEXTS.emailVerificationLabel);
    expect(row.querySelector("dd")?.textContent).toBe(TEXTS.emailVerified);
  });

  it("shows Not verified right after the email row when emailVerifiedAt is null", () => {
    render(
      <ProfileDetails user={{ email: "ana@example.com", emailVerifiedAt: null }} texts={TEXTS} />,
    );
    const row = screen.getByText(TEXTS.emailLabel).parentElement!.nextElementSibling!;
    expect(row.querySelector("dt")?.textContent).toBe(TEXTS.emailVerificationLabel);
    expect(row.querySelector("dd")?.textContent).toBe(TEXTS.emailNotVerified);
  });

  it("shows no verification row when emailVerifiedAt is absent", () => {
    render(<ProfileDetails user={{ email: "ana@example.com" }} texts={TEXTS} />);
    expect(screen.queryByText(TEXTS.emailVerificationLabel)).toBeNull();
  });
});
