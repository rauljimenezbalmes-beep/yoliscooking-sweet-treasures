import { useCustomization } from "@/context/CustomizationContext";
import { useResolvedWizardOptions } from "@/data/product-wizard-store";
import { SelectableCard } from "../SelectableCard";

export function StepCovering({
  productId,
  isBizcocho = false,
}: {
  productId: string;
  isBizcocho?: boolean;
}) {
  const { state, update } = useCustomization();
  const { options, isLoading } = useResolvedWizardOptions(productId, "covering");

  const titulo = isBizcocho ? "Elige la cobertura" : "Elige el relleno";
  const subt = isBizcocho
    ? "Selecciona una opción para terminar tu tarta."
    : "Selecciona el relleno que acompañará a tus sabores.";

  return (
    <div>
      <header className="mb-6">
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">{titulo}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{subt}</p>
      </header>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : options.length === 0 ? (
        <p className="rounded-2xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Este pastel no requiere selección en este paso. Puedes continuar.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((opt) => (
            <SelectableCard
              key={opt.key}
              label={opt.label}
              description={opt.description ?? undefined}
              selected={state.covering === opt.label}
              onClick={() => update("covering", opt.label)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
