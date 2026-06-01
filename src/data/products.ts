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
}

export const products: Product[] = [
  {
    id: "red-velvet",
    name: "Red Velvet",
    description: "Bizcocho aterciopelado con un suave frosting de queso crema.",
    image: redVelvet,
    category: "Tartas",
  },
  {
    id: "manzana",
    name: "Tarta de Manzana",
    description: "Masa artesana, manzana laminada y un toque dorado de mermelada.",
    image: manzana,
    category: "Tartas",
  },
  {
    id: "queso",
    name: "Tarta de Queso",
    description: "Cremosa por dentro y dorada por fuera, al estilo de siempre.",
    image: queso,
    category: "Tartas",
  },
  {
    id: "sacher",
    name: "Tarta Sacher",
    description: "Bizcocho de chocolate intenso bañado en ganache brillante.",
    image: sacher,
    category: "Tartas",
  },
  {
    id: "bizcocho-tradicional",
    name: "Bizcocho Tradicional",
    description: "El de toda la vida: esponjoso, dorado y aromático.",
    image: bizTradicional,
    category: "Bizcochos",
  },
  {
    id: "bizcocho-limon",
    name: "Bizcocho de Limón",
    description: "Frescor de limón natural con un glaseado suave.",
    image: bizLimon,
    category: "Bizcochos",
  },
  {
    id: "bizcocho-almendra",
    name: "Bizcocho de Almendra",
    description: "Almendra marcona molida en casa para un sabor delicado.",
    image: bizAlmendra,
    category: "Bizcochos",
  },
  {
    id: "bizcocho-naranja",
    name: "Bizcocho de Naranja",
    description: "Ralladura y zumo recién exprimido en cada bocado.",
    image: bizNaranja,
    category: "Bizcochos",
  },
  {
    id: "roscon",
    name: "Roscón de Reyes",
    description: "Esponjoso, aromatizado con agua de azahar y frutas confitadas.",
    image: roscon,
    category: "Tartas de Época",
  },
  {
    id: "santiago",
    name: "Tarta de Santiago",
    description: "Almendra, huevo y azúcar. Sencilla, tradicional, inolvidable.",
    image: santiago,
    category: "Tartas de Época",
  },
  {
    id: "brazo-gitano",
    name: "Brazo de Gitano",
    description: "Bizcocho enrollado con crema suave casera.",
    image: brazo,
    category: "Tartas de Época",
  },
  {
    id: "coca",
    name: "Coca de Sant Joan",
    description: "Frutas confitadas y piñones sobre masa esponjosa de verbena.",
    image: coca,
    category: "Tartas de Época",
  },
];

export const categories: Category[] = ["Tartas", "Bizcochos", "Tartas de Época"];
