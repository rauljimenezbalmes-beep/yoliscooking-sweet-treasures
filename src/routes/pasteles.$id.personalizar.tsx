import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useProduct, useProductsLoading } from "@/data/products-store";
import { addToCart, updateCartItem, useCart } from "@/data/cart-store";
import {
  MIN_DELIVERY_DAYS,
  SIZES,
  resolveWizardPrice,
  type CakeCustomization,
} from "@/data/customization";
import {
  CustomizationProvider,
  useCustomization,
  type CustomizationState,
} from "@/context/CustomizationContext";
import { WizardProgress, type WizardStep } from "@/components/customization/WizardProgress";
import { WizardFooter } from "@/components/customization/WizardFooter";
import { StepFlavors } from "@/components/customization/steps/StepFlavors";
import { StepCovering } from "@/components/customization/steps/StepCovering";
import { StepDecoration } from "@/components/customization/steps/StepDecoration";
import { StepDetails } from "@/components/customization/steps/StepDetails";
import { StepSummary } from "@/components/customization/steps/StepSummary";
import { useResolvedWizardOptions } from "@/data/product-wizard-store";

const searchSchema = z.object({
  edit: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/pasteles/$id/personalizar")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: `Personaliza tu pastel — La Cocina De Yoli` },
      {
        name: "description",
        content:
          "Configura tu pastel paso a paso: sabores, relleno, decoración y más.",
      },
    ],
  }),
  component: PersonalizarRoute,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-3xl">Pastel no encontrado</h1>
      <Link to="/mis-pasteles" className="mt-6 inline-block text-primary underline">
        Volver al catálogo
      </Link>
    </div>
  ),
});

type StepKey = "flavors" | "covering" | "decoration" | "details" | "summary";

interface BuiltStep {
  key: StepKey;
  label: string;
  render: () => ReactNode;
  valid: boolean;
}

function PersonalizarRoute() {
  const { id } = Route.useParams();
  const { edit } = Route.useSearch();
  const product = useProduct(id);
  const isLoading = useProductsLoading();
  const items = useCart();
  const existing = edit ? items.find((i) => i.id === edit) : undefined;
  const initial: Partial<CustomizationState> | undefined = existing
    ? {
        flavors: existing.customization.flavors,
        covering: existing.customization.covering,
        decoration: existing.customization.decoration,
        colors: existing.customization.colors,
        theme: existing.customization.theme ?? "",
        description: existing.customization.description ?? "",
        sizeId: existing.customization.sizeId,
        deliveryDate: existing.customization.deliveryDate || undefined,
      }
    : undefined;
  if (!product && isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-muted-foreground">Cargando pastel…</p>
      </div>
    );
  }
  return (
    <CustomizationProvider initial={initial}>
      <PersonalizarPage editId={edit} />
    </CustomizationProvider>
  );
}

