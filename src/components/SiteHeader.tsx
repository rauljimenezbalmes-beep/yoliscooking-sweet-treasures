import { Link } from "@tanstack/react-router";
import { Cake } from "lucide-react";
import { CartIcon } from "./CartIcon";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary transition-transform group-hover:scale-105">
            <Cake className="h-5 w-5" />
          </span>
          <span className="font-display text-lg leading-none">
            La Cocina <span className="text-primary">De Yoli</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground bg-muted" }}
            className="hidden rounded-full px-4 py-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted sm:inline-flex"
          >
            Inicio
          </Link>
          <Link
            to="/mis-pasteles"
            activeProps={{ className: "text-foreground bg-muted" }}
            className="rounded-full px-4 py-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
          >
            Mis Pasteles
          </Link>
          <CartIcon />
        </nav>
      </div>
    </header>
  );
}
