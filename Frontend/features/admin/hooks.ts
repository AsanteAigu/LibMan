import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as usersApi from "@/services/users";
import * as dashboardApi from "@/services/dashboard";
import * as reportsApi from "@/services/reports";
import type { UserRole } from "@/types/user";

export function useUsers(filter?: { role?: UserRole; q?: string }) {
  return useQuery({ queryKey: ["users", filter], queryFn: () => usersApi.listUsers(filter) });
}

export function useUserHistory(id: string) {
  return useQuery({
    queryKey: ["user-history", id],
    queryFn: () => usersApi.getUserHistory(id),
    enabled: !!id,
  });
}

export function useStudentStats() {
  return useQuery({
    queryKey: ["dashboard", "student"],
    queryFn: () => dashboardApi.getStudentStats(),
  });
}

export function useLibrarianStats() {
  return useQuery({ queryKey: ["dashboard", "librarian"], queryFn: dashboardApi.getLibrarianStats });
}

export function useReports() {
  return useQuery({ queryKey: ["reports"], queryFn: reportsApi.listReports });
}

export function useSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: reportsApi.listSettings });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => reportsApi.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Setting saved.");
    },
    onError: () => toast.error("Couldn't save this setting."),
  });
}
