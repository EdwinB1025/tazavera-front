"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui";
import type { CoffeeshopTab } from "../lib/tab";

// ─── UI-specific types (declared before the component) ───

export type CoffeeshopTabsProps = {
  /** The tab of the address. */
  active: CoffeeshopTab;
  locale: string;
  ulid: string;
  labels: Record<CoffeeshopTab, string>;
  /** The panels' server-rendered content. */
  offerings: ReactNode;
  locations: ReactNode;
};

/**
 * The detail's tabs (add-coffeeshop-directory design.md D8): the client
 * boundary that keeps the tab in the address. A selection shows its panel and
 * pushes `/{locale}/coffeeshops/{ulid}?tab={value}`, the other keys dropped.
 */
export function CoffeeshopTabs({
  active,
  locale,
  ulid,
  labels,
  offerings,
  locations,
}: CoffeeshopTabsProps): ReactNode {
  const router = useRouter();
  const [selected, setSelected] = useState<CoffeeshopTab>(active);

  function select(value: string) {
    const tab: CoffeeshopTab = value === "locations" ? "locations" : "offerings";
    setSelected(tab);
    router.push(`/${locale}/coffeeshops/${ulid}?tab=${tab}`);
  }

  return (
    <Tabs value={selected} onValueChange={select}>
      <TabsList>
        <TabsTrigger value="offerings">{labels.offerings}</TabsTrigger>
        <TabsTrigger value="locations">{labels.locations}</TabsTrigger>
      </TabsList>
      <TabsContent value="offerings">{offerings}</TabsContent>
      <TabsContent value="locations">{locations}</TabsContent>
    </Tabs>
  );
}
