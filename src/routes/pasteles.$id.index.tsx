import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Sparkles, Wheat } from "lucide-react";
import { useProduct, useProductsLoading } from "@/data/products-store";
import { SIZES, MIN_DELIVERY_DAYS } from "@/data/customization";

export const Route = createFileRoute("/pasteles/$id/")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — La Cocina De Yoli` },
      {
        name: "description",
        content: `Descubre los detalles, tamaños y opciones de personalización del pastel artesanal.`,
      },
    ],
  }),
  component: CakeDetailPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-3xl">Pastel no encontrado</h1>
      <p className="mt-3 text-muted-foreground">Es posible que ya no esté disponible.</p>
      <Link
        to="/mis-pasteles"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Volver al catálogo
      </Link>
    </div>
  ),
});

function CakeDetailPage() {
  const { id } = Route.useParams();
  const product = useProduct(id);
  const isLoading = useProductsLoading();
  if (!product && isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <p className="text-muted-foreground">Cargando pastel…</p>
      </div>
    );
  }
  if (!product) throw notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/mis-pasteles"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/10 blur-2xl" aria-hidden />
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full rounded-3xl object-cover shadow-soft ring-1 ring-border/60"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {product.category}
          </span>
          <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-2xl font-semibold text-primary">
            Desde {product.price.toFixed(2)} €
          </p>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-accent/40 p-4 ring-1 ring-border/60">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Tiempo de entrega
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Mínimo {MIN_DELIVERY_DAYS} días desde el pedido.
              </p>
            </div>
            <div className="rounded-2xl bg-accent/40 p-4 ring-1 ring-border/60">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Wheat className="h-4 w-4 text-primary" />
                Información alérgenos
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Puede contener: gluten, lácteos, huevo y frutos secos.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="font-display text-lg text-foreground">Tamaños y precio orientativo</h2>
            <ul className="mt-3 divide-y divide-border/60 rounded-2xl bg-card ring-1 ring-border/60">
              {SIZES.map((s) => (
                <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-medium text-foreground">{s.label}</span>
                  <span className="text-muted-foreground">{s.portions} porc.</span>
                  <span className="font-semibold text-primary">
                    {(product.price * s.multiplier).toFixed(2)} €
                  </span>
                </li>
              ))}
            </ul>
          </div>


          <div className="mt-8">
            <Link
              to="/pasteles/$id/personalizar"
              params={{ id: product.id }}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              Personalizar mi pastel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
