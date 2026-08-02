import {
  Minus,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronsUp,
  type LucideIcon,
} from "lucide-react";

export const STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

/** Small dot used next to column titles / table rows. */
export const STATUS_DOT: Record<Status, string> = {
  TODO: "bg-todo",
  IN_PROGRESS: "bg-info",
  IN_REVIEW: "bg-warn",
  DONE: "bg-done",
  CANCELLED: "bg-cancel",
};

/** Tinted chip used for status badges. */
export const STATUS_CHIP: Record<Status, string> = {
  TODO: "border-line bg-sand text-muted",
  IN_PROGRESS: "border-info/25 bg-info/10 text-info",
  IN_REVIEW: "border-warn/25 bg-warn/10 text-warn",
  DONE: "border-done/25 bg-done/10 text-done",
  CANCELLED: "border-cancel/25 bg-cancel/10 text-cancel",
};

export const PRIORITIES = ["NO_PRIORITY", "LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_META: Record<
  Priority,
  { label: string; icon: LucideIcon; className: string }
> = {
  NO_PRIORITY: { label: "No priority", icon: Minus, className: "text-faint" },
  LOW: { label: "Low", icon: ArrowDown, className: "text-info" },
  MEDIUM: { label: "Medium", icon: ArrowRight, className: "text-warn" },
  HIGH: { label: "High", icon: ArrowUp, className: "text-[#c2410c]" },
  URGENT: { label: "Urgent", icon: ChevronsUp, className: "text-cancel" },
};
