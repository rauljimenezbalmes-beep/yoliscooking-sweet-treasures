import { useMemo } from "react";
import { useCustomization } from "@/context/CustomizationContext";
import { useResolvedWizardOptions } from "@/data/product-wizard-store";
import { MIN_DELIVERY_DAYS } from "@/data/customization";
import { SelectableCard } from "../SelectableCard";

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function sizeIdOf(label: string, value: string | null): string {
  if (value && value.trim()) return value.trim();
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function StepDetails({ productId }: { productId: string }) {
  const { state, update } = useCustomization();
  const { options: sizeOpts } = useResolvedWizardOptions(productId, "size");

  const minDate = useMemo(() => todayPlus(MIN_DELIVERY_DAYS), []);

  return (
    <div className="space-y-8">
      <section>
        <input
          type="text"
          value={state.customText}
          onChange={(e) => update("customText", e.target.value)}
          maxLength={80}
          placeholder="Ej: ¡Feliz cumple, Lucía!"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
        />
      </section>

      {sizeOpts.length > 0 && (
        <section>
          <h3 className="mb-3 font-display text-lg text-foreground">Tamaño</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sizeOpts.map((opt) => {
              const id = sizeIdOf(opt.label, opt.value);
              const extraObj =
                opt.extra && typeof opt.extra === "object" && !Array.isArray(opt.extra)
                  ? (opt.extra as Record<string, unknown>)
                  : {};
              const portionsLabel = typeof extraObj.portionsLabel === "string"
                ? extraObj.portionsLabel.trim()
                : "";
              const portions = extraObj.portions;
              const description = portionsLabel
                ? portionsLabel
                : portions
                  ? `${portions} porciones`
                  : opt.description ?? undefined;
              return (
                <SelectableCard
                  key={opt.key}
                  label={opt.label}
                  description={description}
                  selected={state.sizeId === id}
                  onClick={() => update("sizeId", id)}
                />
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-3 font-display text-lg text-foreground">Fecha de entrega</h3>
        <input
          type="date"
          value={state.deliveryDate ?? ""}
          min={minDate}
          onChange={(e) => update("deliveryDate", e.target.value)}
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Necesitamos al menos {MIN_DELIVERY_DAYS} días para prepararlo.
        </p>
      </section>
    </div>
  );
}
