"use client";

import { createContext, useContext, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { LoadingStatus } from "./LoadingStatus";
import { SubsectionOpenedContext } from "./SidebarMenuSub";
import type { ComboboxProps, ComboboxTexts } from "./Combobox";

// ─── UI-specific types (declared before the component) ───

export type ComboboxLoaderProps = Omit<ComboboxProps, "texts"> & {
  texts: ComboboxTexts & { loading: string };
};

// `loading` receives no props, so the text reaches it through context.
const LoadingTextContext = createContext("");

function ComboboxPlaceholder(): ReactNode {
  return <LoadingStatus text={useContext(LoadingTextContext)} />;
}

const LazyCombobox = dynamic(() => import("./Combobox").then((module) => module.Combobox), {
  ssr: false,
  loading: () => <ComboboxPlaceholder />,
});

/**
 * The lazily loaded combobox (lazy-load-facet-controls design.md D1–D2; spec
 * filtering "Facet comboboxes loaded on first opening"): the combobox module,
 * with cmdk and the popover behind it, loads only once the enclosing
 * sub-section has been opened (at once outside a sub-section); until it
 * loads, its place shows the loading status.
 */
export function ComboboxLoader({ texts, ...props }: ComboboxLoaderProps): ReactNode {
  const opened = useContext(SubsectionOpenedContext);
  const { loading, ...comboboxTexts } = texts;
  return (
    <LoadingTextContext.Provider value={loading}>
      {opened ? (
        <LazyCombobox {...(props as ComboboxProps)} texts={comboboxTexts} />
      ) : (
        <ComboboxPlaceholder />
      )}
    </LoadingTextContext.Provider>
  );
}
