import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={768}
          height={768}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {!product.active && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-medium text-background">
            No disponible
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl text-foreground">{product.name}</h3>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {product.price.toFixed(2)} €
          </span>
        </div>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Link
            to="/admin/pasteles/$id"
            params={{ id: product.id }}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Link>
        </div>
      </div>
    </article>
  );
}
