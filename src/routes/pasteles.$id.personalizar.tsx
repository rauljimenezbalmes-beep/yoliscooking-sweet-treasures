import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useProduct } from "@/data/products-store";
import { addToCart } from "@/data/cart-store";
import {
  computePrice,
  MIN_DELIVERY_DAYS,
  SIZES,
  type CakeCustomization,
} from "@/data/customization";
import {
  CustomizationProvider,
  useCustomization,
} from "@/context/CustomizationContext";
import { WizardProgress, type WizardStep } from "@/components/customization/WizardProgress";
import { WizardFooter } from "@/components/customization/WizardFooter";
import { StepFlavors } from "@/components/customization/steps/StepFlavors";
import { StepCovering } from "@/components/customization/steps/StepCovering";
import { StepDecoration } from "@/components/customization/steps/StepDecoration";
import { StepDetails } from "@/components/customization/steps/StepDetails";
import { StepSummary } from "@/components/customization/steps/StepSummary";
import { useResolvedWizardOptions } from "@/data/product-wizard-store";

export const Route = createFileRoute("/pasteles/$id/personalizar")({
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

function getSteps(isBizcocho: boolean): WizardStep[] {
  return [
    { id: 1, label: "Sabores" },
    { id: 2, label: isBizcocho ? "Cobertura" : "Relleno" },
    { id: 3, label: "Decoración" },
    { id: 4, label: "Detalles" },
    { id: 5, label: "Resumen" },
  ];
}

function PersonalizarRoute() {
  return (
    <CustomizationProvider>
      <PersonalizarPage />
    </CustomizationProvider>
  );
}

function PersonalizarPage() {
  const { id } = Route.useParams();
  const product = useProduct(id);
  const navigate = useNavigate();
  const { state } = useCustomization();
  const [current, setCurrent] = useState<number>(1);

  if (!product) throw notFound();

  const isBizcocho = product.category === "Bizcochos";
  const steps = getSteps(isBizcocho);

  const { options: coveringOpts } = useResolvedWizardOptions(product.id, "covering");
  const { options: decoOpts } = useResolvedWizardOptions(product.id, "decoration");
  const { options: sizeOpts } = useResolvedWizardOptions(product.id, "size");

  const minDeliveryOk = (() => {
    if (!state.deliveryDate) return false;
    const d = new Date(state.deliveryDate);
    const min = new Date();
    min.setHours(0, 0, 0, 0);
    min.setDate(min.getDate() + MIN_DELIVERY_DAYS);
    return d.getTime() >= min.getTime();
  })();

  const stepValid: Record<number, boolean> = {
    1: state.flavors.length >= 1,
    2: coveringOpts.length === 0 || state.covering !== "",
    3:
      decoOpts.length === 0
        ? true
        : state.decoration !== "" &&
          (state.decoration !== "personalizada" || state.colors.length > 0),
    4: minDeliveryOk && (sizeOpts.length === 0 || state.sizeId !== ""),
    5: true,
  };
  const completed = new Set<number>(
    steps.filter((s) => s.id < current && stepValid[s.id]).map((s) => s.id),
  );

  const isLast = current === steps.length;

  function handleNext() {
    if (!stepValid[current]) return;
    if (isLast) {
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
        deliveryDate: state.deliveryDate ?? "",
      };
      const price = computePrice(
        product!.price,
        SIZES.find((s) => s.id === sizeIdFinal) ? sizeIdFinal : "pequeno",
        customization.decoration,
      );
      addToCart(customization, price);
      toast.success("¡Pastel añadido al carrito!");
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
                  Personalizando
                </p>
                <p className="text-sm font-semibold text-foreground">{product.name}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <WizardProgress
              steps={steps}
              current={current}
              completed={completed}
              onJump={handleJump}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div key={current} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {current === 1 && <StepFlavors productId={product.id} />}
          {current === 2 && (
            <StepCovering productId={product.id} isBizcocho={isBizcocho} />
          )}
          {current === 3 && <StepDecoration productId={product.id} />}
          {current === 4 && <StepDetails productId={product.id} />}
          {current === 5 && <StepSummary product={product} />}
        </div>
      </main>

      <WizardFooter
        onBack={handleBack}
        onNext={handleNext}
        canGoBack={current > 1}
        canGoNext={stepValid[current]}
        isLast={isLast}
        nextLabel={isLast ? "Añadir al carrito" : "Continuar"}
      />
    </div>
  );
}
