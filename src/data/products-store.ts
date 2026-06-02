import { useSyncExternalStore } from "react";
import { defaultProducts, type Product } from "./products";

const STORAGE_KEY = "yoli.products.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function load(): Product[] {
  if (!isBrowser()) return defaultProducts;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProducts;
    const parsed = JSON.parse(raw) as Product[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultProducts;
    // Merge: ensure new default products appear if added later
    const map = new Map(parsed.map((p) => [p.id, p]));
    for (const def of defaultProducts) {
      if (!map.has(def.id)) map.set(def.id, def);
    }
    return Array.from(map.values());
  } catch {
    return defaultProducts;
  }
}

let state: Product[] = load();
const listeners = new Set<() => void>();

function emit() {
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return defaultProducts;
}

export function useProducts(): Product[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useProduct(id: string): Product | undefined {
  const all = useProducts();
  return all.find((p) => p.id === id);
}

export function updateProduct(id: string, patch: Partial<Omit<Product, "id">>) {
  state = state.map((p) => (p.id === id ? { ...p, ...patch } : p));
  emit();
}

export function resetProducts() {
  state = defaultProducts;
  emit();
}
