import { useCustomization } from "@/context/CustomizationContext";
import { useResolvedWizardOptions } from "@/data/product-wizard-store";
import { CUSTOM_DECORATION_FEE } from "@/data/customization";
import { SelectableCard } from "../SelectableCard";


export function StepDecoration({ productId }: { productId: string }) {
  const { state, update } = useCustomization();
  const { options: decoOpts, isLoading } = useResolvedWizardOptions(productId, "decoration");
  const { options: themeOpts } = useResolvedWizardOptions(productId, "theme");
  const { options: colorOpts } = useResolvedWizardOptions(productId, "color");

  const isPersonalizada =
    state.decoration === "personalizada" ||
    decoOpts.some(
      (o) =>
        o.label === state.decoration ||
        (o.value && o.value.toLowerCase() === "personalizada"),
    ) &&
      // when label-based, treat anything not "clasica" as personalizada when chosen
      state.decoration !== "clasica" &&
      state.decoration !== "";

  function pickDecoration(label: string) {
    const norm = label.toLowerCase().includes("personal") ? "personalizada" : "clasica";
    update("decoration", norm);
  }

  function toggleColor(hex: string) {
    const exists = state.colors.includes(hex);
    if (!exists && state.colors.length >= 2) return;
    update(
      "colors",
      exists ? state.colors.filter((c) => c !== hex) : [...state.colors, hex],
    );
  }

  const colorsSelected = state.colors.length;
  const colorsComplete = colorsSelected >= 1 && colorsSelected <= 2;

  return (
    <div className="space-y-8">
      <section>
        <header className="mb-6">
          <h2 className="font-display text-2xl text-foreground sm:text-3xl">
            Elige el tipo de decoración
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Una decoración clásica o algo totalmente personalizado.
          </p>
        </header>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : decoOpts.length === 0 ? (
          <p className="rounded-2xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            No hay opciones de decoración configuradas.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {decoOpts.map((opt) => {
              const norm = opt.label.toLowerCase().includes("personal")
                ? "personalizada"
                : "clasica";
              return (
                <SelectableCard
                  key={opt.key}
                  label={opt.label}
                  description={opt.description ?? undefined}
                  selected={state.decoration === norm}
                  onClick={() => pickDecoration(opt.label)}
                />
              );
            })}
          </div>
        )}
      </section>

      {isPersonalizada && (
        <>
          {themeOpts.length > 0 && (
            <section>
              <h3 className="mb-3 font-display text-lg text-foreground">Temática</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {themeOpts.map((opt) => (
                  <SelectableCard
                    key={opt.key}
                    label={opt.label}
                    selected={state.theme === opt.label}
                    onClick={() => update("theme", opt.label)}
                  />
                ))}
              </div>
            </section>
          )}

          {colorOpts.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-lg text-foreground">Colores</h3>
                <span className={`text-xs font-medium ${colorsComplete ? "text-emerald-500" : "text-muted-foreground"}`}>
                  {colorsSelected}/2 (mín. 1)
                </span>
              </div>
              {!colorsComplete && (
                <p className="mb-2 text-xs text-muted-foreground">
                  Selecciona 1 o 2 colores para continuar.
                </p>
              )}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {colorOpts.map((opt) => {
                  const hex = opt.value ?? opt.label;
                  const selected = state.colors.includes(hex);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => toggleColor(hex)}
                      aria-pressed={selected}
                      className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all hover:-translate-y-0.5 ${
                        selected
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "border-border bg-card"
                      }`}
                    >
                      <span
                        className="h-10 w-10 rounded-full ring-1 ring-border"
                        style={{
                          backgroundColor: hex.startsWith("#") ? hex : undefined,
                        }}
                      />
                      <span className="text-xs text-foreground">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-3 font-display text-lg text-foreground">Descripción</h3>
            <textarea
              value={state.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              placeholder="Describe la decoración que imaginas (personajes, estilo, detalles...)."
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
            />
          </section>
        </>
      )}
    </div>
  );
}
