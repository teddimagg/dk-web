"use client";

import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { SearchClient } from "./_components/SearchClient";

/**
 * /search?q= — global search across dkPlus. The component reading
 * useSearchParams must sit inside a Suspense boundary (Next.js requirement).
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={4} />}>
      <SearchClient />
    </Suspense>
  );
}
