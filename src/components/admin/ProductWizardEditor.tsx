import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, X } from "lucide-react";
import { useWizardOptions, type WizardOption, type WizardOptionType } from "@/data/wizard-options-store";
import { useProduct } from "@/data/products-store";
import {
  useProductWizardRows,
  useToggleGlobalForProduct,
  useCreateProductExtra,
  useUpdateProductExtra,
  useDeleteProductWizardRow,
  useSetGlobalSizePrice,
  type ProductWizardOption,
} from "@/data/product-wizard-store";

const TABS: { type: WizardOptionType; label: string; help: string }[] = [
  { type: "flavor", label: "Sabores", help: "Sabores disponibles para este pastel." },
  { type: "covering", label: "Coberturas", help: "Coberturas/rellenos para este pastel." },
  { type: "decoration", label: "Decoración", help: "Opciones de decoración (clásica / personalizada)." },
  { type: "theme", label: "Temas", help: "Temas para decoración personalizada." },
  { type: "color", label: "Colores", help: "Paleta de colores (usa hex en 'valor')." },
  { type: "size", label: "Tamaños", help: "Tamaños y porciones disponibles." },
];

export function ProductWizardEditor({ productId }: { productId: string }) {
  const [activeTab, setActiveTab] = useState<WizardOptionType>("flavor");
  const tabMeta = TABS.find((t) => t.type === activeTab)!;

  return (
    <section className="mt-12 rounded-3xl bg-card p-6 ring-1 ring-border/60 sm:p-8">
      <header className="mb-5">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Wizard de este pastel
        </span>
        <h2 className="mt-1 font-display text-2xl text-foreground sm:text-3xl">
          Opciones que verá el cliente
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Activa o desactiva opciones globales y añade extras exclusivos para este pastel.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-1 rounded-full bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => setActiveTab(t.type)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === t.type
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-muted-foreground">{tabMeta.help}</p>

      <TypeSection productId={productId} type={activeTab} />
    </section>
  );
}

