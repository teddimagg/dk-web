"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery } from "@/lib/hooks/useDk";
import {
  productGroupCode,
  productGroupLabel,
  type Product,
  type ProductGroup,
  type ProductWriteBody,
} from "@/lib/api/types/products";

interface FormState {
  itemCode: string;
  description: string;
  description2: string;
  group: string;
  taxPercent: string;
  priceWithTax: string;
  costPrice: string;
  inactive: boolean;
  showInWebShop: boolean;
}

const EMPTY: FormState = {
  itemCode: "",
  description: "",
  description2: "",
  group: "",
  taxPercent: "24",
  priceWithTax: "",
  costPrice: "",
  inactive: false,
  showInWebShop: false,
};

function parseNum(v: string): number {
  return Number(v.replace(",", "."));
}

/**
 * Create (POST /Product) and edit (PUT /Product/:itemcode) share this dialog —
 * pass `product` to switch to edit mode.
 */
export function ProductFormDialog({
  open,
  onClose,
  product,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSaved?: (p: Product) => void;
}) {
  const isEdit = !!product;
  const toast = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const groups = useDkQuery<ProductGroup[]>(["productgroups"], "/productgroup", { enabled: open });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      product
        ? {
            itemCode: product.ItemCode,
            description: product.Description ?? "",
            description2: product.Description2 ?? "",
            group: product.Group ?? "",
            taxPercent: product.TaxPercent != null ? String(product.TaxPercent) : "24",
            priceWithTax: product.UnitPrice1WithTax != null ? String(product.UnitPrice1WithTax) : "",
            costPrice: product.CostPrice ? String(product.CostPrice) : "",
            inactive: product.Inactive ?? false,
            showInWebShop: product.ShowItemInWebShop ?? false,
          }
        : EMPTY,
    );
  }, [open, product]);

  const save = useDkMutation<Product>({ invalidates: [["products"], ["product"]] });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!isEdit && !form.itemCode.trim()) errs.itemCode = "Item code is required";
    if (form.taxPercent.trim() === "" || Number.isNaN(parseNum(form.taxPercent)))
      errs.taxPercent = "Tax % must be a number";
    if (form.priceWithTax.trim() !== "" && Number.isNaN(parseNum(form.priceWithTax)))
      errs.priceWithTax = "Must be a number";
    if (form.costPrice.trim() !== "" && Number.isNaN(parseNum(form.costPrice)))
      errs.costPrice = "Must be a number";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const body: ProductWriteBody = {
      Description: form.description.trim(),
      TaxPercent: parseNum(form.taxPercent),
      ShowItemInWebShop: form.showInWebShop,
    };
    if (form.description2.trim()) body.Description2 = form.description2.trim();
    if (form.group) body.Group = form.group;
    if (form.priceWithTax.trim() !== "") body.Price1 = { UnitPriceWithTax: parseNum(form.priceWithTax) };
    if (form.costPrice.trim() !== "") body.CostPrice = parseNum(form.costPrice);
    if (product) body.Inactive = form.inactive;
    else body.ItemCode = form.itemCode.trim();

    save.mutate(
      product
        ? { path: `/Product/${encodeURIComponent(product.ItemCode)}`, method: "PUT", body }
        : { path: "/Product", method: "POST", body },
      {
        onSuccess: (saved) => {
          toast.success(
            product ? "Product updated" : "Product created",
            product ? `${product.ItemCode} saved to dkPlus.` : `${form.itemCode.trim()} added to the catalogue.`,
          );
          onClose();
          onSaved?.(saved);
        },
        onError: (err) =>
          toast.error(product ? "Could not update product" : "Could not create product", err.message),
      },
    );
  }

  const groupOptions = groups.data ?? [];
  const knownGroup = groupOptions.some((g) => productGroupCode(g) === form.group);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={product ? `Edit ${product.ItemCode}` : "New product"}
      subtitle={
        isEdit
          ? "Changes are saved straight to the dkPlus item register."
          : "Creates the product in the dkPlus item register."
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {!isEdit && (
          <Field label="Item code" required error={errors.itemCode}>
            <Input
              value={form.itemCode}
              onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
              placeholder="e.g. sndkost"
              autoFocus
            />
          </Field>
        )}
        <Field label="Description">
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Product name"
          />
        </Field>
        <Field label="Description 2" hint="optional">
          <Input
            value={form.description2}
            onChange={(e) => setForm({ ...form, description2: e.target.value })}
            placeholder="Secondary description"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Group" hint="optional">
            <Select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
              <option value="">No group</option>
              {form.group && !knownGroup && <option value={form.group}>{form.group}</option>}
              {groupOptions.map((g, i) => {
                const code = productGroupCode(g);
                if (!code) return null;
                return (
                  <option key={`${code}-${i}`} value={code}>
                    {productGroupLabel(g)}
                  </option>
                );
              })}
            </Select>
          </Field>
          <Field label="Tax %" required error={errors.taxPercent}>
            <Input
              value={form.taxPercent}
              onChange={(e) => setForm({ ...form, taxPercent: e.target.value })}
              inputMode="decimal"
              placeholder="24"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Unit price (incl. tax)" hint="optional" error={errors.priceWithTax}>
            <Input
              value={form.priceWithTax}
              onChange={(e) => setForm({ ...form, priceWithTax: e.target.value })}
              inputMode="decimal"
              placeholder="0"
              className="text-right tnum"
            />
          </Field>
          <Field label="Cost price" hint="optional" error={errors.costPrice}>
            <Input
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
              inputMode="decimal"
              placeholder="0"
              className="text-right tnum"
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-soot">
            <input
              type="checkbox"
              className="size-4 accent-ink"
              checked={form.showInWebShop}
              onChange={(e) => setForm({ ...form, showInWebShop: e.target.checked })}
            />
            Show in web shop
          </label>
          {isEdit && (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-soot">
              <input
                type="checkbox"
                className="size-4 accent-ink"
                checked={form.inactive}
                onChange={(e) => setForm({ ...form, inactive: e.target.checked })}
              />
              Inactive
            </label>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
