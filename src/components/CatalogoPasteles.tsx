import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { categories, type Category, type Product } from "@/data/products";
import { useProducts } from "@/data/products-store";
import { ProductCard } from "@/components/ProductCard";

const categorySlug: Record<Category, string> = {
  "Tartas": "cat-tartas",
  "Bizcochos": "cat-bizcochos",
  "Dulces de Temporada": "cat-dulces-temporada",
};

function scrollToCategory(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

interface CatalogoPasteleProps {
  showHeader?: boolean;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function CatalogoPasteles({
  showHeader = true,
  eyebrow = "Catálogo artesanal",
  title = "Mis Pasteles",
  subtitle = "Todas las tartas, bizcochos y dulces de Yoli, elaborados a mano con recetas familiares.",
}: CatalogoPasteleProps) {
  const products = useProducts();
  const [query, setQuery] = useState("");

  const filteredByCategory = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<Category, Product[]>();
    for (const cat of categories) map.set(cat, []);
    for (const p of products) {
      if (!p.active) continue;
      if (
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        map.get(p.category)!.push(p);
      }
    }
    return map;
  }, [products, query]);

  const totalMatches = useMemo(
    () => Array.from(filteredByCategory.values()).reduce((s, a) => s + a.length, 0),
    [filteredByCategory],
  );

  return (
    <>
      <section className="bg-gradient-warm">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {showHeader && (
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {eyebrow}
              </span>
              <h2 className="mt-3 font-display text-5xl text-foreground sm:text-6xl">
                {title}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{subtitle}</p>
            </div>
          )}

          <div className="mx-auto mt-6 max-w-2xl">
            <label htmlFor="buscar-catalogo" className="sr-only">
              Buscar tu tarta
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="buscar-catalogo"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar tu tarta…"
                className="h-14 w-full rounded-full border border-border bg-background pl-14 pr-5 text-base text-foreground shadow-card outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
            </div>
            {query && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                {totalMatches === 0
                  ? "No hemos encontrado tartas con ese nombre."
                  : `${totalMatches} resultado${totalMatches === 1 ? "" : "s"} para “${query}”.`}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {categories.map((cat) => {
                const has = (filteredByCategory.get(cat) ?? []).length > 0;
                if (!has) return null;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => scrollToCategory(categorySlug[cat])}
                    className="rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {categories.map((cat) => {
          const items = filteredByCategory.get(cat) ?? [];
          if (items.length === 0) return null;
          return (
            <section
              key={cat}
              id={categorySlug[cat]}
              className="mb-16 scroll-mt-24 last:mb-0"
            >
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-display text-3xl text-foreground sm:text-4xl">
                    {cat}
                  </h3>
                  <div className="mt-2 h-1 w-16 rounded-full bg-primary/50" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {items.length} {items.length === 1 ? "creación" : "creaciones"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
