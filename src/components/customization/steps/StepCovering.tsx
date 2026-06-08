import { useCustomization } from "@/context/CustomizationContext";
import { COVERINGS } from "@/data/customization";
import { SelectableCard } from "../SelectableCard";

export function StepCovering() {
  const { state, update } = useCustomization();

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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COVERINGS.map((opt) => (
          <SelectableCard
            key={opt}
            label={opt}
            selected={state.covering === opt}
            onClick={() => update("covering", opt)}
          />
        ))}
      </div>
    </div>
  );
}
