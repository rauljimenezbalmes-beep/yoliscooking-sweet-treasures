import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onBack?: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLast?: boolean;
  nextLabel?: string;
}

export function WizardFooter({ onBack, onNext, canGoBack, canGoNext, isLast, nextLabel }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Atrás</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:flex-none sm:min-w-[200px]"
        >
          {isLast ? <Sparkles className="h-4 w-4" /> : null}
          {nextLabel ?? "Continuar"}
          {!isLast && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
