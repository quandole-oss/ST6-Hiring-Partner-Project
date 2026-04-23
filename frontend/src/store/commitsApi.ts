import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "../api/tokenStore";
import type { WeeklyCommit } from "../types";

/**
 * RTK Query slice — parallel data layer alongside the existing TanStack
 * Query hooks in src/api/*.ts. Used today for the paginated commits
 * endpoint added in the v0.4 spec-conformance milestone
 * (GET /api/v1/commits/page). New features should prefer this API slice
 * over TanStack Query; incremental migration of existing hooks is tracked
 * in DECISIONS.md.
 *
 * Tag-based invalidation mirrors the TanStack invalidateAll pattern.
 */

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

export interface PagedCommitsArgs {
  page?: number;
  size?: number;
  sort?: string;
}

export const commitsApi = createApi({
  reducerPath: "commitsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Commit"],
  endpoints: (builder) => ({
    getCommitsPage: builder.query<Page<WeeklyCommit>, PagedCommitsArgs | void>({
      query: (args) => {
        const p = args ?? {};
        const qs = new URLSearchParams();
        if (typeof p.page === "number") qs.set("page", String(p.page));
        if (typeof p.size === "number") qs.set("size", String(p.size));
        if (p.sort) qs.set("sort", p.sort);
        const suffix = qs.toString() ? `?${qs.toString()}` : "";
        return { url: `/commits/page${suffix}` };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: "Commit" as const, id })),
              { type: "Commit" as const, id: "PAGE" },
            ]
          : [{ type: "Commit" as const, id: "PAGE" }],
    }),
  }),
});

export const { useGetCommitsPageQuery } = commitsApi;
