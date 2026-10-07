/**
 * Public API of the `shared/ui` segment (Feature-Sliced Design).
 *
 * Exports the action controls (Button, Link) and the icon module so every
 * consumer imports through this entry point. Importing a slice through its
 * public API keeps the internal structure free to change.
 */
export { Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";
export { Link } from "./Link";
export type { LinkProps } from "./Link";
export { Field } from "./Field";
export type { FieldProps } from "./Field";
export { Input } from "./Input";
export type { InputProps, InputVariant } from "./Input";
export { PasswordInput } from "./PasswordInput";
export type { PasswordInputProps, PasswordInputVariant } from "./PasswordInput";
export { Select } from "./Select";
export type { SelectProps, SelectVariant } from "./Select";
export { Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";
export { Checkbox } from "./Checkbox";
export type { CheckboxProps, CheckboxVariant } from "./Checkbox";
export { RadioGroup } from "./RadioGroup";
export type {
  RadioGroupProps,
  RadioGroupVariant,
  RadioOption,
} from "./RadioGroup";
export type { ControlPresentation } from "./facet-row";
export { BeanScale } from "./BeanScale";
export type { BeanScaleProps, BeanScaleSize } from "./BeanScale";
export { IntensitySlider } from "./IntensitySlider";
export type { IntensitySliderProps } from "./IntensitySlider";
export { DescriptorChipGroup } from "./DescriptorChipGroup";
export type {
  ChipOption,
  ChipRow,
  DescriptorChipGroupProps,
} from "./DescriptorChipGroup";
export { ConfirmDialog } from "./ConfirmDialog";
export type { ConfirmDialogProps } from "./ConfirmDialog";
export { Loader2, ArrowLeft, type LucideIcon } from "./icons";
export { Logo } from "./Logo";
export type { LogoProps, LogoVariant } from "./Logo";
export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./DropdownMenu";
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "./Sheet";
// The whole Sidebar module (its parts, `useSidebar` and `SIDEBAR_ID`):
// re-exported as a set so this server-safe entry names no hook itself.
export * from "./Sidebar";
export { Card, CardAside, CardContent, CardFooter } from "./Card";
export type {
  CardLayout,
  CardProps,
  CardAsideProps,
  CardContentProps,
  CardFooterProps,
} from "./Card";
export { Badge } from "./Badge";
export { BADGE_GEOMETRY_CLASSES } from "./Badge";
export type { BadgeProps, BadgeVariant } from "./Badge";
export { Pagination } from "./Pagination";
export type { PaginationProps, PaginationTexts } from "./Pagination";
export { PageSection } from "./PageSection";
export type { PageSectionProps, PageSectionSurface } from "./PageSection";
export { Collapsible, CollapsibleHeader, CollapsibleBody } from "./Collapsible";
export type {
  CollapsibleProps,
  CollapsibleHeaderProps,
  CollapsibleBodyProps,
} from "./Collapsible";
export { FlavorWheel } from "./FlavorWheel";
export type {
  FlavorWheelNode,
  FlavorWheelTexts,
  FlavorWheelProps,
} from "./FlavorWheel";
export { FilterChip } from "./FilterChip";
export type { FilterChipProps } from "./FilterChip";
export { FacetPanel } from "./FacetPanel";
export type {
  AppliedFilter,
  FacetPanelProps,
  FacetPanelTexts,
} from "./FacetPanel";
export { FacetTextField } from "./FacetTextField";
export type { FacetTextFieldProps } from "./FacetTextField";
export { SeeMoreButton } from "./SeeMoreButton";
export type { SeeMoreButtonProps, SeeMoreTexts } from "./SeeMoreButton";
export { FacetRadioList } from "./FacetRadioList";
export type { FacetOption, FacetRadioListProps } from "./FacetRadioList";
export { FacetCascade } from "./FacetCascade";
export type {
  CascadeOption,
  FacetCascadeProps,
  FacetCascadeTexts,
} from "./FacetCascade";
export { ScoreRangeFacet } from "./ScoreRangeFacet";
export type {
  ScoreRange,
  ScoreRangeFacetProps,
  ScoreRangeTexts,
} from "./ScoreRangeFacet";
export { Combobox } from "./Combobox";
export type {
  ComboboxOption,
  ComboboxProps,
  ComboboxSearch,
  ComboboxTexts,
} from "./Combobox";
export { LabelValueRow } from "./LabelValueRow";
export type { LabelValueRowProps } from "./LabelValueRow";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from "./Tabs";
export { RetryButton } from "./RetryButton";
export type { RetryButtonProps } from "./RetryButton";
