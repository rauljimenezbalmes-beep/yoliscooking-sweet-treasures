import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCartCount } from "@/data/cart-store";

export function CartIcon() {
  const count = useCartCount();
  return (
    <Link
      to="/carrito"
      aria-label={`Carrito (${count})`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground ring-2 ring-background">
          {count}
        </span>
      )}
    </Link>
  );
}
