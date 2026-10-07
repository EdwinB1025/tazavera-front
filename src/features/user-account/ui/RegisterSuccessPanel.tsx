"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type RegisterSuccessPanelTexts = {
  registerSuccessTitle: string;
  registerSuccessText: string;
  signIn: string;
};

export type RegisterSuccessPanelProps = {
  texts: RegisterSuccessPanelTexts;
  /** Starts sign in; called synchronously inside the click (design.md D1). */
  signIn: () => void;
};

/**
 * The panel that replaces the registration form after a `201` (spec
 * "Registration result"; design.md D9 and D10). Its heading takes focus when
 * the panel mounts; "Sign in" starts sign in inside its click.
 */
export function RegisterSuccessPanel({
  texts,
  signIn,
}: RegisterSuccessPanelProps): ReactNode {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h2 ref={headingRef} tabIndex={-1} className="type-card-heading">
        {texts.registerSuccessTitle}
      </h2>
      <p className="type-body">{texts.registerSuccessText}</p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          size="base"
          className="w-full"
          onClick={() => signIn()}
        >
          {texts.signIn}
        </Button>
      </div>
    </div>
  );
}
