export const PRODUCT_TYPES = [
  {
    id: "tartas",
    name: "Tartas",
    description: "Bizcocho artesano con capas, rellenos y coberturas a tu gusto.",
    emoji: "🎂",
  },
  {
    id: "bizcochos",
    name: "Bizcochos y mousse",
    description: "Esponjosos, suaves y aromáticos. La base de toda buena merienda.",
    emoji: "🍰",
  },
  {
    id: "temporada",
    name: "Dulces de temporada",
    description: "Roscones, tartas de Santiago, cocas y dulces de cada época del año.",
    emoji: "🥮",
  },
] as const;

export type ProductTypeId = (typeof PRODUCT_TYPES)[number]["id"];

export const FLAVORS = [
  "Crema pastelera",
  "Yema quemada",
  "Trufa",
  "Chocolate blanco",
  "Nocilla",
  "Crema de pistacho",
  "Crema Lotus",
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
  { id: "animales", name: "Animales", emoji: "🐻" },
  { id: "fantasia", name: "Fantasía", emoji: "🦄" },
  { id: "tecnologia", name: "Tecnología", emoji: "🤖" },
  { id: "deportes", name: "Deportes", emoji: "⚽" },
  { id: "hobbies", name: "Hobbies", emoji: "🎨" },
  { id: "eventos", name: "Eventos", emoji: "🎉" },
  { id: "estaciones", name: "Estaciones del año", emoji: "🍂" },
] as const;

export const COLOR_PALETTE = [
  { name: "Rosa", hex: "#f8b4c8" },
  { name: "Lila", hex: "#c9a0dc" },
  { name: "Lavanda", hex: "#b5a8e0" },
  { name: "Azul cielo", hex: "#a8d0f0" },
  { name: "Azul marino", hex: "#3a5a8a" },
  { name: "Verde menta", hex: "#a8e0c0" },
  { name: "Verde salvia", hex: "#7d9b76" },
  { name: "Amarillo pastel", hex: "#f7e7a8" },
  { name: "Naranja melocotón", hex: "#f7c8a0" },
  { name: "Rojo cereza", hex: "#d94a5a" },
  { name: "Chocolate", hex: "#6b4423" },
  { name: "Crema vainilla", hex: "#f5ecd9" },
  { name: "Blanco perla", hex: "#fafafa" },
  { name: "Negro elegante", hex: "#2d2d2d" },
  { name: "Dorado", hex: "#d4af37" },
  { name: "Plateado", hex: "#c0c0c0" },
] as const;

export const SIZES = [
  { id: "individual", name: "Individual", servings: "1 ración", price: 8 },
  { id: "pequeno", name: "Pequeño", servings: "4-6 raciones", price: 28 },
  { id: "mediano", name: "Mediano", servings: "8-10 raciones", price: 45 },
  { id: "grande", name: "Grande", servings: "12-16 raciones", price: 65 },
  { id: "extra", name: "Extra grande", servings: "18-25 raciones", price: 90 },
] as const;

export const TIME_SLOTS = [
  "10:00 - 12:00",
  "12:00 - 14:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
] as const;
