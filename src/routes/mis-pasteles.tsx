import { createFileRoute } from "@tanstack/react-router";
import { CatalogoPasteles } from "@/components/CatalogoPasteles";

export const Route = createFileRoute("/mis-pasteles")({
  head: () => ({
    meta: [
      { title: "Mis Pasteles — La Cocina De Yoli" },
      {
        name: "description",
        content:
          "Catálogo de tartas, bizcochos y dulces tradicionales elaborados artesanalmente por Yoli. Encuentra tu tarta favorita.",
      },
      { property: "og:title", content: "Mis Pasteles — La Cocina De Yoli" },
      {
        property: "og:description",
        content:
          "Explora todas las tartas artesanales de Yoli: tartas clásicas, bizcochos y dulces de temporada.",
      },
      { property: "og:url", content: "/mis-pasteles" },
    ],
    links: [{ rel: "canonical", href: "/mis-pasteles" }],
  }),
  component: MisPasteles,
});

function MisPasteles() {
  return <CatalogoPasteles />;
}
