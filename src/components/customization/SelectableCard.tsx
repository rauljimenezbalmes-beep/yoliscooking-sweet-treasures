import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  description?: string;
  selected: boolean;
  disabled?: boolean;
  badge?: string;
  onClick: () => void;
}

export function SelectableCard({ label, description, selected, disabled, badge, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group relative flex h-full flex-col items-start gap-1 rounded-2xl border bg-card p-4 text-left transition-all",
        "hover:-translate-y-0.5 hover:shadow-card",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary shadow-card"
          : "border-border",
        disabled && "pointer-events-none opacity-40 hover:translate-y-0 hover:shadow-none",
      )}
    >
      <span
        className={cn(
          "absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full transition-all",
          selected
            ? "bg-primary text-primary-foreground scale-100 opacity-100"
            : "bg-muted text-muted-foreground scale-90 opacity-0",
        )}
        aria-hidden
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-display text-base text-foreground sm:text-lg">{label}</span>
        {badge && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {badge}
          </span>
        )}
      </span>
      {description && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
    </button>
  );
}

