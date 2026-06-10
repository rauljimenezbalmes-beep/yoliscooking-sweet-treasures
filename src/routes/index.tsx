import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-kitchen.jpg";
import yoli1 from "@/assets/yoli-1.jpg";
import yoli2 from "@/assets/yoli-2.jpg";
import yoli3 from "@/assets/yoli-3.jpg";
import yoli4 from "@/assets/yoli-4.jpg";
import { ArrowRight, Heart } from "lucide-react";
import { CatalogoPasteles } from "@/components/CatalogoPasteles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "La Cocina De Yoli — Repostería artesanal hecha con cariño" },
      {
        name: "description",
        content:
          "Tartas, bizcochos y dulces tradicionales elaborados a mano por Yoli. Recetas familiares, ingredientes seleccionados y mucho cariño en cada bocado.",
      },
      { property: "og:title", content: "La Cocina De Yoli" },
      {
        property: "og:description",
        content:
          "Repostería artesanal: tartas caseras elaboradas con cariño, tradición e ingredientes seleccionados.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const galeria = [
  { src: yoli1, alt: "Yoli preparando una tarta en la cocina" },
  { src: yoli2, alt: "Yoli decorando una tarta artesanal" },
  { src: yoli3, alt: "Yoli horneando bizcochos" },
  { src: yoli4, alt: "Yoli sonriendo junto a varias tartas terminadas" },
];

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-warm" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="animate-float-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-secondary ring-1 ring-border">
              <Heart className="h-3.5 w-3.5 text-primary" />
              Repostería artesanal
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight text-foreground text-balance sm:text-6xl md:text-7xl">
              La Cocina <span className="text-primary">De Yoli</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-balance">
              Yoli lleva años convirtiendo la repostería en momentos especiales. Tartas
              caseras elaboradas con cariño, tradición e ingredientes seleccionados.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/mis-pasteles"
                className="group inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-base font-semibold text-secondary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:bg-secondary/90 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                MIS PASTELES
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#historia"
                className="inline-flex items-center rounded-full px-5 py-3 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                Conoce a Yoli
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/15 blur-2xl" aria-hidden="true" />
            <img
              src={heroImg}
              alt="Cocina artesanal acogedora con repostería casera"
              width={1536}
              height={1024}
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-soft ring-1 ring-border/60"
            />
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <CatalogoPasteles
        eyebrow="Nuestro catálogo"
        title="Mis Pasteles"
        subtitle="Explora todas las tartas, bizcochos y dulces de temporada de Yoli."
      />

      {/* Historia */}
      <section id="historia" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Nuestra esencia
          </span>
          <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
            La historia de Yoli
          </h2>
        </div>

        <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
          <p>
            Lo que comenzó como un hobby en la cocina familiar se convirtió con los años
            en una auténtica pasión. Durante mucho tiempo, Yoli ha elaborado tartas y
            dulces para familiares, amigos y celebraciones especiales.
          </p>
          <p>
            Cada receta ha sido perfeccionada con dedicación, cariño y experiencia. Hoy
            nace <span className="font-medium text-foreground">La Cocina De Yoli</span>,
            un pequeño proyecto personal donde cada tarta sigue elaborándose de forma
            artesanal, manteniendo la esencia de la repostería tradicional que tantas
            sonrisas ha regalado a lo largo de los años.
          </p>
        </div>

        {/* Galería */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {galeria.map((img, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-card ring-1 ring-border/60"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                width={768}
                height={768}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA secundario */}
      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <div className="rounded-3xl bg-accent/60 px-8 py-12 text-center ring-1 ring-border/60 sm:px-12">
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">
            ¡Descubre tu proximo pastel!
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Explora todo el catálogo de tartas, bizcochos y dulces de temporada de Yoli.
          </p>
          <Link
            to="/mis-pasteles"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft"
          >
            Ver Mis Pasteles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
