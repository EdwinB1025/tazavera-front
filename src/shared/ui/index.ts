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
export {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./Sidebar";
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
export { FlavorWheel } from "./FlavorWheel";
export type {
  FlavorWheelNode,
  FlavorWheelTexts,
  FlavorWheelProps,
} from "./FlavorWheel";
