"use client";

import { History, Search } from "lucide-react";
import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TransactionsTable } from "../_components/TransactionsTable";
import { useDebouncedValue } from "../_components/useDebouncedValue";

/** Global product-transaction feed (GET /product/transaction/:page/:count). */
export default function ProductTransactionsPage() {
  const [filter, setFilter] = useState("");
  const itemcode = useDebouncedValue(filter.trim(), 350);

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-5">
        <CardTitle icon={<History />}>Product transactions</CardTitle>
        <p className="hidden text-[13px] text-fog md:block">
          Every inventory movement across all products — click a row to open the product.
        </p>
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
          <Input
            className="w-56 pl-9"
            placeholder="Filter by item code…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by item code"
          />
        </div>
      </div>
      <TransactionsTable
        pathFor={(p, c) =>
          `/product/transaction/${p}/${c}${itemcode ? `?itemcode=${encodeURIComponent(itemcode)}` : ""}`
        }
        queryKey={["product-transactions", itemcode]}
        linkToProduct
        emptyTitle="No transactions"
        emptyBody={
          itemcode
            ? `No transactions found for item code "${itemcode}".`
            : "Inventory movements across all products will appear here."
        }
      />
    </Card>
  );
}
