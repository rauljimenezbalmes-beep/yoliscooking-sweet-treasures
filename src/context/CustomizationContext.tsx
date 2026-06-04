import { createContext, useContext, useState, type ReactNode } from "react";
import type { DecorationType } from "@/data/customization";

export interface CustomizationState {
  flavors: string[];
  filling: string;
  covering: string;
  decoration: DecorationType | "";
  colors: string[];
  theme: string;
  description: string;
  customText: string;
  sizeId: string;
  deliveryDate?: string; // ISO yyyy-mm-dd
}

const DEFAULT_STATE: CustomizationState = {
  flavors: [],
  filling: "",
  covering: "",
  decoration: "",
  colors: [],
  theme: "",
  description: "",
  customText: "",
  sizeId: "",
  deliveryDate: undefined,
};

interface Ctx {
  state: CustomizationState;
  update: <K extends keyof CustomizationState>(key: K, value: CustomizationState[K]) => void;
  toggleFlavor: (f: string) => void;
}

const CustomizationCtx = createContext<Ctx | null>(null);

export function CustomizationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CustomizationState>(DEFAULT_STATE);

  function update<K extends keyof CustomizationState>(key: K, value: CustomizationState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function toggleFlavor(f: string) {
    setState((prev) => {
      if (prev.flavors.includes(f)) {
        return { ...prev, flavors: prev.flavors.filter((x) => x !== f) };
      }
      if (prev.flavors.length >= 2) return prev;
      return { ...prev, flavors: [...prev.flavors, f] };
    });
  }

  return (
    <CustomizationCtx.Provider value={{ state, update, toggleFlavor }}>
      {children}
    </CustomizationCtx.Provider>
  );
}

export function useCustomization() {
  const ctx = useContext(CustomizationCtx);
  if (!ctx) throw new Error("useCustomization must be used within CustomizationProvider");
  return ctx;
}
