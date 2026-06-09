export const FLAVORS = [
  "Crema pastelera",
  "Yema quemada",
  "Trufa",
  "Chocolate blanco",
  "Nocilla",
  "Crema de pistacho",
  "Crema de lotus",
  "Nata",
  "Crema de naranja",
] as const;

export const COVERINGS = [
  "Sin cobertura",
  "Chocolate negro",
  "Chocolate blanco",
  "Almíbar de naranja",
  "Almíbar de limón",
  "Chocolate con leche",
] as const;

export const THEMES = [
  "Personajes",
  "Animales",
  "Fantasía",
  "Tecnología",
  "Deportes",
  "Hobbies",
  "Eventos",
  "Estaciones del año",
] as const;

export const COLOR_PALETTE = [
  { name: "Rosa pastel", hex: "#F8C8DC" },
  { name: "Lila", hex: "#C8A2C8" },
  { name: "Azul cielo", hex: "#A7D8F0" },
  { name: "Menta", hex: "#B8E6C1" },
  { name: "Amarillo", hex: "#FCE38A" },
  { name: "Coral", hex: "#FF9A8B" },
  { name: "Dorado", hex: "#D4AF37" },
  { name: "Chocolate", hex: "#6B3F1D" },
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Negro", hex: "#1A1A1A" },
  { name: "Rojo", hex: "#D7263D" },
  { name: "Verde", hex: "#3A7D44" },
] as const;

export interface SizeOption {
  id: string;
  label: string;
  portions: number;
  multiplier: number;
}

export const SIZES: SizeOption[] = [
  { id: "individual", label: "Individual", portions: 1, multiplier: 0.4 },
  { id: "pequeno", label: "Pequeño", portions: 6, multiplier: 1 },
  { id: "mediano", label: "Mediano", portions: 10, multiplier: 1.5 },
  { id: "grande", label: "Grande", portions: 16, multiplier: 2.2 },
  { id: "xl", label: "Extra grande", portions: 24, multiplier: 3 },
];

export const CUSTOM_DECORATION_FEE = 8;
export const MIN_DELIVERY_DAYS = 3;

export type DecorationType = "clasica" | "personalizada";

export interface CakeCustomization {
  productId: string;
  flavors: string[];
  covering: string;
  decoration: DecorationType;
  colors: string[];
  theme?: string;
  description?: string;
  sizeId: string;
  deliveryDate: string; // ISO yyyy-mm-dd
}

export function computePrice(basePrice: number, sizeId: string, decoration: DecorationType): number {
  const size = SIZES.find((s) => s.id === sizeId);
  const mult = size?.multiplier ?? 1;
  const fee = decoration === "personalizada" ? CUSTOM_DECORATION_FEE : 0;
  return Math.round((basePrice * mult + fee) * 100) / 100;
}

export function sizeLabel(sizeId: string): string {
  return SIZES.find((s) => s.id === sizeId)?.label ?? sizeId;
}

interface SizeOptLike {
  label: string;
  value: string | null;
  extra: unknown;
}

/**
 * Calcula precio usando los tamaños resueltos del admin.
 * Prioridad: extra.price (override por tarta) > basePrice × extra.multiplier > fallback SIZES.
 */
export function resolveWizardPrice(
  basePrice: number,
  sizeOpts: SizeOptLike[],
  sizeId: string,
  decoration: DecorationType,
): number {
  const fee = decoration === "personalizada" ? CUSTOM_DECORATION_FEE : 0;
  const sel = sizeOpts.find((o) => {
    const id = (o.value ?? o.label).toLowerCase();
    return id === sizeId || o.label === sizeId;
  });
  const extra =
    sel && typeof sel.extra === "object" && sel.extra && !Array.isArray(sel.extra)
      ? (sel.extra as Record<string, unknown>)
      : null;
  const overridePrice = extra ? Number(extra.price) : NaN;
  if (Number.isFinite(overridePrice) && overridePrice > 0) {
    return Math.round((overridePrice + fee) * 100) / 100;
  }
  const mult = extra ? Number(extra.multiplier) : NaN;
  if (Number.isFinite(mult) && mult > 0) {
    return Math.round((basePrice * mult + fee) * 100) / 100;
  }
  const fallbackId = SIZES.find((s) => s.id === sizeId) ? sizeId : "pequeno";
  return computePrice(basePrice, fallbackId, decoration);
}
