"use client";

import { Coins, Globe2, Layers, RefreshCw, Search, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Input";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDkQuery } from "@/lib/hooks/useDk";
import type { DkRecord, NationEntry } from "@/lib/api/types/general";
import { RecordsTable } from "../_components/RecordsTable";

function CurrenciesCard() {
  const { data, isLoading, isFetching, error, refetch } = useDkQuery<DkRecord[]>(
    ["general", "currencies"],
    "/general/currency",
  );
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <CardTitle icon={<Coins />} className="mr-auto">
          Currencies
          {data ? <span className="ml-1.5 tnum text-mist">{data.length}</span> : null}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => refetch()} aria-label="Refresh currencies">
          <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
        </Button>
      </div>
      <RecordsTable
        rows={data}
        loading={isLoading}
        error={error}
        onRetry={() => refetch()}
        emptyTitle="No currencies"
        emptyBody="The company has no currency table entries."
      />
    </Card>
  );
}

function DimensionsCard() {
  const { data, isLoading, error, refetch, isFetching } = useDkQuery<DkRecord[]>(
    ["general", "dimensions"],
    "/general/dimension",
    { retry: false },
  );
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <CardTitle icon={<Layers />} className="mr-auto">
          Dimensions
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => refetch()} aria-label="Refresh dimensions">
          <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
        </Button>
      </div>
      {error ? (
        <EmptyState
          icon={<TriangleAlert />}
          title={`Dimensions unavailable (${error.status ?? "error"})`}
          body={`The dkPlus demo company has no dimensions configured, so this endpoint answers ${error.status ?? "with an error"}. The route is wired and renders data for companies that use dimensions. API said: ${error.message}`}
          action={
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <RecordsTable
          rows={data}
          loading={isLoading}
          emptyTitle="No dimensions"
          emptyBody="The company has no dimensions configured."
        />
      )}
    </Card>
  );
}

function NationLookupCard() {
  const [input, setInput] = useState("");
  const [id, setId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useDkQuery<NationEntry>(
    ["nation", "entry", id],
    `/nation/entry/${encodeURIComponent(id ?? "")}`,
    { enabled: !!id, retry: false },
  );

  return (
    <Card className="p-6">
      <CardTitle icon={<Globe2 />} className="mb-4">
        Nation lookup
      </CardTitle>
      <p className="mb-4 text-sm text-fog">
        Look up a person or company in the national registry by id (kennitala), e.g.{" "}
        <button
          type="button"
          className="cursor-pointer font-mono text-xs text-ink underline decoration-line underline-offset-2 hover:decoration-ink"
          onClick={() => {
            setInput("1710794709");
            setId("1710794709");
          }}
        >
          1710794709
        </button>
        .
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) setId(input.trim());
        }}
        className="flex items-end gap-2"
      >
        <Field label="National id" className="flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 1710794709"
            inputMode="numeric"
          />
        </Field>
        <Button type="submit" loading={!!id && isLoading} disabled={!input.trim()}>
          <Search className="size-4" /> Look up
        </Button>
      </form>

      <div className="mt-5">
        {!id ? (
          <p className="text-[13px] text-mist">GET /nation/entry/:id — the result appears here.</p>
        ) : isLoading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : error ? (
          <ErrorState
            error={
              error.status === 404
                ? { message: `No national registry entry found for ${id}.`, status: 404 }
                : error
            }
            onRetry={() => refetch()}
          />
        ) : data ? (
          <div className="space-y-4">
            <KV
              columns={1}
              items={[
                {
                  label: "Number",
                  value: data.Number ? <span className="font-mono text-xs">{data.Number}</span> : undefined,
                },
                { label: "Name", value: data.Name },
                { label: "Address", value: data.Address?.Address1 },
                { label: "Address 2", value: data.Address?.Address2 },
                {
                  label: "Zip / city",
                  value: [data.Address?.ZipCode, data.Address?.City].filter(Boolean).join(" "),
                },
              ]}
            />
            <JsonView data={data} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export default function ReferencePage() {
  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
        <CurrenciesCard />
        <NationLookupCard />
      </div>
      <DimensionsCard />
    </div>
  );
}
