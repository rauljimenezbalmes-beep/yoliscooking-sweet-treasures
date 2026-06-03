import { useSyncExternalStore } from "react";
import type { CakeCustomization } from "./customization";

const STORAGE_KEY = "yoli.cart.v1";

export interface CartItem {
  id: string;
  customization: CakeCustomization;
  price: number;
  addedAt: number;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function load(): CartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let state: CartItem[] = load();
const listeners = new Set<() => void>();

function emit() {
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const EMPTY: CartItem[] = [];
function getSnapshot() {
  return state;
}
function getServerSnapshot() {
  return EMPTY;
}

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCartCount(): number {
  return useCart().length;
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addToCart(customization: CakeCustomization, price: number): CartItem {
  const item: CartItem = {
    id: uid(),
    customization,
    price,
    addedAt: Date.now(),
  };
  state = [...state, item];
  emit();
  return item;
}

export function removeFromCart(id: string) {
  state = state.filter((i) => i.id !== id);
  emit();
}

export function clearCart() {
  state = [];
  emit();
}
