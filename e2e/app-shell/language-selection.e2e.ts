import { expect, test } from "@playwright/test";

import enLanding from "../../messages/en/landing.json";
import esShell from "../../messages/es/shell.json";
import { LOCALE_NAMES } from "../../src/shared/config/locale-names";

test("opens the same route in the chosen locale (spec: Choosing a locale)", async ({
  page,
}) => {
  await page.goto("/es/about");

  await page
    .getByRole("button", {
      name: `${"es".toUpperCase()} — ${esShell.languageSelector}: ${LOCALE_NAMES.es.name}`,
    })
    .click();
  await page.getByRole("menuitemradio", { name: LOCALE_NAMES.en.name }).click();

  await expect(page).toHaveURL((url) => url.pathname === "/en/about");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    enLanding.aboutHeadingBefore +
      enLanding.aboutHeadingAccent +
      enLanding.aboutHeadingAfter,
  );
});
