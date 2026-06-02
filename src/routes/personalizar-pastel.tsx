import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  Cake,
  Check,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  PRODUCT_TYPES,
  FLAVORS,
  COVERINGS,
  THEMES,
  COLOR_PALETTE,
  SIZES,
  TIME_SLOTS,
  type ProductTypeId,
} from "@/data/configurator";

export const Route = createFileRoute("/personalizar-pastel")({
  head: () => ({
    meta: [
      { title: "Personaliza tu pastel artesanal — La Cocina De Yoli" },
      {
        name: "description",
        content:
          "Crea tu tarta personalizada eligiendo sabores, cobertura, decoración, tamaño y fecha de entrega.",
      },
      { property: "og:title", content: "Personaliza tu pastel artesanal" },
      {
        property: "og:description",
        content:
          "Configura paso a paso tu pastel artesanal: sabores, coberturas, decoración y entrega.",
      },
      { property: "og:url", content: "/personalizar-pastel" },
    ],
    links: [{ rel: "canonical", href: "/personalizar-pastel" }],
  }),
  component: PersonalizarPastel,
});

const orderSchema = z.object({
  productType: z.string().min(1),
  flavors: z.array(z.string()).min(1).max(2),
  covering: z.string().min(1),
  decoration: z.enum(["clasica", "personalizada"]),
  colors: z.array(z.string()).max(2),
  theme: z.string().optional(),
  description: z.string().max(50),
  size: z.string().min(1),
  date: z.date(),
  timeSlot: z.string().min(1),
});

type OrderState = {
  productType: ProductTypeId | "";
  flavors: string[];
  covering: string;
  decoration: "clasica" | "personalizada" | "";
  colors: string[];
  theme: string;
  description: string;
  size: string;
  date: Date | undefined;
  timeSlot: string;
};

const initialState: OrderState = {
  productType: "",
  flavors: [],
  covering: "",
  decoration: "",
  colors: [],
  theme: "",
  description: "",
  size: "",
  date: undefined,
  timeSlot: "",
};

