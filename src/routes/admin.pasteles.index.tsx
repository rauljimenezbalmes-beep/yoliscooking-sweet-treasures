import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { categories } from "@/data/products";
import { useProducts, resetProducts } from "@/data/products-store";
import { CakeList } from "@/components/CakeList";

export const Route = createFileRoute("/admin/pasteles/")({
  head: () => ({
    meta: [
      { title: "Gestión de pasteles — La Cocina De Yoli" },
      {
        name: "description",
        content:
          "Panel de gestión de pasteles: edita nombre, precio, descripción, ingredientes e imagen de cada pastel.",
      },
    ],
  }),
  component: AdminPasteles,
});

function AdminPasteles() {
  const products = useProducts();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("Todas");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (cat !== "Todas" && p.category !== cat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [products, query, cat]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Panel
          </span>
          <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
            Gestión de pasteles
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Edita cada pastel de forma independiente. Los cambios se guardan al instante en este
            navegador.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("¿Restablecer todos los pasteles a los valores originales?")) {
              resetProducts();
            }
          }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Restablecer
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar pastel…"
            className="h-11 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="h-11 rounded-full border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
        >
          <option value="Todas">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <p className="rounded-2xl bg-muted/50 p-8 text-center text-muted-foreground">
            No hay pasteles que coincidan con la búsqueda.
          </p>
        ) : (
          <CakeList products={filtered} />
        )}
      </div>
    </section>
  );
}
