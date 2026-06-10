import { createFileRoute, Link } from "@tanstack/react-router";
import { useProduct } from "@/data/products-store";
import { CakeForm } from "@/components/CakeForm";
import { ProductWizardEditor } from "@/components/admin/ProductWizardEditor";
import { DEFAULT_ALLERGENS_INFO, DEFAULT_DELIVERY_INFO, type Product } from "@/data/products";

export const Route = createFileRoute("/admin/pasteles/$id")({
  head: ({ params }) => ({
    meta: [
      {
        title:
          params.id === "new"
            ? "Nuevo pastel — La Cocina De Yoli"
            : `Editar pastel — La Cocina De Yoli`,
      },
      {
        name: "description",
        content:
          params.id === "new"
            ? "Crea un nuevo pastel: nombre, precio, ingredientes e imagen."
            : `Edición del pastel ${params.id}: nombre, precio, ingredientes, imagen y disponibilidad.`,
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditarPastel,
});

const EMPTY_PRODUCT: Product = {
  id: "",
  name: "",
  description: "",
  image:
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%25' height='100%25' fill='%23efe4f3'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23a07cb0'>Sin imagen</text></svg>",
  category: "Tartas",
  price: 0,
  ingredients: [],
  tags: [],
  active: true,
  allergensInfo: DEFAULT_ALLERGENS_INFO,
  deliveryInfo: DEFAULT_DELIVERY_INFO,
};

function EditarPastel() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const product = useProduct(id);

  if (isNew) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Nuevo pastel
          </span>
          <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
            Añadir un nuevo pastel
          </h1>
        </div>
        <CakeForm product={EMPTY_PRODUCT} mode="create" />
      </section>
    );
  }

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
      <CakeForm product={product} mode="edit" />
      <ProductWizardEditor productId={product.id} />
    </section>
  );
}
