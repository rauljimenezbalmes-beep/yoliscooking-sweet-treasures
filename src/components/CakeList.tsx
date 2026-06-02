import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import type { Product } from "@/data/products";

export function CakeList({ products }: { products: Product[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
      {products.map((p) => (
        <li key={p.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40">
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-border"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg text-foreground">{p.name}</h3>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {p.category}
              </span>
              {!p.active && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  No disponible
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{p.description}</p>
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-base font-semibold text-foreground">{p.price.toFixed(2)} €</div>
          </div>
          <Link
            to="/admin/pasteles/$id"
            params={{ id: p.id }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Link>
        </li>
      ))}
    </ul>
  );
}
