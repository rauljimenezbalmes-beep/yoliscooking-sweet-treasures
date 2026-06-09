import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useCart, removeFromCart, clearCart } from "@/data/cart-store";
import { useProducts } from "@/data/products-store";
import { sizeLabel } from "@/data/customization";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/carrito")({
  head: () => ({
    meta: [
      { title: "Tu carrito — La Cocina De Yoli" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart();
  const products = useProducts();
  const { user } = useAuth();
  const total = items.reduce((s, i) => s + i.price, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h1 className="mt-6 font-display text-3xl">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted-foreground">
          Explora el catálogo y personaliza tu primer pastel.
        </p>
        <Link
          to="/mis-pasteles"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card"
        >
          Ver Mis Pasteles
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Tu pedido
          </span>
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">Carrito</h1>
        </div>
        <button
          type="button"
          onClick={() => clearCart()}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Vaciar carrito
        </button>
      </div>

      {!user && (
        <div className="mt-6 rounded-2xl bg-primary/5 p-4 text-sm ring-1 ring-primary/20">
          <Link to="/auth" className="font-semibold text-primary underline">
            Inicia sesión
          </Link>{" "}
          <span className="text-muted-foreground">
            para guardar tu carrito en tu cuenta y verlo desde cualquier dispositivo.
          </span>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {items.map((it) => {
            const product = products.find((p) => p.id === it.customization.productId);
            return (
              <li
                key={it.id}
                className="flex gap-4 rounded-2xl bg-card p-4 shadow-card ring-1 ring-border/60"
              >
                {product && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-24 w-24 shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg">{product?.name ?? "Pastel"}</h3>
                    <span className="shrink-0 font-semibold text-primary">
                      {it.price.toFixed(2)} €
                    </span>
                  </div>
                  <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-0.5 text-xs text-muted-foreground sm:grid-cols-2">
                    {it.customization.flavors.length > 0 && (
                      <Row k="Sabores" v={it.customization.flavors.join(", ")} />
                    )}
                    <Row k="Cobertura" v={it.customization.covering} />
                    <Row
                      k="Decoración"
                      v={it.customization.decoration === "clasica" ? "Clásica" : "Personalizada"}
                    />
                    {it.customization.colors.length > 0 && (
                      <Row k="Colores" v={it.customization.colors.join(", ")} />
                    )}
                    {it.customization.theme && <Row k="Temática" v={it.customization.theme} />}
                    {it.customization.description && (
                      <Row k="Idea" v={it.customization.description} />
                    )}
                    <Row k="Tamaño" v={sizeLabel(it.customization.sizeId)} />
                    <Row
                      k="Entrega"
                      v={formatDeliveryDate(it.customization.deliveryDate)}
                    />
                  </dl>
                  <button
                    type="button"
                    onClick={() => {
                      removeFromCart(it.id);
                      toast.success("Pastel eliminado del carrito.");
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <aside>
          <div className="sticky top-24 rounded-2xl bg-card p-5 shadow-card ring-1 ring-border/60">
            <h2 className="font-display text-xl">Resumen</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">{items.length} pastel(es)</span>
              <span className="font-medium">{total.toFixed(2)} €</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span className="text-muted-foreground">Por confirmar</span>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-border/60 pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-2xl text-primary">{total.toFixed(2)} €</span>
            </div>
            <button
              type="button"
              onClick={() =>
                toast.info("Próximamente: pago seguro con tarjeta.", {
                  description: "Te avisaremos cuando el checkout esté disponible.",
                })
              }
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              Continuar al pago
            </button>
            <Link
              to="/mis-pasteles"
              className="mt-2 inline-flex w-full items-center justify-center rounded-full px-5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Seguir explorando
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-1">
      <span className="font-medium text-foreground/70">{k}:</span>
      <span className="truncate">{v}</span>
    </div>
  );
}

function formatDeliveryDate(value: string | undefined | null): string {
  if (!value) return "Sin fecha";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "Sin fecha";
  return format(d, "d 'de' MMM yyyy", { locale: es });
}
