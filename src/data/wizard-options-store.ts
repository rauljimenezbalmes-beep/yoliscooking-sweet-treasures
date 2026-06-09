import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type WizardOptionType = "flavor" | "covering" | "theme" | "color" | "size" | "decoration";

export interface WizardOption {
  id: string;
  type: WizardOptionType;
  label: string;
  value: string | null;
  description: string | null;
  extra: Json;
  sort_order: number;
  active: boolean;
}

async function fetchOptions(type: WizardOptionType): Promise<WizardOption[]> {
  const { data, error } = await supabase
    .from("wizard_options")
    .select("*")
    .eq("type", type)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as WizardOption[]) ?? [];
}

export function useWizardOptions(type: WizardOptionType) {
  return useQuery({
    queryKey: ["wizard-options", type],
    queryFn: () => fetchOptions(type),
    staleTime: 60_000,
  });
}

export function useActiveWizardLabels(type: WizardOptionType): string[] {
  const { data } = useWizardOptions(type);
  return (data ?? []).filter((o) => o.active).map((o) => o.label);
}

export function useCreateWizardOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (option: Omit<WizardOption, "id">) => {
      const { error } = await supabase.from("wizard_options").insert({
        type: option.type,
        label: option.label,
        value: option.value,
        description: option.description,
        extra: option.extra,
        sort_order: option.sort_order,
        active: option.active,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["wizard-options", vars.type] }),
  });
}

export function useUpdateWizardOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<WizardOption> }) => {
      const { error } = await supabase
        .from("wizard_options")
        .update({
          ...(patch.label !== undefined && { label: patch.label }),
          ...(patch.value !== undefined && { value: patch.value }),
          ...(patch.description !== undefined && { description: patch.description }),
          ...(patch.extra !== undefined && { extra: patch.extra }),
          ...(patch.sort_order !== undefined && { sort_order: patch.sort_order }),
          ...(patch.active !== undefined && { active: patch.active }),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wizard-options"] }),
  });
}

export function useDeleteWizardOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wizard_options").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wizard-options"] }),
  });
}
