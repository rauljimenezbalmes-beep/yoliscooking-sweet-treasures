import { useCustomization } from "@/context/CustomizationContext";
import { useResolvedWizardLabels } from "@/data/product-wizard-store";
import { SelectableCard } from "../SelectableCard";

export function StepCovering({ productId }: { productId: string }) {
  const { state, update } = useCustomization();
  const coverings = useResolvedWizardLabels(productId, "covering");

  return (
    <div>
      <header className="mb-6">
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">
          Elige la cobertura
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Selecciona una opción para terminar tu tarta.
        </p>
      </header>
      {coverings.length === 0 ? (
        <p className="rounded-2xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          No hay coberturas disponibles para este pastel.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coverings.map((opt) => (
            <SelectableCard
              key={opt}
              label={opt}
              selected={state.covering === opt}
              onClick={() => update("covering", opt)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
