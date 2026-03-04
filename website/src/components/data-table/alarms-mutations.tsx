"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { alarmsApi } from "@/lib/api";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useAlarmMutations() {
  const t = useTranslations("alarmsTanstack");
  const queryClient = useQueryClient();

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: number) => {
      return alarmsApi.acknowledge(String(id), "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      toast.success(t("acknowledge_success"));
    },
    onError: () => {
      toast.error(t("acknowledge_error"));
    },
  });

  return {
    acknowledgeMutation,
  };
}