function PersonalizarPastel() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderState>(initialState);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const isCustom = order.decoration === "personalizada";

  // Define step flow dynamically
  const steps = useMemo(() => {
    const s: { key: string; label: string }[] = [
      { key: "product", label: "Producto" },
      { key: "flavors", label: "Sabores" },
      { key: "covering", label: "Cobertura" },
      { key: "decoration", label: "Decoración" },
    ];
    if (isCustom) {
      s.push(
        { key: "colors", label: "Colores" },
        { key: "theme", label: "Temática" },
        { key: "description", label: "Idea" },
      );
    }
    s.push(
      { key: "size", label: "Tamaño" },
      { key: "date", label: "Fecha" },
      { key: "summary", label: "Resumen" },
    );
    return s;
  }, [isCustom]);

  const currentKey = steps[step]?.key;
  const totalSteps = steps.length;

  const canContinue = (): boolean => {
    switch (currentKey) {
      case "product":
        return !!order.productType;
      case "flavors":
        return order.flavors.length >= 1 && order.flavors.length <= 2;
      case "covering":
        return !!order.covering;
      case "decoration":
        return !!order.decoration;
      case "colors":
        return order.colors.length >= 1 && order.colors.length <= 2;
      case "theme":
        return !!order.theme;
      case "description":
        return order.description.trim().length > 0;
      case "size":
        return !!order.size;
      case "date":
        return !!order.date && !!order.timeSlot;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
  };
  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const selectProduct = (id: ProductTypeId) => {
    setOrder((o) => ({ ...o, productType: id }));
    setTimeout(() => setStep((s) => s + 1), 180);
  };

  const toggleFlavor = (f: string) => {
    setOrder((o) => {
      if (o.flavors.includes(f)) return { ...o, flavors: o.flavors.filter((x) => x !== f) };
      if (o.flavors.length >= 2) return o;
      return { ...o, flavors: [...o.flavors, f] };
    });
  };

  const toggleColor = (c: string) => {
    setOrder((o) => {
      if (o.colors.includes(c)) return { ...o, colors: o.colors.filter((x) => x !== c) };
      if (o.colors.length >= 2) return o;
      return { ...o, colors: [...o.colors, c] };
    });
  };

  const selectDecoration = (d: "clasica" | "personalizada") => {
    setOrder((o) => ({
      ...o,
      decoration: d,
      // clear custom fields when going classic
      ...(d === "clasica" ? { colors: [], theme: "", description: "" } : {}),
    }));
    setTimeout(() => setStep((s) => s + 1), 180);
  };

  const sizeObj = SIZES.find((s) => s.id === order.size);
  const estimatedPrice = useMemo(() => {
    if (!sizeObj) return 0;
    let p = sizeObj.price;
    if (isCustom) p += 12; // recargo decoración personalizada
    return p;
  }, [sizeObj, isCustom]);

  const submit = () => {
    const result = orderSchema.safeParse({
      productType: order.productType,
      flavors: order.flavors,
      covering: order.covering,
      decoration: order.decoration,
      colors: order.colors,
      theme: order.theme || undefined,
      description: order.description,
      size: order.size,
      date: order.date,
      timeSlot: order.timeSlot,
    });
    if (!result.success) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl bg-gradient-warm p-10 text-center shadow-soft ring-1 ring-border/60 animate-float-in">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/20 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-4xl text-foreground sm:text-5xl">
            ¡Solicitud enviada!
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Yoli ha recibido tu pedido y se pondrá en contacto contigo muy pronto para
            confirmar todos los detalles. Gracias por confiar en La Cocina De Yoli.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => {
                setOrder(initialState);
                setStep(0);
                setSubmitted(false);
              }}
              variant="outline"
              className="rounded-full"
            >
              Crear otro pastel
            </Button>
            <Button
              onClick={() => navigate({ to: "/" })}
              className="rounded-full"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-secondary ring-1 ring-border">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Configurador artesanal
        </span>
        <h1 className="mt-4 font-display text-4xl text-foreground sm:text-5xl">
          Personaliza tu pastel
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Diseña tu tarta paso a paso. Yoli la elaborará a mano especialmente para ti.
        </p>
      </div>

      {/* Progress */}
      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            Paso {step + 1} de {totalSteps} · {steps[step]?.label}
          </span>
          <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <div className="mt-4 hidden flex-wrap gap-1.5 sm:flex">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all",
                i <= step ? "bg-primary" : "bg-muted",
              )}
              aria-hidden
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div key={currentKey} className="mt-10 animate-float-in">
        {currentKey === "product" && (
          <StepProduct selected={order.productType} onSelect={selectProduct} />
        )}
        {currentKey === "flavors" && (
          <StepFlavors selected={order.flavors} onToggle={toggleFlavor} />
        )}
        {currentKey === "covering" && (
          <StepCovering
            selected={order.covering}
            onSelect={(c) => setOrder((o) => ({ ...o, covering: c }))}
          />
        )}
        {currentKey === "decoration" && (
          <StepDecoration selected={order.decoration} onSelect={selectDecoration} />
        )}
        {currentKey === "colors" && (
          <StepColors selected={order.colors} onToggle={toggleColor} />
        )}
        {currentKey === "theme" && (
          <StepTheme
            selected={order.theme}
            onSelect={(t) => setOrder((o) => ({ ...o, theme: t }))}
          />
        )}
        {currentKey === "description" && (
          <StepDescription
            value={order.description}
            onChange={(v) => setOrder((o) => ({ ...o, description: v }))}
          />
        )}
        {currentKey === "size" && (
          <StepSize
            selected={order.size}
            onSelect={(s) => setOrder((o) => ({ ...o, size: s }))}
          />
        )}
        {currentKey === "date" && (
          <StepDate
            date={order.date}
            timeSlot={order.timeSlot}
            onChange={(d, t) =>
              setOrder((o) => ({
                ...o,
                date: d ?? o.date,
                timeSlot: t ?? o.timeSlot,
              }))
            }
          />
        )}
        {currentKey === "summary" && (
          <StepSummary order={order} price={estimatedPrice} isCustom={isCustom} />
        )}
      </div>

      {/* Nav */}
      <div className="mt-10 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={goBack}
          disabled={step === 0}
          className="rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
        </Button>

        {currentKey === "summary" ? (
          <Button onClick={submit} size="lg" className="rounded-full px-7">
            <Cake className="mr-2 h-5 w-5" /> Solicitar mi pastel
          </Button>
        ) : (
          <Button
            onClick={goNext}
            disabled={!canContinue()}
            className="rounded-full"
          >
            Continuar <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </section>
  );
}

/* ---------- Step components ---------- */

function CardOption({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start gap-2 rounded-2xl bg-card p-5 text-left ring-1 ring-border/60 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft",
        active && "ring-2 ring-primary bg-primary/5",
        className,
      )}
    >
      {active && (
        <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
      {children}
    </button>
  );
}