function TypeSection({ productId, type }: { productId: string; type: WizardOptionType }) {
  const { data: globals, isLoading: loadingGlobals } = useWizardOptions(type);
  const { data: overrides, isLoading: loadingOverrides } = useProductWizardRows(productId);
  const toggleMut = useToggleGlobalForProduct();

  const overridesForType = (overrides ?? []).filter((o) => o.type === type);
  const overrideByGlobalId = new Map(
    overridesForType
      .filter((o) => o.global_option_id)
      .map((o) => [o.global_option_id as string, o]),
  );
  const extras = overridesForType.filter((o) => !o.global_option_id);

  if (loadingGlobals || loadingOverrides) {
    return <p className="text-sm text-muted-foreground">Cargando…</p>;
  }

  const isSizeTab = type === "size";
  const product = useProduct(productId);
  const basePrice = product?.price ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">
          Opciones globales
        </h3>
        {isSizeTab && (
          <p className="mb-3 rounded-xl bg-accent/30 p-3 text-xs text-muted-foreground">
            Puedes fijar un precio concreto en € para este pastel y tamaño. Si lo dejas vacío,
            se calculará automáticamente con el precio base ({basePrice.toFixed(2)} €) × multiplicador del tamaño.
          </p>
        )}
        {!globals || globals.length === 0 ? (
          <p className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
            No hay opciones globales en esta categoría. Créalas desde Admin → Wizard.
          </p>
        ) : (
          <ul className="space-y-2">
            {globals
              .filter((g) => g.active)
              .map((g) => {
                const ov = overrideByGlobalId.get(g.id);
                const enabled = ov ? ov.enabled : true;
                return (
                  <li
                    key={g.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-background p-3 ring-1 ring-border/60"
                  >
                    <div className="flex items-center gap-2">
                      {g.value && g.value.startsWith("#") && (
                        <span
                          className="h-6 w-6 shrink-0 rounded-full ring-1 ring-border"
                          style={{ backgroundColor: g.value }}
                        />
                      )}
                      <span
                        className={`font-medium ${
                          enabled ? "text-foreground" : "text-muted-foreground line-through"
                        }`}
                      >
                        {g.label}
                      </span>
                      {g.value && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {g.value}
                        </span>
                      )}
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                        Global
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {isSizeTab && (
                        <SizePriceInput
                          productId={productId}
                          global={g}
                          existing={ov}
                          basePrice={basePrice}
                        />
                      )}
                      <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={enabled}
                          disabled={toggleMut.isPending}
                          onChange={async (e) => {
                            try {
                              await toggleMut.mutateAsync({
                                productId,
                                type,
                                global: g,
                                enabled: e.target.checked,
                                existingId: ov?.id,
                              });
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "Error");
                            }
                          }}
                          className="h-4 w-4 accent-primary"
                        />
                        {enabled ? "Activa" : "Oculta"}
                      </label>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      <ExtrasManager productId={productId} type={type} extras={extras} />
    </div>
  );
}

function SizePriceInput({
  productId,
  global,
  existing,
  basePrice,
}: {
  productId: string;
  global: WizardOption;
  existing?: ProductWizardOption;
  basePrice: number;
}) {
  const setPriceMut = useSetGlobalSizePrice();
  const currentPrice =
    existing?.extra && typeof existing.extra === "object" && !Array.isArray(existing.extra)
      ? (existing.extra as Record<string, unknown>).price
      : undefined;
  const initial = typeof currentPrice === "number" ? String(currentPrice) : "";
  const [value, setValue] = useState(initial);
  useEffect(() => {
    setValue(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id, currentPrice]);

  const multiplier =
    global.extra && typeof global.extra === "object" && !Array.isArray(global.extra)
      ? Number((global.extra as Record<string, unknown>).multiplier)
      : NaN;
  const auto = Number.isFinite(multiplier) && multiplier > 0 ? basePrice * multiplier : null;

  async function save() {
    const trimmed = value.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);
    if (trimmed !== "" && (!Number.isFinite(parsed!) || parsed! <= 0)) {
      toast.error("Precio no válido");
      return;
    }
    try {
      await setPriceMut.mutateAsync({ productId, global, existing, price: parsed });
      toast.success(parsed === null ? "Precio automático" : "Precio guardado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        step="0.5"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder={auto !== null ? `auto ${auto.toFixed(2)}` : "auto"}
        disabled={setPriceMut.isPending}
        className="w-24 rounded-lg border border-border bg-background px-2.5 py-1 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <span className="text-xs text-muted-foreground">€</span>
    </div>
  );
}

function ExtrasManager({
  productId,
  type,
  extras,
}: {
  productId: string;
  type: WizardOptionType;
  extras: ProductWizardOption[];
}) {
  const createMut = useCreateProductExtra();
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const showValue = type === "color" || type === "size";
  const showDescription = type === "decoration";

  async function handleCreate() {
    if (!newLabel.trim()) return;
    try {
      await createMut.mutateAsync({
        productId,
        type,
        label: newLabel.trim(),
        value: showValue ? newValue.trim() || null : null,
        description: showDescription ? newDescription.trim() || null : null,
        sort_order: extras.length + 1,
      });
      setNewLabel("");
      setNewValue("");
      setNewDescription("");
      toast.success("Extra añadido");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">
        Extras exclusivos para este pastel
      </h3>

      <div className="rounded-xl bg-background p-3 ring-1 ring-border/60">
        <div className="grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Nombre / etiqueta"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
          />
          {showValue && (
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={type === "color" ? "#FFFFFF" : "id (ej. mediano)"}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
            />
          )}
          {showDescription && (
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Descripción"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
            />
          )}
          <button
            type="button"
            onClick={handleCreate}
            disabled={createMut.isPending || !newLabel.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> Añadir
          </button>
        </div>
      </div>

      {extras.length === 0 ? (
        <p className="mt-3 rounded-xl bg-muted/40 p-4 text-center text-sm text-muted-foreground">
          Sin extras propios para este pastel.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {extras.map((row) => (
            <ExtraRow
              key={row.id}
              row={row}
              productId={productId}
              showValue={showValue}
              showDescription={showDescription}
              showPrice={type === "size"}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ExtraRow({
  row,
  productId,
  showValue,
  showDescription,
  showPrice,
}: {
  row: ProductWizardOption;
  productId: string;
  showValue: boolean;
  showDescription: boolean;
  showPrice?: boolean;
}) {
  const updateMut = useUpdateProductExtra();
  const deleteMut = useDeleteProductWizardRow();
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(row.label ?? "");
  const [value, setValue] = useState(row.value ?? "");
  const [description, setDescription] = useState(row.description ?? "");

  async function handleSave() {
    try {
      await updateMut.mutateAsync({
        id: row.id,
        productId,
        patch: {
          label: label.trim(),
          value: showValue ? value.trim() || null : row.value,
          description: showDescription ? description.trim() || null : row.description,
        },
      });
      setEditing(false);
      toast.success("Actualizado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  async function handleToggle() {
    try {
      await updateMut.mutateAsync({
        id: row.id,
        productId,
        patch: { enabled: !row.enabled },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${row.label}"?`)) return;
    try {
      await deleteMut.mutateAsync({ id: row.id, productId });
      toast.success("Eliminado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl bg-background p-3 ring-1 ring-border/60">
      {showValue && row.value && row.value.startsWith("#") && (
        <span
          className="h-8 w-8 shrink-0 rounded-full ring-1 ring-border"
          style={{ backgroundColor: row.value }}
        />
      )}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {editing ? (
          <>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
            {showValue && (
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="valor"
                className="w-32 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
              />
            )}
            {showDescription && (
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="descripción"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
              />
            )}
          </>
        ) : (
          <>
            <span
              className={`font-medium ${
                row.enabled ? "text-foreground" : "text-muted-foreground line-through"
              }`}
            >
              {row.label}
            </span>
            {row.value && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {row.value}
              </span>
            )}
            {row.description && (
              <span className="line-clamp-1 text-xs text-muted-foreground">
                {row.description}
              </span>
            )}
            <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground">
              Extra
            </span>
            {!row.enabled && (
              <span className="text-xs text-muted-foreground">(oculto)</span>
            )}
          </>
        )}
      </div>

      {showPrice && !editing && (
        <ExtraSizePriceInput row={row} productId={productId} />
      )}

      <div className="flex items-center gap-1">
        {editing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateMut.isPending}
              className="rounded-full p-2 text-primary hover:bg-primary/10"
              aria-label="Guardar"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setLabel(row.label ?? "");
                setValue(row.value ?? "");
                setDescription(row.description ?? "");
              }}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              aria-label="Cancelar"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleToggle}
              className="rounded-full px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {row.enabled ? "Ocultar" : "Mostrar"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMut.isPending}
              className="rounded-full p-2 text-destructive hover:bg-destructive/10"
              aria-label="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

function ExtraSizePriceInput({
  row,
  productId,
}: {
  row: ProductWizardOption;
  productId: string;
}) {
  const updateMut = useUpdateProductExtra();
  const currentPrice =
    row.extra && typeof row.extra === "object" && !Array.isArray(row.extra)
      ? (row.extra as Record<string, unknown>).price
      : undefined;
  const initial = typeof currentPrice === "number" ? String(currentPrice) : "";
  const [value, setValue] = useState(initial);
  useEffect(() => {
    setValue(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.id, currentPrice]);

  async function save() {
    const trimmed = value.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);
    if (trimmed !== "" && (!Number.isFinite(parsed!) || parsed! <= 0)) {
      toast.error("Precio no válido");
      return;
    }
    const baseExtra =
      row.extra && typeof row.extra === "object" && !Array.isArray(row.extra)
        ? { ...(row.extra as Record<string, unknown>) }
        : {};
    if (parsed === null) delete baseExtra.price;
    else baseExtra.price = parsed;
    try {
      await updateMut.mutateAsync({
        id: row.id,
        productId,
        patch: { extra: baseExtra as never },
      });
      toast.success(parsed === null ? "Precio automático" : "Precio guardado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        step="0.5"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder="auto"
        disabled={updateMut.isPending}
        className="w-24 rounded-lg border border-border bg-background px-2.5 py-1 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <span className="text-xs text-muted-foreground">€</span>
    </div>
  );
}
