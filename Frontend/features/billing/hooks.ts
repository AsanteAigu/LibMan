import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as chargesApi from "@/services/charges";
import type { PaymentMethod } from "@/types/billing";

export function useCharges(filter?: { mine?: boolean }) {
  return useQuery({ queryKey: ["charges", filter], queryFn: () => chargesApi.listCharges(filter) });
}

export function usePayments(filter?: { mine?: boolean }) {
  return useQuery({ queryKey: ["payments", filter], queryFn: () => chargesApi.listPayments(filter) });
}

export function usePayCharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chargeId, method, reference }: { chargeId: string; method: PaymentMethod; reference?: string }) =>
      chargesApi.payCharge(chargeId, method, reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charges"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment recorded.");
    },
    onError: () => toast.error("We couldn't confirm this payment. If you were charged, contact a librarian."),
  });
}
