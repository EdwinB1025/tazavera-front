"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Button,
  Card,
  CardAside,
  CardContent,
  Field,
  FormStatus,
  Input,
  LINK_CLASSES,
  Textarea,
} from "@/shared/ui";
import { ContactFields, type ContactFieldKey, type ContactTexts } from "@/entities/contact";
import {
  LOCATION_FIELD_ORDER,
  validateLocationForm,
  type LocationCheckTexts,
  type LocationFormErrors,
  type LocationFormValues,
} from "../model/location-form";
import type { SubmitState } from "../model/types";

// ─── UI-specific types (declared before the component) ───

export type LocationFormTexts = ContactTexts &
  LocationCheckTexts & {
    newLocationHeading: string;
    locationGroupLegend: string;
    contactGroupLegend: string;
    locationNameLabel: string;
    locationDescriptionLabel: string;
    geocodingHelp: string;
    geocodingAttribution: string;
    osmContributors: string;
    save: string;
    cancel: string;
    genericError: string;
  };

export type LocationFormProps = {
  texts: LocationFormTexts;
  submitState: SubmitState;
  /** Called with the values once the client checks pass. */
  onSubmit: (values: LocationFormValues) => void;
  onCancel: () => void;
};

const EMPTY_VALUES: LocationFormValues = {
  name: "",
  description: "",
  address: "",
  postalCode: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  web: "",
  social: "",
};

const OSM_COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";

// ─── Layout (summary §8) ───
// The section card: full width, at most 40rem from `md`.
const CARD_CLASSES = ["w-full", "md:max-w-160"].join(" ");
// The form's blocks (fieldsets, notes, alert, actions) 1.5rem apart.
const FORM_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
// The two fieldsets 2rem apart.
const GROUPS_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
// No native fieldset border, padding or margin.
const FIELDSET_CLASSES = ["m-0", "min-w-0", "border-0", "p-0"].join(" ");
// The legend 1rem above its first field.
const LEGEND_CLASSES = ["type-label", "mb-4", "p-0"].join(" ");
// The fields 1.5rem apart.
const FIELDS_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
// Help and attribution 0.5rem apart.
const NOTES_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
// Save, then Cancel: a wrapping row 0.75rem apart, start-aligned.
const ACTIONS_CLASSES = ["flex", "flex-wrap", "gap-3"].join(" ");

/** design.md D7: the attribution line, its `{link}` placeholder replaced by the anchor. */
function Attribution({ texts }: { texts: LocationFormTexts }): ReactNode {
  const [before, after = ""] = texts.geocodingAttribution.split("{link}");
  return (
    <p className="type-meta">
      {before}
      <a href={OSM_COPYRIGHT_URL} className={LINK_CLASSES}>
        {texts.osmContributors}
      </a>
      {after}
    </p>
  );
}

/**
 * The new-location form (design.md D7; specs "Location form", "Location form
 * checks", "Location creation failures"): a section card whose band names the
 * form, the location and the contact fieldsets, the geocoding note and
 * attribution, the single alert region and the actions. It owns the values
 * and the client checks; the panel owns the request and passes its state.
 */
export function LocationForm({
  texts,
  submitState,
  onSubmit,
  onCancel,
}: LocationFormProps): ReactNode {
  const headingId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<LocationFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<LocationFormErrors>({});
  const submitting = submitState === "submitting";

  function update(key: keyof LocationFormValues, value: string): void {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (submitting) return;
    const failed = validateLocationForm(values, texts);
    setErrors(failed);
    const first = LOCATION_FIELD_ORDER.find((key) => failed[key] !== undefined);
    if (first !== undefined) {
      const control = formRef.current?.elements.namedItem(first);
      if (control instanceof HTMLElement) control.focus();
      return;
    }
    onSubmit(values);
  }

  return (
    <Card variant="section" className={CARD_CLASSES}>
      <CardAside>
        <h2 id={headingId} className="type-subheading">
          {texts.newLocationHeading}
        </h2>
      </CardAside>
      <CardContent>
        <form
          ref={formRef}
          noValidate
          aria-labelledby={headingId}
          onSubmit={handleSubmit}
          className={FORM_CLASSES}
        >
          <div className={GROUPS_CLASSES}>
            <fieldset className={FIELDSET_CLASSES}>
              <legend className={LEGEND_CLASSES}>{texts.locationGroupLegend}</legend>
              <div className={FIELDS_CLASSES}>
                <Field label={texts.locationNameLabel} error={errors.name} required>
                  <Input
                    name="name"
                    autoComplete="organization"
                    maxLength={150}
                    value={values.name}
                    onChange={(event) => update("name", event.target.value)}
                  />
                </Field>
                <Field label={texts.locationDescriptionLabel} error={errors.description}>
                  <Textarea
                    name="description"
                    autoComplete="off"
                    maxLength={255}
                    value={values.description}
                    onChange={(event) => update("description", event.target.value)}
                  />
                </Field>
              </div>
            </fieldset>
            <fieldset className={FIELDSET_CLASSES}>
              <legend className={LEGEND_CLASSES}>{texts.contactGroupLegend}</legend>
              <div className={FIELDS_CLASSES}>
                <ContactFields
                  values={values}
                  errors={errors}
                  onChange={(key: ContactFieldKey, value) => update(key, value)}
                  texts={texts}
                  layout="paired"
                />
              </div>
            </fieldset>
          </div>
          <div className={NOTES_CLASSES}>
            <p className="type-meta">{texts.geocodingHelp}</p>
            <Attribution texts={texts} />
          </div>
          {submitState === "error" && <FormStatus kind="error" text={texts.genericError} />}
          <div className={ACTIONS_CLASSES}>
            <Button type="submit" variant="primary" size="base" loading={submitting}>
              {texts.save}
            </Button>
            <Button
              type="button"
              variant="action-4"
              size="base"
              disabled={submitting}
              onClick={onCancel}
            >
              {texts.cancel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
