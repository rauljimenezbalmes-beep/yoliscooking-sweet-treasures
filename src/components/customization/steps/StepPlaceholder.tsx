import { Construction } from "lucide-react";

interface Props {
  title: string;
  description?: string;
}

export function StepPlaceholder({ title, description }: Props) {
  return (
    <div>
      <header className="mb-6">
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">{title}</h2>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Construction className="h-6 w-6" />
        </span>
        <p className="font-display text-lg text-foreground">Próximamente</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Estamos preparando este paso. Por ahora puedes continuar al siguiente.
        </p>
      </div>
    </div>
  );
}
