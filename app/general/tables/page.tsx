"use client";

import { ChevronRight, Table2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import {
  ChangesPanel,
  DeletedPanel,
  DeletePanel,
  FieldsPanel,
  RecordsPanel,
  UpdatePanel,
} from "../_components/TablePanels";

const SUGGESTIONS = [
  { name: "sk_vidsk", label: "Customers" },
  { name: "la_vara", label: "Products" },
  { name: "initems", label: "Items" },
  { name: "pjjob", label: "Projects" },
  { name: "sohead", label: "Sales orders" },
];

const TABS = [
  { id: "records", label: "Records" },
  { id: "fields", label: "Fields" },
  { id: "deleted", label: "Deleted" },
  { id: "changes", label: "Changes" },
  { id: "update", label: "Update record" },
  { id: "delete", label: "Delete record" },
];

export default function TablesPage() {
  const [input, setInput] = useState("");
  const [table, setTable] = useState<string | null>(null);
  const [tab, setTab] = useState("records");

  function openTable(name: string) {
    const t = name.trim();
    if (!t) return;
    setInput(t);
    setTable(t);
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <CardTitle icon={<Table2 />} className="mb-3">
          dkSystem table explorer
        </CardTitle>
        <p className="mb-5 max-w-2xl text-sm text-fog">
          Power tool for raw dkSystem tables: browse records, inspect fields, track deletions and
          changes — and, with extreme care, write or delete records directly.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            openTable(input);
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <Field label="Table name" className="w-72">
            <Input
              list="dk-table-suggestions"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. sk_vidsk"
              spellCheck={false}
              autoFocus
            />
          </Field>
          <datalist id="dk-table-suggestions">
            {SUGGESTIONS.map((s) => (
              <option key={s.name} value={s.name}>
                {s.label}
              </option>
            ))}
          </datalist>
          <Button type="submit" disabled={!input.trim()}>
            Open table <ChevronRight className="size-4" />
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-mist">Known tables:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => openTable(s.name)}
              className="cursor-pointer"
              aria-label={`Open table ${s.name}`}
            >
              <Badge tone={table === s.name ? "ink" : "neutral"} className="transition-colors hover:border-mist">
                <span className="font-mono">{s.name}</span>
                <span className="opacity-70">· {s.label}</span>
              </Badge>
            </button>
          ))}
        </div>
      </Card>

      {!table ? (
        <Card>
          <EmptyState
            icon={<Table2 />}
            title="Pick a table to explore"
            body="Enter a dkSystem table name above — sk_vidsk holds customers and la_vara holds products — then browse its records, fields, deletions and changes."
          />
        </Card>
      ) : (
        <Card className="p-6">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <CardTitle icon={<Table2 />} className="mr-auto">
              <span className="font-mono">{table}</span>
            </CardTitle>
            <Tabs tabs={TABS} active={tab} onChange={setTab} />
          </div>
          {(tab === "update" || tab === "delete") && (
            <div className="mb-4 flex items-center gap-2 text-xs text-fog">
              <TriangleAlert className="size-3.5 text-amber" />
              Writes go straight into live dkSystem data.
            </div>
          )}
          <div key={table}>
            {tab === "records" && <RecordsPanel table={table} />}
            {tab === "fields" && <FieldsPanel table={table} />}
            {tab === "deleted" && <DeletedPanel table={table} />}
            {tab === "changes" && <ChangesPanel table={table} />}
            {tab === "update" && <UpdatePanel table={table} />}
            {tab === "delete" && <DeletePanel table={table} />}
          </div>
        </Card>
      )}
    </div>
  );
}
