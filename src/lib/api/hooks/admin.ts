import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Profile } from "@/lib/api/hooks/profile";

export function useAdminUsers(options?: {
  limit?: number;
  offset?: number;
  status?: string;
  role?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));
  if (options?.status) params.set("status", options.status);
  if (options?.role) params.set("role", options.role);
  if (options?.search) params.set("search", options.search);

  return useQuery({
    queryKey: ["admin-users", options],
    queryFn: () => api.get<Profile[]>(`/v1/admin/users?${params.toString()}`),
  });
}

export type AdminUserDetail = Profile & {
  updated_at?: string;
  balance?: {
    balance: number;
    low_balance_threshold: number;
  };
  api_keys?: Array<{
    id: string;
    name: string;
    key_prefix: string;
    status: string;
    last_used_at?: string;
  }>;
  recent_activity?: Array<{
    provider?: string;
    model_code?: string;
    cost_credits: number;
    status: string;
    created_at: string;
  }>;
  recent_payments?: Array<{
    id: string;
    amount_tzs: number;
    status: string;
    created_at: string;
  }>;
};

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ["admin-users", id],
    queryFn: () => api.get<AdminUserDetail>(`/v1/admin/users/${id}`),
    enabled: !!id,
  });
}

export function useUpdateAdminUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { status?: string; role?: string }) =>
      api.patch<Profile>(`/v1/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export type AdminSettings = Record<string, unknown>;

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api.get<AdminSettings>("/v1/admin/settings"),
  });
}

export function useUpsertAdminSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { key: string; value: unknown }) =>
      api.put("/v1/admin/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });
}

export type AdminPayment = {
  id: string;
  provider_reference?: string;
  amount_tzs: number;
  status: string;
  created_at: string;
  completed_at?: string;
  user?: {
    id: string;
    full_name: string;
    email?: string;
  };
};
export type AdminPaymentDetail = AdminPayment & { user_id?: string; user_name?: string; user_email?: string; user_phone?: string; provider?: string; credits_granted?: number; completed_at?: string };

export function useAdminPayments(options?: {
  limit?: number;
  offset?: number;
  status?: string;
}) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));
  if (options?.status) params.set("status", options.status);

  return useQuery({
    queryKey: ["admin-payments", options],
    queryFn: () => api.get<AdminPayment[]>(`/v1/admin/payments?${params.toString()}`),
  });
}
