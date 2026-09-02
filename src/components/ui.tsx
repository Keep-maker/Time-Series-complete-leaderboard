import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "h-10 shrink-0 rounded-full border px-3.5 text-sm transition-[background-color,color,border-color] duration-150",
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-transparent text-muted hover:bg-surface hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  ours,
}: {
  children: ReactNode;
  ours?: boolean;
}) {
  return (
    <span
      className={clsx(
        "ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide",
        ours
          ? "border-transparent bg-best/15 text-best"
          : "border-border text-muted",
      )}
    >
      {children}
    </span>
  );
}
