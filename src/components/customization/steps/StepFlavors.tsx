import { FLAVORS } from "@/data/customization";
import { useCustomization } from "@/context/CustomizationContext";
import { SelectableCard } from "../SelectableCard";

export function StepFlavors() {
  const { state, toggleFlavor } = useCustomization();
  const selectedCount = state.flavors.length;
  const maxReached = selectedCount >= 2;

  return (
    <div>
      <header className="mb-6">
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">
          Elige uno o dos sabores
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Selecciona hasta 2 sabores para el interior de tu pastel.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {FLAVORS.map((f) => {
          const selected = state.flavors.includes(f);
          const disabled = !selected && maxReached;
          return (
            <SelectableCard
              key={f}
              label={f}
              selected={selected}
              disabled={disabled}
              onClick={() => toggleFlavor(f)}
            />
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{selectedCount}/2</span> sabores seleccionados
      </p>
    </div>
  );
}
