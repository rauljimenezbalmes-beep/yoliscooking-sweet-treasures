import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { Cake, Sliders, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administración — La Cocina De Yoli" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth" });
    }
  }, [authLoading, user, navigate]);

  if (authLoading || (user && roleLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando…
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl text-foreground">Acceso restringido</h1>
        <p className="mt-3 text-muted-foreground">
          Esta sección es solo para administradores.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
      </section>
    );
  }

  return (
    <div>
      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-3 sm:px-6">
          <span className="mr-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Admin
          </span>
          <AdminTab to="/admin/pasteles" icon={<Cake className="h-3.5 w-3.5" />} active={pathname.startsWith("/admin/pasteles")}>
            Pasteles
          </AdminTab>
          <AdminTab to="/admin/wizard" icon={<Sliders className="h-3.5 w-3.5" />} active={pathname.startsWith("/admin/wizard")}>
            Wizard
          </AdminTab>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

function AdminTab({
  to,
  active,
  icon,
  children,
}: {
  to: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "bg-background text-foreground shadow-sm ring-1 ring-border"
          : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