function PersonalizarPage({ editId }: { editId?: string }) {
  const { id } = Route.useParams();
  const product = useProduct(id);
  const navigate = useNavigate();
  const { state } = useCustomization();
  const [current, setCurrent] = useState<number>(1);
  const isEditing = !!editId;

  if (!product) throw notFound();

  const isBizcocho = product.category === "Bizcochos";

  const { options: flavorOpts } = useResolvedWizardOptions(product.id, "flavor");
  const { options: coveringOpts } = useResolvedWizardOptions(product.id, "covering");
  const { options: decoOpts } = useResolvedWizardOptions(product.id, "decoration");
  const { options: themeOpts } = useResolvedWizardOptions(product.id, "theme");
  const { options: colorOpts } = useResolvedWizardOptions(product.id, "color");
  const { options: sizeOpts } = useResolvedWizardOptions(product.id, "size");

  const minDeliveryOk = (() => {
    if (!state.deliveryDate) return false;
    const d = new Date(state.deliveryDate);
    const min = new Date();
    min.setHours(0, 0, 0, 0);
    min.setDate(min.getDate() + MIN_DELIVERY_DAYS);
    return d.getTime() >= min.getTime();
  })();

  const steps = useMemo<BuiltStep[]>(() => {
    const list: BuiltStep[] = [];
    if (flavorOpts.length > 0) {
      const maxFlavors = product.maxFlavors ?? 2;
      list.push({
        key: "flavors",
        label: "Sabores",
        render: () => <StepFlavors productId={product.id} />,
        valid: state.flavors.length >= 1 && state.flavors.length <= maxFlavors,
      });
    }
    if (coveringOpts.length > 0) {
      list.push({
        key: "covering",
        label: isBizcocho ? "Cobertura" : "Relleno",
        render: () => <StepCovering productId={product.id} isBizcocho={isBizcocho} />,
        valid: state.covering !== "",
      });
    }
    if (decoOpts.length > 0 || themeOpts.length > 0 || colorOpts.length > 0) {
      list.push({
        key: "decoration",
        label: "Decoración",
        render: () => <StepDecoration productId={product.id} />,
        valid:
          decoOpts.length === 0
            ? true
            : state.decoration !== "" &&
              (state.decoration !== "personalizada" ||
                colorOpts.length === 0 ||
                state.colors.length >= 1),
      });
    }
    list.push({
      key: "details",
      label: "Detalles",
      render: () => <StepDetails productId={product.id} />,
      valid: minDeliveryOk && (sizeOpts.length === 0 || state.sizeId !== ""),
    });
    list.push({
      key: "summary",
      label: "Resumen",
      render: () => <StepSummary product={product} />,
      valid: true,
    });
    return list;
  }, [
    product,
    isBizcocho,
    flavorOpts.length,
    coveringOpts.length,
    decoOpts.length,
    themeOpts.length,
    colorOpts.length,
    sizeOpts.length,
    state.flavors.length,
    state.covering,
    state.decoration,
    state.colors.length,
    state.sizeId,
    minDeliveryOk,
  ]);

  useEffect(() => {
    if (current > steps.length) setCurrent(steps.length);
  }, [current, steps.length]);

  const progressSteps: WizardStep[] = steps.map((s, i) => ({
    id: i + 1,
    label: s.label,
  }));

  const activeIndex = Math.min(current, steps.length) - 1;
  const activeStep = steps[activeIndex];
  const canGoNext = activeStep?.valid ?? false;
  const isLast = current === steps.length;

  const completed = new Set<number>(
    steps
      .map((s, i) => ({ id: i + 1, valid: s.valid }))
      .filter((s) => s.id < current && s.valid)
      .map((s) => s.id),
  );

  async function handleNext() {
    if (!canGoNext) return;
    if (isLast) {
      if (!state.deliveryDate || !minDeliveryOk) {
        toast.error("Selecciona una fecha de entrega válida en el paso Detalles.");
        return;
      }
      const sizeIdFinal =
        state.sizeId || (SIZES.find((s) => s.id === "pequeno") ? "pequeno" : "");
      const customization: CakeCustomization = {
        productId: product!.id,
        flavors: state.flavors,
        covering: state.covering,
        decoration: state.decoration || "clasica",
        colors: state.colors,
        theme: state.theme || undefined,
        description: state.description || undefined,
        sizeId: sizeIdFinal,
        deliveryDate: state.deliveryDate,
      };
      const price = resolveWizardPrice(
        product!.price,
        sizeOpts,
        sizeIdFinal,
        customization.decoration,
      );
      if (isEditing && editId) {
        await updateCartItem(editId, customization, price);
        toast.success("Pastel actualizado.");
      } else {
        await addToCart(customization, price);
        toast.success("¡Pastel añadido al carrito!");
      }
      navigate({ to: "/carrito" });
      return;
    }
    setCurrent((c) => Math.min(steps.length, c + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setCurrent((c) => Math.max(1, c - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleJump(step: number) {
    setCurrent(step);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-16 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/pasteles/$id"
              params={{ id: product.id }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver a</span> {product.name}
            </Link>
            <div className="flex items-center gap-2.5">
              <img
                src={product.image}
                alt=""
                className="h-9 w-9 rounded-lg object-cover ring-1 ring-border/60"
              />
              <div className="hidden text-right sm:block">
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary">
                  {isEditing ? "Editando" : "Personalizando"}
                </p>
                <p className="text-sm font-semibold text-foreground">{product.name}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <WizardProgress
              steps={progressSteps}
              current={activeIndex + 1}
              completed={completed}
              onJump={handleJump}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div key={activeStep?.key ?? "empty"} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeStep?.render()}
        </div>
      </main>

      <WizardFooter
        onBack={handleBack}
        onNext={handleNext}
        canGoBack={current > 1}
        canGoNext={canGoNext}
        isLast={isLast}
        nextLabel={isLast ? (isEditing ? "Guardar cambios" : "Añadir al carrito") : "Continuar"}
      />
    </div>
  );
}
