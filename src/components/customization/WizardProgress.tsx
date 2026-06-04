import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: number;
  label: string;
  shortLabel?: string;
}

interface Props {
  steps: WizardStep[];
  current: number;
  completed: Set<number>;
  onJump?: (step: number) => void;
}

export function WizardProgress({ steps, current, completed, onJump }: Props) {
  const total = steps.length;
  const progress = Math.round(((current - 1 + (completed.has(current) ? 1 : 0)) / total) * 100);
  const currentStep = steps.find((s) => s.id === current);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">
          Paso {current} de {total}
          {currentStep && <span className="ml-1.5 text-foreground">· {currentStep.label}</span>}
        </span>
        <span className="font-semibold text-foreground">{progress}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step list - hidden on small screens */}
      <ol className="mt-3 hidden items-center justify-between gap-2 sm:flex">
        {steps.map((s) => {
          const isDone = completed.has(s.id);
          const isCurrent = s.id === current;
          const clickable = !!onJump && (isDone || s.id < current);
          return (
            <li key={s.id} className="flex-1">
              <button
                type="button"
                onClick={() => clickable && onJump?.(s.id)}
                disabled={!clickable}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                  clickable && "hover:bg-muted",
                  !clickable && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ring-1 transition-colors",
                    isCurrent && "bg-primary text-primary-foreground ring-primary",
                    !isCurrent && isDone && "bg-primary/15 text-primary ring-primary/30",
                    !isCurrent && !isDone && "bg-muted text-muted-foreground ring-border",
                  )}
                >
                  {isDone && !isCurrent ? <Check className="h-3.5 w-3.5" /> : s.id}
                </span>
                <span
                  className={cn(
                    "truncate text-xs font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
