import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Product, Category } from "@/data/products";
import { categories } from "@/data/products";
import { useUpdateProduct, useCreateProduct, useDeleteProduct } from "@/data/products-store";
import { Save, ArrowLeft, X, Plus, Check, Trash2 } from "lucide-react";

interface CakeFormProps {
  product: Product;
  mode?: "edit" | "create";
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `pastel-${Date.now()}`;
}

export function CakeForm({ product, mode = "edit" }: CakeFormProps) {
  const navigate = useNavigate();
  const updateMut = useUpdateProduct();
  const createMut = useCreateProduct();
  const deleteMut = useDeleteProduct();
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [image, setImage] = useState(product.image);
  const [category, setCategory] = useState<Category>(product.category);
  const [ingredients, setIngredients] = useState<string[]>(product.ingredients);
  const [tags, setTags] = useState<string[]>(product.tags);
  const [active, setActive] = useState(product.active);
  const [allergensInfo, setAllergensInfo] = useState(product.allergensInfo);
  const [deliveryInfo, setDeliveryInfo] = useState(product.deliveryInfo);
  const [newIngredient, setNewIngredient] = useState("");
  const [newTag, setNewTag] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setImage(product.image);
    setCategory(product.category);
    setIngredients(product.ingredients);
    setTags(product.tags);
    setActive(product.active);
    setAllergensInfo(product.allergensInfo);
    setDeliveryInfo(product.deliveryInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      image,
      category,
      ingredients,
      tags,
      active,
      allergensInfo: allergensInfo.trim(),
      deliveryInfo: deliveryInfo.trim(),
    };
    try {
      if (mode === "create") {
        const id = slugify(name);
        await createMut.mutateAsync({ id, ...payload });
        toast.success("Pastel creado");
        navigate({ to: "/admin/pasteles" });
      } else {
        await updateMut.mutateAsync({ id: product.id, patch: payload });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        toast.success("Cambios guardados");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteMut.mutateAsync(product.id);
      toast.success("Pastel eliminado");
      navigate({ to: "/admin/pasteles" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  function addIngredient() {
    const v = newIngredient.trim();
    if (!v) return;
    setIngredients((prev) => [...prev, v]);
    setNewIngredient("");
  }

  function addTag() {
    const v = newTag.trim();
    if (!v) return;
    setTags((prev) => [...prev, v]);
    setNewTag("");
  }

  function handleImageFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setImage(reader.result);
    };
    reader.readAsDataURL(file);
  }

  const submitting = updateMut.isPending || createMut.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/pasteles" })}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al listado
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {saved && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-sm text-primary">
              <Check className="h-4 w-4" /> Guardado
            </span>
          )}
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMut.isPending}
              className="inline-flex items-center gap-2 rounded-full border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" /> Eliminar
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {mode === "create" ? "Crear pastel" : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">Imagen</label>
          <div className="aspect-square overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
            <img src={image} alt={name} className="h-full w-full object-cover" />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImageFile(f);
            }}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/90"
          />
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
            <div>
              <div className="text-sm font-medium text-foreground">Estado</div>
              <div className="text-xs text-muted-foreground">
                {active ? "Activo y visible en el catálogo" : "Oculto / no disponible"}
              </div>
            </div>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-5 w-5 rounded border-border accent-primary"
            />
          </label>
        </div>

        <div className="space-y-5">
          <Field label="Nombre">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
            />
          </Field>

          <Field label="Descripción">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Precio (€)">
              <input
                type="number"
                step="0.5"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
            </Field>
            <Field label="Categoría">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Ingredientes">
            <ChipList items={ingredients} onRemove={(i) => setIngredients((p) => p.filter((_, idx) => idx !== i))} />
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addIngredient();
                  }
                }}
                placeholder="Añadir ingrediente…"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={addIngredient}
                className="inline-flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
              >
                <Plus className="h-4 w-4" /> Añadir
              </button>
            </div>
          </Field>

          <Field label="Etiquetas">
            <ChipList items={tags} onRemove={(i) => setTags((p) => p.filter((_, idx) => idx !== i))} />
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Añadir etiqueta…"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={addTag}
                className="inline-flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
              >
                <Plus className="h-4 w-4" /> Añadir
              </button>
            </div>
          </Field>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

function ChipList({ items, onRemove }: { items: string[]; onRemove: (i: number) => void }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Aún no hay elementos.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((it, i) => (
        <li
          key={`${it}-${i}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm text-foreground"
        >
          {it}
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label={`Eliminar ${it}`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
