import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  useWizardOptions,
  useCreateWizardOption,
  useUpdateWizardOption,
  useDeleteWizardOption,
  type WizardOptionType,
  type WizardOption,
} from "@/data/wizard-options-store";
import { Plus, Trash2, Save, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/wizard")({
  head: () => ({
    meta: [
      { title: "Gestión del wizard — La Cocina De Yoli" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminWizard,
});

const TABS: { type: WizardOptionType; label: string; help: string }[] = [
  { type: "flavor", label: "Sabores", help: "Sabores que el cliente puede elegir para el interior." },
  { type: "covering", label: "Coberturas", help: "Tipos de cobertura disponibles." },
  { type: "decoration", label: "Decoración", help: "Opciones del paso de decoración (clásica / personalizada)." },
  { type: "theme", label: "Temas", help: "Temas para decoraciones personalizadas." },
  { type: "color", label: "Colores", help: "Paleta de colores. Usa el campo 'valor' para el hex (#FFFFFF)." },
  { type: "size", label: "Tamaños", help: "Usa 'valor' como id (ej. 'mediano') y extra para porciones / multiplicador." },
];

function AdminWizard() {
  const [activeTab, setActiveTab] = useState<WizardOptionType>("flavor");
  const tabMeta = TABS.find((t) => t.type === activeTab)!;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Opciones del wizard
        </span>
        <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
          Personaliza las opciones del wizard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Añade, edita o elimina las opciones que ve el cliente al personalizar su pastel.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 rounded-full bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.type}
            onClick={() => setActiveTab(t.type)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === t.type ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-muted-foreground">{tabMeta.help}</p>

      <OptionsManager type={activeTab} />
    </section>
  );
}

function OptionsManager({ type }: { type: WizardOptionType }) {
  const { data: options, isLoading } = useWizardOptions(type);
  const createMut = useCreateWizardOption();
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const showValue = type === "color" || type === "size";
  const showDescription = type === "decoration";

  async function handleCreate() {
    if (!newLabel.trim()) return;
    try {
      await createMut.mutateAsync({
        type,
        label: newLabel.trim(),
        value: showValue ? newValue.trim() || null : null,
        description: showDescription ? newDescription.trim() || null : null,
        extra: {},
        sort_order: (options?.length ?? 0) + 1,
        active: true,
      });
      setNewLabel("");
      setNewValue("");
      setNewDescription("");
      toast.success("Opción añadida");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card p-4 ring-1 ring-border/60">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Añadir nueva opción</h3>
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Nombre / etiqueta"
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
          />
          {showValue && (
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={type === "color" ? "#FFFFFF" : "id (ej. mediano)"}
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
            />
          )}
          {showDescription && (
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Descripción visible al cliente"
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 sm:col-span-1"
            />
          )}
          <button
            type="button"
            onClick={handleCreate}
            disabled={createMut.isPending || !newLabel.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> Añadir
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : !options || options.length === 0 ? (
        <p className="rounded-2xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Aún no hay opciones para esta categoría.
        </p>
      ) : (
        <ul className="space-y-2">
          {options.map((opt) => (
            <OptionRow key={opt.id} option={opt} showValue={showValue} showDescription={showDescription} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OptionRow({
  option,
  showValue,
  showDescription,
}: {
  option: WizardOption;
  showValue: boolean;
  showDescription: boolean;
}) {
  const updateMut = useUpdateWizardOption();
  const deleteMut = useDeleteWizardOption();
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(option.label);
  const [value, setValue] = useState(option.value ?? "");
  const [description, setDescription] = useState(option.description ?? "");

  async function handleSave() {
    try {
      await updateMut.mutateAsync({
        id: option.id,
        patch: {
          label: label.trim(),
          value: showValue ? value.trim() || null : option.value,
          description: showDescription ? description.trim() || null : option.description,
        },
      });
      setEditing(false);
      toast.success("Actualizado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  async function handleToggleActive() {
    try {
      await updateMut.mutateAsync({ id: option.id, patch: { active: !option.active } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${option.label}"?`)) return;
    try {
      await deleteMut.mutateAsync(option.id);
      toast.success("Eliminado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-border/60">
      {showValue && option.value && option.value.startsWith("#") && (
        <span
          className="h-8 w-8 shrink-0 rounded-full ring-1 ring-border"
          style={{ backgroundColor: option.value }}
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
            <span className={`font-medium ${option.active ? "text-foreground" : "text-muted-foreground line-through"}`}>
              {option.label}
            </span>
            {option.value && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{option.value}</span>
            )}
            {option.description && (
              <span className="line-clamp-1 text-xs text-muted-foreground">{option.description}</span>
            )}
            {!option.active && <span className="text-xs text-muted-foreground">(oculto)</span>}
          </>
        )}
      </div>

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
                setLabel(option.label);
                setValue(option.value ?? "");
                setDescription(option.description ?? "");
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
              onClick={handleToggleActive}
              className={`rounded-full p-2 ${option.active ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
              aria-label="Activar/desactivar"
              title={option.active ? "Desactivar" : "Activar"}
            >
              <Check className="h-4 w-4" />
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
