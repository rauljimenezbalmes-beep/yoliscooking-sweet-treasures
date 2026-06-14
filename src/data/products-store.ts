import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_ALLERGENS_INFO, DEFAULT_DELIVERY_INFO, type Product, type Category } from "./products";

// Static default images for the seeded products so we keep the original assets
// regardless of what is stored in the DB image column.
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

const DEFAULT_IMAGES: Record<string, string> = {
  "red-velvet": redVelvet,
  manzana,
  queso,
  sacher,
  "bizcocho-tradicional": bizTradicional,
  "bizcocho-limon": bizLimon,
  "bizcocho-almendra": bizAlmendra,
  "bizcocho-naranja": bizNaranja,
  roscon,
  santiago,
  "brazo-gitano": brazo,
  coca,
};

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%25' height='100%25' fill='%23efe4f3'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23a07cb0'>Sin imagen</text></svg>";

function resolveImage(id: string, dbImage: string): string {
  if (dbImage && !dbImage.startsWith("/src/")) return dbImage;
  return DEFAULT_IMAGES[id] ?? PLACEHOLDER_IMAGE;
}

interface DbProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  price: number;
  ingredients: string[];
  tags: string[];
  active: boolean;
  sort_order: number;
  allergens_info: string | null;
  delivery_info: string | null;
  max_flavors: number | null;
}

function mapRow(row: DbProduct): Product {
  const mf = row.max_flavors === 1 ? 1 : 2;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    image: resolveImage(row.id, row.image ?? ""),
    category: row.category as Category,
    price: Number(row.price),
    ingredients: row.ingredients ?? [],
    tags: row.tags ?? [],
    active: row.active,
    allergensInfo: row.allergens_info ?? DEFAULT_ALLERGENS_INFO,
    deliveryInfo: row.delivery_info ?? DEFAULT_DELIVERY_INFO,
    maxFlavors: mf,
  };
}

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as DbProduct[]).map(mapRow);
}

export function useProducts(): Product[] {
  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 30_000,
  });
  return data ?? [];
}

export function useProductsLoading(): boolean {
  const { isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 30_000,
  });
  return isLoading;
}

export function useProduct(id: string): Product | undefined {
  const all = useProducts();
  return all.find((p) => p.id === id);
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Omit<Product, "id">> }) => {
      const { error } = await supabase
        .from("products")
        .update({
          ...(patch.name !== undefined && { name: patch.name }),
          ...(patch.description !== undefined && { description: patch.description }),
          ...(patch.image !== undefined && { image: patch.image }),
          ...(patch.category !== undefined && { category: patch.category }),
          ...(patch.price !== undefined && { price: patch.price }),
          ...(patch.ingredients !== undefined && { ingredients: patch.ingredients }),
          ...(patch.tags !== undefined && { tags: patch.tags }),
          ...(patch.active !== undefined && { active: patch.active }),
          ...(patch.allergensInfo !== undefined && { allergens_info: patch.allergensInfo }),
          ...(patch.deliveryInfo !== undefined && { delivery_info: patch.deliveryInfo }),
          ...(patch.maxFlavors !== undefined && { max_flavors: patch.maxFlavors }),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      const { error } = await supabase.from("products").insert({
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.image,
        category: product.category,
        price: product.price,
        ingredients: product.ingredients,
        tags: product.tags,
        active: product.active,
        allergens_info: product.allergensInfo,
        delivery_info: product.deliveryInfo,
        max_flavors: product.maxFlavors ?? 2,
        sort_order: 999,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

// Back-compat: keep these around but make them no-ops / unused.
export function updateProduct() {
  console.warn("updateProduct() is deprecated. Use useUpdateProduct() mutation.");
}
export function resetProducts() {
  console.warn("resetProducts() is deprecated.");
}