function StepProduct({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: ProductTypeId) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground sm:text-3xl">
        ¿Qué quieres pedir?
      </h2>
      <p className="mt-1 text-muted-foreground">Elige el tipo de producto que prefieres.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {PRODUCT_TYPES.map((p) => (
          <CardOption
            key={p.id}
            active={selected === p.id}
            onClick={() => onSelect(p.id)}
          >
            <div className="text-4xl">{p.emoji}</div>
            <h3 className="font-display text-xl text-foreground">{p.name}</h3>
            <p className="text-sm text-muted-foreground">{p.description}</p>
          </CardOption>
        ))}
      </div>
    </div>
  );
}

function StepFlavors({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (f: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground sm:text-3xl">
        Elige uno o dos sabores
      </h2>
      <p className="mt-1 text-muted-foreground">
        Has seleccionado <span className="font-semibold text-foreground">{selected.length}</span> de 2.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FLAVORS.map((f) => {
          const active = selected.includes(f);
          const disabled = !active && selected.length >= 2;
          return (
            <button
              key={f}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(f)}
              className={cn(
                "relative rounded-2xl bg-card p-4 text-sm font-medium ring-1 ring-border/60 shadow-card transition-all hover:-translate-y-0.5",
                active && "ring-2 ring-primary bg-primary/10 text-foreground",
                disabled && "opacity-40 hover:translate-y-0 cursor-not-allowed",
              )}
            >
              {active && (
                <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              )}
              {f}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepCovering({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (c: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground sm:text-3xl">
        Elige la cobertura
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COVERINGS.map((c) => (
          <CardOption
            key={c}
            active={selected === c}
            onClick={() => onSelect(c)}
          >
            <span className="font-display text-lg">{c}</span>
          </CardOption>
        ))}
      </div>
    </div>
  );
}

function StepDecoration({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (d: "clasica" | "personalizada") => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground sm:text-3xl">
        Elige tu decoración
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <CardOption
          active={selected === "clasica"}
          onClick={() => onSelect("clasica")}
          className="p-7"
        >
          <span className="text-3xl">🎂</span>
          <h3 className="font-display text-2xl text-foreground">Decoración clásica</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            La opción perfecta para los amantes de la estética más tradicional donde
            el protagonista principal es el sabor auténtico.
          </p>
        </CardOption>
        <CardOption
          active={selected === "personalizada"}
          onClick={() => onSelect("personalizada")}
          className="p-7"
        >
          <span className="text-3xl">🎨</span>
          <h3 className="font-display text-2xl text-foreground">Decoración personalizada</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Crea tu pastel a tu gusto y nosotros lo haremos realidad.
          </p>
        </CardOption>
      </div>
    </div>
  );
}

function StepColors({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (c: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground sm:text-3xl">
        Elige uno o dos colores principales
      </h2>
      <p className="mt-1 text-muted-foreground">
        {selected.length} de 2 seleccionados.
      </p>

      {selected.length > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-muted/60 p-4">
          <span className="text-sm font-medium text-muted-foreground">Vista previa:</span>
          <div className="flex gap-2">
            {selected.map((hex) => (
              <div
                key={hex}
                className="h-10 w-10 rounded-full ring-2 ring-background shadow-card"
                style={{ backgroundColor: hex }}
                aria-label={hex}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
        {COLOR_PALETTE.map((c) => {
          const active = selected.includes(c.hex);
          const disabled = !active && selected.length >= 2;
          return (
            <button
              key={c.hex}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(c.hex)}
              title={c.name}
              className={cn(
                "group relative flex aspect-square flex-col items-center justify-center rounded-2xl ring-2 ring-border/60 transition-all hover:-translate-y-0.5",
                active && "ring-primary ring-[3px]",
                disabled && "opacity-30 cursor-not-allowed",
              )}
              style={{ backgroundColor: c.hex }}
            >
              {active && (
                <span className="grid h-7 w-7 place-items-center rounded-full bg-background/90 text-foreground shadow-card">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepTheme({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (t: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground sm:text-3xl">
        Elige la temática
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {THEMES.map((t) => (
          <CardOption
            key={t.id}
            active={selected === t.id}
            onClick={() => onSelect(t.id)}
            className="items-center text-center"
          >
            <div className="mx-auto text-4xl">{t.emoji}</div>
            <h3 className="mx-auto font-display text-lg">{t.name}</h3>
          </CardOption>
        ))}
      </div>
    </div>
  );
}

function StepDescription({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground sm:text-3xl">
        Describe tu idea
      </h2>
      <p className="mt-1 text-muted-foreground">
        Cuéntanos cómo imaginas tu pastel. Máximo 50 caracteres.
      </p>
      <div className="mt-6">
        <Textarea
          value={value}
          maxLength={50}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Pastel de fútbol azul con balón y nombre Raúl"
          className="min-h-24 rounded-2xl bg-card text-base shadow-card"
        />
        <div className="mt-2 flex justify-end text-xs text-muted-foreground">
          {value.length}/50
        </div>
      </div>
    </div>
  );
}

function StepSize({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (s: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground sm:text-3xl">
        Elige el tamaño
      </h2>
      <p className="mt-1 text-muted-foreground">Precio base orientativo.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SIZES.map((s) => (
          <CardOption
            key={s.id}
            active={selected === s.id}
            onClick={() => onSelect(s.id)}
          >
            <div className="flex w-full items-baseline justify-between gap-2">
              <h3 className="font-display text-xl">{s.name}</h3>
              <span className="font-display text-lg text-primary">{s.price}€</span>
            </div>
            <p className="text-sm text-muted-foreground">{s.servings}</p>
          </CardOption>
        ))}
      </div>
    </div>
  );
}

function StepDate({
  date,
  timeSlot,
  onChange,
}: {
  date: Date | undefined;
  timeSlot: string;
  onChange: (d?: Date, t?: string) => void;
}) {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3); // mínimo 3 días de antelación

  return (
    <div>
      <h2 className="font-display text-2xl text-foreground sm:text-3xl">
        ¿Cuándo lo quieres recibir?
      </h2>
      <p className="mt-1 text-muted-foreground">
        Necesitamos al menos 3 días de antelación.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-card p-3 ring-1 ring-border/60 shadow-card">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => onChange(d, undefined)}
            locale={es}
            disabled={(d) => d < minDate || d.getDay() === 0}
            className="mx-auto"
          />
        </div>
        <div>
          <h3 className="font-display text-lg">Franja horaria</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange(undefined, t)}
                disabled={!date}
                className={cn(
                  "rounded-xl bg-card px-3 py-3 text-sm font-medium ring-1 ring-border/60 shadow-card transition-all hover:-translate-y-0.5",
                  timeSlot === t && "ring-2 ring-primary bg-primary/10",
                  !date && "opacity-40 cursor-not-allowed hover:translate-y-0",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          {date && (
            <p className="mt-4 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
              Fecha elegida:{" "}
              <span className="font-medium text-foreground">
                {format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StepSummary({
  order,
  price,
  isCustom,
}: {
  order: OrderState;
  price: number;
  isCustom: boolean;
}) {
  const product = PRODUCT_TYPES.find((p) => p.id === order.productType);
  const size = SIZES.find((s) => s.id === order.size);
  const theme = THEMES.find((t) => t.id === order.theme);

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 py-3 last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );

  return (
    <div>
      <h2 className="font-display text-2xl text-foreground sm:text-3xl">
        Resumen de tu pastel
      </h2>
      <p className="mt-1 text-muted-foreground">
        Revisa los detalles antes de enviar la solicitud.
      </p>

      <div className="mt-6 rounded-3xl bg-card p-6 shadow-card ring-1 ring-border/60 sm:p-8">
        <Row label="Producto" value={product?.name ?? "—"} />
        <Row label="Sabores" value={order.flavors.join(", ")} />
        <Row label="Cobertura" value={order.covering} />
        <Row
          label="Decoración"
          value={isCustom ? "Personalizada" : "Clásica"}
        />
        {isCustom && (
          <>
            <Row
              label="Colores"
              value={
                <div className="flex gap-1.5">
                  {order.colors.map((c) => (
                    <span
                      key={c}
                      className="h-5 w-5 rounded-full ring-2 ring-background shadow-card"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              }
            />
            <Row label="Temática" value={theme?.name ?? "—"} />
            <Row label="Idea" value={order.description || "—"} />
          </>
        )}
        <Row
          label="Tamaño"
          value={size ? `${size.name} (${size.servings})` : "—"}
        />
        <Row
          label="Fecha de entrega"
          value={
            order.date
              ? `${format(order.date, "d 'de' MMMM, yyyy", { locale: es })} · ${order.timeSlot}`
              : "—"
          }
        />

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-primary/10 px-5 py-4">
          <span className="font-display text-lg">Precio estimado</span>
          <span className="font-display text-2xl text-primary">{price}€</span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          * El precio final puede variar según los detalles de la decoración. Yoli te
          confirmará el importe definitivo al contactar contigo.
        </p>
      </div>
    </div>
  );
}
