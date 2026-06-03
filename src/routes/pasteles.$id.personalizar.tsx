import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Sparkles, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useProduct } from "@/data/products-store";
import {
  FLAVORS,
  COVERINGS,
  THEMES,
  SIZES,
  COLOR_PALETTE,
  MIN_DELIVERY_DAYS,
  computePrice,
  sizeLabel,
  type CakeCustomization,
  type DecorationType,
} from "@/data/customization";
import { addToCart } from "@/data/cart-store";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pasteles/$id/personalizar")({
  head: ({ params }) => ({
    meta: [
      { title: `Personaliza tu ${params.id} — La Cocina De Yoli` },
      {
        name: "description",
        content:
          "Crea tu tarta personalizada eligiendo sabores, cobertura, decoración, tamaño y fecha de entrega.",
      },
    ],
  }),
  component: PersonalizarPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-3xl">Pastel no encontrado</h1>
      <Link to="/mis-pasteles" className="mt-6 inline-block text-primary underline">
        Volver al catálogo
      </Link>
    </div>
  ),
});

function PersonalizarPage() {
  const { id } = Route.useParams();
  const product = useProduct(id);
  const navigate = useNavigate();
  if (!product) throw notFound();

  const allowsFlavors = product.category === "Tartas" || product.category === "Bizcochos";

  const [flavors, setFlavors] = useState<string[]>([]);
  const [covering, setCovering] = useState<string>("");
  const [decoration, setDecoration] = useState<DecorationType | "">("");
  const [colors, setColors] = useState<string[]>([]);
  const [theme, setTheme] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [sizeId, setSizeId] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + MIN_DELIVERY_DAYS);
    return d;
  }, []);

  const isCustom = decoration === "personalizada";

  const requiredOk =
    (!allowsFlavors || flavors.length >= 1) &&
    covering !== "" &&
    decoration !== "" &&
    (!isCustom || (colors.length >= 1 && theme !== "")) &&
    sizeId !== "" &&
    !!deliveryDate;

  const totalSteps =
    (allowsFlavors ? 1 : 0) + 2 + (isCustom ? 3 : 0) + 2; // flavors? + covering + decoration + (colors+theme+desc) + size + date
  const completed =
    (allowsFlavors ? (flavors.length >= 1 ? 1 : 0) : 0) +
    (covering ? 1 : 0) +
    (decoration ? 1 : 0) +
    (isCustom ? (colors.length >= 1 ? 1 : 0) + (theme ? 1 : 0) + 1 : 0) + // description optional, counts as done
    (sizeId ? 1 : 0) +
    (deliveryDate ? 1 : 0);
  const progress = Math.min(100, Math.round((completed / totalSteps) * 100));

  const price = sizeId
    ? computePrice(product.price, sizeId, isCustom ? "personalizada" : "clasica")
    : product.price;

  function toggleFlavor(f: string) {
    setFlavors((prev) => {
      if (prev.includes(f)) return prev.filter((x) => x !== f);
      if (prev.length >= 2) return prev;
      return [...prev, f];
    });
  }
  function toggleColor(c: string) {
    setColors((prev) => {
      if (prev.includes(c)) return prev.filter((x) => x !== c);
      if (prev.length >= 2) return prev;
      return [...prev, c];
    });
  }

  function handleSubmit() {
    if (!requiredOk || !deliveryDate) {
      toast.error("Completa todos los pasos obligatorios.");
      return;
    }
    const customization: CakeCustomization = {
      productId: product!.id,
      flavors,
      covering,
      decoration: decoration as DecorationType,
      colors: isCustom ? colors : [],
      theme: isCustom ? theme : undefined,
      description: isCustom ? description.trim() || undefined : undefined,
      sizeId,
      deliveryDate: format(deliveryDate, "yyyy-MM-dd"),
    };
    addToCart(customization, price);
    toast.success("¡Pastel añadido al carrito!");
    navigate({ to: "/carrito" });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 pb-32 md:pb-12">
      <Link
        to="/pasteles/$id"
        params={{ id: product.id }}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a {product.name}
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Personaliza
          </span>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">
            Tu {product.name} a medida
          </h1>
        </div>
      </div>

      {/* Progress bar */}
      <div className="sticky top-16 z-30 -mx-4 mt-6 bg-background/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progreso</span>
          <span className="font-semibold text-foreground">{progress}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
          {allowsFlavors && (
            <Section
              n={1}
              title="Sabores"
              hint="Elige uno o dos sabores para las capas interiores."
              done={flavors.length >= 1}
            >
              <ChipGrid>
                {FLAVORS.map((f) => (
                  <Chip key={f} selected={flavors.includes(f)} onClick={() => toggleFlavor(f)}>
                    {f}
                  </Chip>
                ))}
              </ChipGrid>
              <p className="mt-2 text-xs text-muted-foreground">
                {flavors.length}/2 seleccionados
              </p>
            </Section>
          )}

          <Section
            n={allowsFlavors ? 2 : 1}
            title="Cobertura"
            hint="Elige una cobertura."
            done={!!covering}
          >
            <ChipGrid>
              {COVERINGS.map((c) => (
                <Chip key={c} selected={covering === c} onClick={() => setCovering(c)}>
                  {c}
                </Chip>
              ))}
            </ChipGrid>
          </Section>

          <Section
            n={allowsFlavors ? 3 : 2}
            title="Tipo de decoración"
            done={!!decoration}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <DecorCard
                title="Decoración clásica"
                description="La opción perfecta para los amantes de la estética más tradicional donde el protagonista principal es el sabor auténtico."
                selected={decoration === "clasica"}
                onClick={() => setDecoration("clasica")}
              />
              <DecorCard
                title="Decoración personalizada"
                description="Crea tu pastel a tu gusto y nosotros lo haremos realidad."
                selected={decoration === "personalizada"}
                onClick={() => setDecoration("personalizada")}
                badge={`+${8} €`}
              />
            </div>
          </Section>

          {isCustom && (
            <>
              <Section title="Colores principales" hint="Elige uno o dos colores." done={colors.length >= 1}>
                <div className="flex flex-wrap gap-3">
                  {COLOR_PALETTE.map((c) => {
                    const selected = colors.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => toggleColor(c.name)}
                        className={cn(
                          "group flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all",
                          selected && "bg-primary/10 ring-2 ring-primary",
                        )}
                        aria-pressed={selected}
                      >
                        <span
                          className="h-10 w-10 rounded-full ring-1 ring-border/60"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs text-foreground/80">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{colors.length}/2 seleccionados</p>
              </Section>

              <Section title="Temática" done={!!theme}>
                <ChipGrid>
                  {THEMES.map((t) => (
                    <Chip key={t} selected={theme === t} onClick={() => setTheme(t)}>
                      {t}
                    </Chip>
                  ))}
                </ChipGrid>
              </Section>

              <Section title="Descripción de la idea" hint="Opcional. Máximo 50 caracteres." done={true}>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 50))}
                  placeholder="Ej: Unicornio rosa con detalles dorados"
                  rows={3}
                  maxLength={50}
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {description.length}/50
                </p>
              </Section>
            </>
          )}

          <Section title="Tamaño" done={!!sizeId}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SIZES.map((s) => {
                const selected = sizeId === s.id;
                const p = computePrice(product.price, s.id, isCustom ? "personalizada" : "clasica");
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSizeId(s.id)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-card",
                      selected && "border-primary bg-primary/5 ring-2 ring-primary",
                    )}
                  >
                    <span className="font-display text-lg">{s.label}</span>
                    <span className="text-xs text-muted-foreground">{s.portions} porciones</span>
                    <span className="mt-1 text-sm font-semibold text-primary">{p.toFixed(2)} €</span>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Fecha de entrega" hint={`Mínimo ${MIN_DELIVERY_DAYS} días.`} done={!!deliveryDate}>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex w-full max-w-sm items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:bg-muted",
                    !deliveryDate && "text-muted-foreground",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {deliveryDate
                      ? format(deliveryDate, "EEEE d 'de' MMMM yyyy", { locale: es })
                      : "Selecciona una fecha"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deliveryDate}
                  onSelect={setDeliveryDate}
                  disabled={{ before: minDate }}
                  locale={es}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </Section>
        </div>

        {/* Summary */}
        <aside className="hidden md:block">
          <div className="sticky top-32 rounded-2xl bg-card p-5 shadow-card ring-1 ring-border/60">
            <h3 className="font-display text-lg">Resumen del pedido</h3>
            <div className="mt-4 flex items-center gap-3">
              <img src={product.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div>
                <p className="text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>
            </div>
            <SummaryList
              flavors={flavors}
              covering={covering}
              decoration={decoration}
              colors={colors}
              theme={theme}
              description={description}
              sizeId={sizeId}
              deliveryDate={deliveryDate}
            />
            <div className="mt-5 flex items-end justify-between border-t border-border/60 pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-2xl text-primary">{price.toFixed(2)} €</span>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!requiredOk}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Pedir mi pastel
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-display text-xl text-primary">{price.toFixed(2)} €</p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!requiredOk}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            Pedir mi pastel
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  n,
  title,
  hint,
  done,
  children,
}: {
  n?: number;
  title: string;
  hint?: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-border/60 sm:p-6">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-foreground">
            {n !== undefined && <span className="mr-2 text-primary">{n}.</span>}
            {title}
          </h2>
          {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
        </div>
        {done && (
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Check className="h-4 w-4" />
          </span>
        )}
      </header>
      {children}
    </section>
  );
}

function ChipGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-all",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-card"
          : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function DecorCard({
  title,
  description,
  selected,
  onClick,
  badge,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card",
        selected && "border-primary bg-primary/5 ring-2 ring-primary",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg text-foreground">{title}</h3>
        {badge && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </button>
  );
}

function SummaryList({
  flavors,
  covering,
  decoration,
  colors,
  theme,
  description,
  sizeId,
  deliveryDate,
}: {
  flavors: string[];
  covering: string;
  decoration: DecorationType | "";
  colors: string[];
  theme: string;
  description: string;
  sizeId: string;
  deliveryDate?: Date;
}) {
  const rows: Array<[string, string]> = [];
  if (flavors.length) rows.push(["Sabores", flavors.join(", ")]);
  if (covering) rows.push(["Cobertura", covering]);
  if (decoration) rows.push(["Decoración", decoration === "clasica" ? "Clásica" : "Personalizada"]);
  if (colors.length) rows.push(["Colores", colors.join(", ")]);
  if (theme) rows.push(["Temática", theme]);
  if (description) rows.push(["Idea", description]);
  if (sizeId) rows.push(["Tamaño", sizeLabel(sizeId)]);
  if (deliveryDate) rows.push(["Entrega", format(deliveryDate, "d MMM yyyy", { locale: es })]);

  if (rows.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        Comienza a personalizar tu pastel y verás aquí tu selección.
      </p>
    );
  }

  return (
    <dl className="mt-4 space-y-2 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="text-right font-medium text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
