import { useCustomization } from "@/context/CustomizationContext";
import { useResolvedWizardOptions } from "@/data/product-wizard-store";
import { computePrice, SIZES } from "@/data/customization";
import type { Product } from "@/data/products";

function formatPrice(n: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}

export function StepSummary({ product }: { product: Product }) {
  const { state } = useCustomization();
  const { options: sizeOpts } = useResolvedWizardOptions(product.id, "size");

  // Buscar multiplicador en opciones admin
  const selectedSize = sizeOpts.find((o) => {
    const id = (o.value ?? o.label).toLowerCase();
    return id === state.sizeId || o.label === state.sizeId;
  });
  const adminMult =
    selectedSize?.extra && typeof selectedSize.extra === "object" && !Array.isArray(selectedSize.extra)
      ? Number((selectedSize.extra as Record<string, unknown>).multiplier)
      : NaN;
  const sizeIdFallback = SIZES.find((s) => s.id === state.sizeId) ? state.sizeId : "pequeno";
  const decoration = state.decoration || "clasica";
  const price = Number.isFinite(adminMult) && adminMult > 0
    ? Math.round((product.price * adminMult + (decoration === "personalizada" ? 8 : 0)) * 100) / 100
    : computePrice(product.price, sizeIdFallback, decoration);

  return (
    <div>
      <header className="mb-6">
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">Resumen</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Revisa tu pastel antes de añadirlo al carrito.
        </p>
      </header>

      <div className="space-y-4 rounded-3xl bg-card p-5 ring-1 ring-border/60">
        <Row label="Pastel" value={product.name} />
        <Row label="Sabores" value={state.flavors.join(", ") || "—"} />
        <Row label="Cobertura / relleno" value={state.covering || "—"} />
        <Row label="Decoración" value={decoration === "personalizada" ? "Personalizada" : "Clásica"} />
        {state.theme && <Row label="Tema" value={state.theme} />}
        {state.colors.length > 0 && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-muted-foreground">Colores</span>
            <div className="flex flex-wrap justify-end gap-1.5">
              {state.colors.map((c) => (
                <span
                  key={c}
                  className="h-6 w-6 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: c.startsWith("#") ? c : undefined }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
        {state.description && <Row label="Descripción" value={state.description} />}
        <Row label="Tamaño" value={selectedSize?.label ?? state.sizeId ?? "—"} />
        {state.customText && <Row label="Texto" value={`“${state.customText}”`} />}
        <Row label="Entrega" value={state.deliveryDate || "—"} />
        <div className="border-t border-border pt-4">
          <Row label="Precio estimado" value={formatPrice(price)} strong />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`max-w-[60%] text-right text-sm ${
          strong ? "font-display text-lg text-foreground" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
