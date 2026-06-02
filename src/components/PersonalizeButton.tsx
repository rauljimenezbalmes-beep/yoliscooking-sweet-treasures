import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  variant?: "primary" | "outline";
  className?: string;
  label?: string;
}

export function PersonalizeButton({ variant = "primary", className, label = "Personaliza tu pastel" }: Props) {
  const base =
    "group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "bg-background text-foreground ring-1 ring-border hover:bg-muted";

  return (
    <Link to="/personalizar-pastel" className={cn(base, styles, className)}>
      <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
      {label}
    </Link>
  );
}
