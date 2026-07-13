"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { dkFetch, DkError, type DkRequestOptions } from "@/lib/api/client";
import { useActiveCompany } from "@/lib/stores/companies";

/**
 * Core data hooks. Every query key is prefixed with the active company id so
 * switching companies never shows another company's cached data, while
 * switching *back* is instant.
 */

export function useDkQuery<T>(
  key: readonly unknown[],
  path: string,
  options?: Omit<UseQueryOptions<T, DkError>, "queryKey" | "queryFn"> & { fresh?: boolean },
) {
  const company = useActiveCompany();
  return useQuery<T, DkError>({
    queryKey: [company?.id, ...key],
    queryFn: ({ signal }) =>
      dkFetch<T>(path, { token: company!.token, signal, fresh: options?.fresh }),
    enabled: !!company && (options?.enabled ?? true),
    ...options,
  });
}

interface DkMutationVars {
  path: string;
  method?: DkRequestOptions["method"];
  body?: unknown;
}

export function useDkMutation<TData = unknown, TVars extends DkMutationVars = DkMutationVars>(
  options?: UseMutationOptions<TData, DkError, TVars> & {
    /** Query-key prefixes (without company id) to invalidate on success. */
    invalidates?: readonly unknown[][];
  },
) {
  const company = useActiveCompany();
  const qc = useQueryClient();
  return useMutation<TData, DkError, TVars>({
    mutationFn: (vars) =>
      dkFetch<TData>(vars.path, {
        token: company!.token,
        method: vars.method ?? "POST",
        body: vars.body,
      }),
    ...options,
    onSuccess: (data, vars, ctx, mutation) => {
      for (const prefix of options?.invalidates ?? []) {
        qc.invalidateQueries({ queryKey: [company?.id, ...prefix] });
      }
      options?.onSuccess?.(data, vars, ctx, mutation);
    },
  });
}

/** Imperative prefetch — call on row/link hover so detail pages open instantly. */
export function usePrefetch() {
  const company = useActiveCompany();
  const qc = useQueryClient();
  return (key: readonly unknown[], path: string) => {
    if (!company) return;
    qc.prefetchQuery({
      queryKey: [company.id, ...key],
      queryFn: ({ signal }) => dkFetch(path, { token: company.token, signal }),
      staleTime: 30_000,
    });
  };
}
