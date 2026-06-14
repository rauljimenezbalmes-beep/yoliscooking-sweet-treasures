import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
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
let currentUserId: string | null = null;
const listeners = new Set<() => void>();

function persistLocal() {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  persistLocal();
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

interface DbRow {
  id: string;
  customization: CakeCustomization;
  price: number | string;
  added_at: string;
}

function rowToItem(r: DbRow): CartItem {
  return {
    id: r.id,
    customization: r.customization,
    price: typeof r.price === "string" ? parseFloat(r.price) : r.price,
    addedAt: new Date(r.added_at).getTime(),
  };
}

async function fetchRemote(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("id, customization, price, added_at")
    .eq("user_id", userId)
    .order("added_at", { ascending: true });
  if (error || !data) return [];
  return (data as unknown as DbRow[]).map(rowToItem);
}

async function pushLocalToRemote(userId: string, items: CartItem[]) {
  if (items.length === 0) return;
  const rows = items.map((i) => ({
    user_id: userId,
    customization: i.customization as unknown as never,
    price: i.price,
    added_at: new Date(i.addedAt).toISOString(),
  }));
  await supabase.from("cart_items").insert(rows);
}

export async function syncCartForUser(userId: string | null) {
  currentUserId = userId;
  if (!userId) {
    // Signed out: keep local cart as-is.
    return;
  }
  // Merge any local items first (anonymous → signed-in)
  const localOnly = state.filter((i) => !isUuid(i.id));
  if (localOnly.length > 0) {
    await pushLocalToRemote(userId, localOnly);
  }
  // Replace state with remote truth
  const remote = await fetchRemote(userId);
  state = remote;
  emit();
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

async function assertMaxFlavors(customization: CakeCustomization) {
  const count = customization.flavors?.length ?? 0;
  if (count === 0) return;
  const { data, error } = await supabase
    .from("products")
    .select("max_flavors")
    .eq("id", customization.productId)
    .maybeSingle();
  if (error) return;
  const max = data?.max_flavors === 1 ? 1 : 2;
  if (count > max) {
    throw new Error(`Este pastel permite como máximo ${max} sabor${max === 1 ? "" : "es"}.`);
  }
}

export async function addToCart(
  customization: CakeCustomization,
  price: number,
): Promise<CartItem> {
  if ((customization.colors?.length ?? 0) > 2) {
    throw new Error("Un pastel no puede tener más de 2 colores.");
  }
  await assertMaxFlavors(customization);
  if (currentUserId) {
    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        user_id: currentUserId,
        customization: customization as unknown as never,
        price,
        added_at: new Date().toISOString(),
      })
      .select("id, customization, price, added_at")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    if (data) {
      const item = rowToItem(data as unknown as DbRow);
      state = [...state, item];
      emit();
      return item;
    }
  }
  const item: CartItem = {
    id: uid(),
    customization: customization as unknown as never,
    price,
    addedAt: Date.now(),
  };
  state = [...state, item];
  emit();
  return item;
}

export async function removeFromCart(id: string) {
  state = state.filter((i) => i.id !== id);
  emit();
  if (currentUserId && isUuid(id)) {
    await supabase.from("cart_items").delete().eq("id", id).eq("user_id", currentUserId);
  }
}

export async function updateCartItem(
  id: string,
  customization: CakeCustomization,
  price: number,
) {
  if ((customization.colors?.length ?? 0) > 2) {
    throw new Error("Un pastel no puede tener más de 2 colores.");
  }
  const prev = state;
  state = state.map((i) => (i.id === id ? { ...i, customization, price } : i));
  emit();
  if (currentUserId && isUuid(id)) {
    const { error } = await supabase
      .from("cart_items")
      .update({ customization: customization as unknown as never, price })
      .eq("id", id)
      .eq("user_id", currentUserId);
    if (error) {
      state = prev;
      emit();
      throw new Error(error.message);
    }
  }
}

export async function clearCart() {
  const wasUser = currentUserId;
  state = [];
  emit();
  if (wasUser) {
    await supabase.from("cart_items").delete().eq("user_id", wasUser);
  }
}

// Initialize sync on auth state changes (browser only).
if (isBrowser()) {
  supabase.auth.getSession().then(({ data }) => {
    const uid = data.session?.user?.id ?? null;
    if (uid) void syncCartForUser(uid);
  });
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
      void syncCartForUser(session?.user?.id ?? null);
    } else if (event === "SIGNED_OUT") {
      currentUserId = null;
      // Keep cart visible locally; user can sign in again to resync.
    }
  });
}
