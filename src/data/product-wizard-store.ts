import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  useWizardOptions,
  type WizardOption,
  type WizardOptionType,
} from "./wizard-options-store";

export interface ProductWizardOption {
  id: string;
  product_id: string;
  type: WizardOptionType;
  global_option_id: string | null;
  label: string | null;
  value: string | null;
  description: string | null;
  extra: Json;
  sort_order: number;
  enabled: boolean;
}

/** Combined option ready to render in the customer wizard. */
export interface ResolvedWizardOption {
  key: string;
  label: string;
  value: string | null;
  description: string | null;
  extra: Json;
  source: "global" | "extra";
}

async function fetchProductWizardRows(
  productId: string,
): Promise<ProductWizardOption[]> {
  const { data, error } = await supabase
    .from("product_wizard_options")
    .select("*")
    .eq("product_id", productId);
  if (error) throw error;
  return (data as ProductWizardOption[]) ?? [];
}

export function useProductWizardRows(productId: string | undefined) {
  return useQuery({
    queryKey: ["product-wizard", productId ?? "none"],
    queryFn: () => fetchProductWizardRows(productId!),
    enabled: !!productId,
    staleTime: 30_000,
  });
}

/**
 * Devuelve la lista final de opciones que ve el cliente para un pastel + tipo,
 * combinando globales activos (con override de enabled) y extras del pastel.
 */
export function useResolvedWizardOptions(
  productId: string | undefined,
  type: WizardOptionType,
): { options: ResolvedWizardOption[]; isLoading: boolean } {
  const { data: globals, isLoading: loadingGlobals } = useWizardOptions(type);
  const { data: overrides, isLoading: loadingOverrides } =
    useProductWizardRows(productId);

  const options = useMemo<ResolvedWizardOption[]>(() => {
    const overridesForType = (overrides ?? []).filter((o) => o.type === type);
    const disabledGlobalIds = new Set(
      overridesForType
        .filter((o) => o.global_option_id && !o.enabled)
        .map((o) => o.global_option_id as string),
    );
    const overrideByGlobalId = new Map(
      overridesForType
        .filter((o) => o.global_option_id)
        .map((o) => [o.global_option_id as string, o]),
    );

    const globalResolved: ResolvedWizardOption[] = (globals ?? [])
      .filter((g) => g.active && !disabledGlobalIds.has(g.id))
      .map((g) => {
        const ov = overrideByGlobalId.get(g.id);
        const gExtra =
          g.extra && typeof g.extra === "object" && !Array.isArray(g.extra)
            ? (g.extra as Record<string, unknown>)
            : {};
        const oExtra =
          ov?.extra && typeof ov.extra === "object" && !Array.isArray(ov.extra)
            ? (ov.extra as Record<string, unknown>)
            : {};
        return {
          key: `g:${g.id}`,
          label: g.label,
          value: g.value,
          description: g.description,
          extra: { ...gExtra, ...oExtra } as Json,
          source: "global" as const,
          sort: ov?.sort_order ?? g.sort_order,
        };
      })
      .sort((a, b) => a.sort - b.sort)
      .map(({ sort: _s, ...rest }) => rest);

    const extras: ResolvedWizardOption[] = overridesForType
      .filter((o) => !o.global_option_id && o.enabled && o.label)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((o) => ({
        key: `e:${o.id}`,
        label: o.label as string,
        value: o.value,
        description: o.description,
        extra: o.extra,
        source: "extra" as const,
      }));

    return [...globalResolved, ...extras];
  }, [globals, overrides, type]);

  return { options, isLoading: loadingGlobals || loadingOverrides };
}

/** Helper: solo etiquetas (para steps que sólo usan strings). */
export function useResolvedWizardLabels(
  productId: string | undefined,
  type: WizardOptionType,
): string[] {
  const { options } = useResolvedWizardOptions(productId, type);
  return options.map((o) => o.label);
}

/** Helper para el editor admin: agrupa overrides por tipo. */
export function groupOverridesByType(rows: ProductWizardOption[]) {
  const map = new Map<WizardOptionType, ProductWizardOption[]>();
  for (const r of rows) {
    const list = map.get(r.type) ?? [];
    list.push(r);
    map.set(r.type, list);
  }
  return map;
}

/** Activa/desactiva una opción global para un pastel concreto. */
export function useToggleGlobalForProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      type,
      global,
      enabled,
      existingId,
    }: {
      productId: string;
      type: WizardOptionType;
      global: WizardOption;
      enabled: boolean;
      existingId?: string;
    }) => {
      if (existingId) {
        const { error } = await supabase
          .from("product_wizard_options")
          .update({ enabled })
          .eq("id", existingId);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("product_wizard_options").insert({
        product_id: productId,
        type,
        global_option_id: global.id,
        enabled,
        sort_order: global.sort_order,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["product-wizard", vars.productId] }),
  });
}

export function useCreateProductExtra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      productId: string;
      type: WizardOptionType;
      label: string;
      value?: string | null;
      description?: string | null;
      sort_order?: number;
    }) => {
      const { error } = await supabase.from("product_wizard_options").insert({
        product_id: input.productId,
        type: input.type,
        global_option_id: null,
        label: input.label,
        value: input.value ?? null,
        description: input.description ?? null,
        sort_order: input.sort_order ?? 0,
        enabled: true,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["product-wizard", vars.productId] }),
  });
}

export function useUpdateProductExtra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      productId: _pid,
      patch,
    }: {
      id: string;
      productId: string;
      patch: Partial<
        Pick<
          ProductWizardOption,
          "label" | "value" | "description" | "enabled" | "sort_order"
        >
      >;
    }) => {
      const { error } = await supabase
        .from("product_wizard_options")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["product-wizard", vars.productId] }),
  });
}

export function useDeleteProductWizardRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, productId: _pid }: { id: string; productId: string }) => {
      const { error } = await supabase
        .from("product_wizard_options")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["product-wizard", vars.productId] }),
  });
}
