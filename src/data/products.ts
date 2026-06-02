import redVelvet from "@/assets/cake-red-velvet.jpg";
import manzana from "@/assets/cake-manzana.jpg";
import queso from "@/assets/cake-queso.jpg";
import sacher from "@/assets/cake-sacher.jpg";
import bizTradicional from "@/assets/bizcocho-tradicional.jpg";
import bizLimon from "@/assets/bizcocho-limon.jpg";
import bizAlmendra from "@/assets/bizcocho-almendra.jpg";
import bizNaranja from "@/assets/bizcocho-naranja.jpg";
import roscon from "@/assets/roscon.jpg";
import santiago from "@/assets/santiago.jpg";
import brazo from "@/assets/brazo-gitano.jpg";
import coca from "@/assets/coca.jpg";

export type Category = "Tartas" | "Bizcochos" | "Tartas de Época";

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: Category;
  price: number;
  ingredients: string[];
  tags: string[];
  active: boolean;
}

export const defaultProducts: Product[] = [
  {
    id: "red-velvet",
    name: "Red Velvet",
    description: "Bizcocho aterciopelado con un suave frosting de queso crema.",
    image: redVelvet,
    category: "Tartas",
    price: 28,
    ingredients: ["Harina", "Cacao", "Colorante natural", "Queso crema", "Mantequilla", "Azúcar"],
    tags: ["clásico", "celebración"],
    active: true,
  },
  {
    id: "manzana",
    name: "Tarta de Manzana",
    description: "Masa artesana, manzana laminada y un toque dorado de mermelada.",
    image: manzana,
    category: "Tartas",
    price: 22,
    ingredients: ["Manzana", "Masa quebrada", "Mermelada de albaricoque", "Canela"],
    tags: ["tradicional"],
    active: true,
  },
  {
    id: "queso",
    name: "Tarta de Queso",
    description: "Cremosa por dentro y dorada por fuera, al estilo de siempre.",
    image: queso,
    category: "Tartas",
    price: 24,
    ingredients: ["Queso crema", "Nata", "Huevos", "Azúcar"],
    tags: ["best-seller"],
    active: true,
  },
  {
    id: "sacher",
    name: "Tarta Sacher",
    description: "Bizcocho de chocolate intenso bañado en ganache brillante.",
    image: sacher,
    category: "Tartas",
    price: 30,
    ingredients: ["Chocolate negro", "Mermelada de albaricoque", "Mantequilla", "Huevos"],
    tags: ["chocolate"],
    active: true,
  },
  {
    id: "bizcocho-tradicional",
    name: "Bizcocho Tradicional",
    description: "El de toda la vida: esponjoso, dorado y aromático.",
    image: bizTradicional,
    category: "Bizcochos",
    price: 14,
    ingredients: ["Huevos", "Harina", "Azúcar", "Aceite", "Limón"],
    tags: ["desayuno"],
    active: true,
  },
  {
    id: "bizcocho-limon",
    name: "Bizcocho de Limón",
    description: "Frescor de limón natural con un glaseado suave.",
    image: bizLimon,
    category: "Bizcochos",
    price: 15,
    ingredients: ["Limón", "Harina", "Huevos", "Azúcar", "Glasa"],
    tags: ["cítrico"],
    active: true,
  },
  {
    id: "bizcocho-almendra",
    name: "Bizcocho de Almendra",
    description: "Almendra marcona molida en casa para un sabor delicado.",
    image: bizAlmendra,
    category: "Bizcochos",
    price: 17,
    ingredients: ["Almendra marcona", "Huevos", "Azúcar", "Harina"],
    tags: ["sin gluten opcional"],
    active: true,
  },
  {
    id: "bizcocho-naranja",
    name: "Bizcocho de Naranja",
    description: "Ralladura y zumo recién exprimido en cada bocado.",
    image: bizNaranja,
    category: "Bizcochos",
    price: 15,
    ingredients: ["Naranja", "Harina", "Huevos", "Azúcar", "Aceite"],
    tags: ["cítrico"],
    active: true,
  },
  {
    id: "roscon",
    name: "Roscón de Reyes",
    description: "Esponjoso, aromatizado con agua de azahar y frutas confitadas.",
    image: roscon,
    category: "Tartas de Época",
    price: 20,
    ingredients: ["Harina", "Agua de azahar", "Frutas confitadas", "Huevos", "Mantequilla"],
    tags: ["enero"],
    active: true,
  },
  {
    id: "santiago",
    name: "Tarta de Santiago",
    description: "Almendra, huevo y azúcar. Sencilla, tradicional, inolvidable.",
    image: santiago,
    category: "Tartas de Época",
    price: 22,
    ingredients: ["Almendra", "Huevos", "Azúcar", "Limón"],
    tags: ["sin gluten"],
    active: true,
  },
  {
    id: "brazo-gitano",
    name: "Brazo de Gitano",
    description: "Bizcocho enrollado con crema suave casera.",
    image: brazo,
    category: "Tartas de Época",
    price: 18,
    ingredients: ["Bizcocho", "Crema pastelera", "Azúcar glas"],
    tags: ["clásico"],
    active: true,
  },
  {
    id: "coca",
    name: "Coca de Sant Joan",
    description: "Frutas confitadas y piñones sobre masa esponjosa de verbena.",
    image: coca,
    category: "Tartas de Época",
    price: 19,
    ingredients: ["Masa brioche", "Frutas confitadas", "Piñones", "Azúcar"],
    tags: ["junio"],
    active: true,
  },
];

export const categories: Category[] = ["Tartas", "Bizcochos", "Tartas de Época"];
