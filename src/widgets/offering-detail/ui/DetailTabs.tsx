"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui";
import { toDetailTab, type DetailTab } from "../lib/tab";

// ─── UI-specific types (declared before the component) ───

export type DetailTabsProps = {
  /** The tab of the address. */
  active: DetailTab;
  locale: string;
  ulid: string;
  labels: Record<DetailTab, string>;
  /** The panels' server-rendered content. */
  inventory: ReactNode;
  consensus: ReactNode;
  /** The provisional evaluation panel, composed by the page (add-public-evaluations D9). */
  provisional: ReactNode;
};

/**
 * The detail's tabs (add-offering-catalog design.md D7): the client boundary
 * that keeps the tab in the address. A selection shows its panel and pushes
 * `/{locale}/offerings/{ulid}?tab={value}` at the same route; the panels are
 * server content passed as slots, so no display logic lives here.
 */
export function DetailTabs({
  active,
  locale,
  ulid,
  labels,
  inventory,
  consensus,
  provisional,
}: DetailTabsProps): ReactNode {
  const router = useRouter();
  const [selected, setSelected] = useState<DetailTab>(active);

  function select(value: string) {
    const tab = toDetailTab(value);
    setSelected(tab);
    router.push(`/${locale}/offerings/${ulid}?tab=${tab}`);
  }

  return (
    <Tabs value={selected} onValueChange={select}>
      <TabsList>
        <TabsTrigger value="inventory">{labels.inventory}</TabsTrigger>
        <TabsTrigger value="consensus">{labels.consensus}</TabsTrigger>
        <TabsTrigger value="provisional">{labels.provisional}</TabsTrigger>
      </TabsList>
      <TabsContent value="inventory">{inventory}</TabsContent>
      <TabsContent value="consensus">{consensus}</TabsContent>
      <TabsContent value="provisional">{provisional}</TabsContent>
    </Tabs>
  );
}
