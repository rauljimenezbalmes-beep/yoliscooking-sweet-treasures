import { createFileRoute, Link } from "@tanstack/react-router";
import { useProduct } from "@/data/products-store";
import { CakeForm } from "@/components/CakeForm";

export const Route = createFileRoute("/admin/pasteles/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Editar pastel — La Cocina De Yoli` },
      {
        name: "description",
        content: `Edición del pastel ${params.id}: nombre, precio, ingredientes, imagen y disponibilidad.`,
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditarPastel,
});

function EditarPastel() {
  const { id } = Route.useParams();
  const product = useProduct(id);

  if (!product) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl text-foreground">Pastel no encontrado</h1>
        <p className="mt-3 text-muted-foreground">
          No hemos podido encontrar el pastel que intentas editar.
        </p>
        <Link
          to="/admin/pasteles"
          className="mt-6 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Volver al listado
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Editando pastel
        </span>
        <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
          {product.name}
        </h1>
      </div>
      <CakeForm product={product} />
    </section>
  );
}
