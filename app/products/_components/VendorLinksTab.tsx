"use client";

import { Truck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import type { Product, VendorLinkBody } from "@/lib/api/types/products";

/** Vendor-link creation form (POST /Product/:itemcode/VendorLinks). */
export function VendorLinksTab({ itemcode }: { itemcode: string }) {
  const toast = useToast();
  const t = useT();
  const [vendor, setVendor] = useState("");
  const [description, setDescription] = useState("");
  const [primary, setPrimary] = useState(true);
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<{ vendor?: string; price?: string }>({});

  const create = useDkMutation<Product>({ invalidates: [["product", itemcode]] });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: { vendor?: string; price?: string } = {};
    if (!vendor.trim()) errs.vendor = t("products.vendorRequired");
    if (price.trim() !== "" && Number.isNaN(Number(price.replace(",", "."))))
      errs.price = t("products.mustBeNumber");
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const body: VendorLinkBody = {
      Vendor: vendor.trim(),
      PrimarySupplier: primary,
      Price: price.trim() === "" ? 0 : Number(price.replace(",", ".")),
    };
    if (description.trim()) body.Description = description.trim();

    create.mutate(
      { path: `/Product/${encodeURIComponent(itemcode)}/VendorLinks`, method: "POST", body },
      {
        onSuccess: () => {
          toast.success(
            t("products.vendorLinkCreated"),
            t("products.vendorLinkCreatedDetail", { vendor: body.Vendor, code: itemcode }),
          );
          setVendor("");
          setDescription("");
          setPrice("");
          setPrimary(true);
        },
        onError: (err) => toast.error(t("products.vendorLinkFailed"), err.message),
      },
    );
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <p className="text-sm text-fog">{t("products.vendorIntro")}</p>
      <Field label={t("products.vendorNumber")} required error={errors.vendor}>
        <Input
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          placeholder={t("products.vendorNumberExample")}
        />
      </Field>
      <Field label={t("products.description")} hint={t("products.optional")}>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("products.vendorItemName")}
        />
      </Field>
      <Field label={t("products.vendorPrice")} hint={t("products.optional")} error={errors.price}>
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="decimal"
          placeholder="0"
          className="text-right tnum"
        />
      </Field>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-soot">
        <input
          type="checkbox"
          className="size-4 accent-ink"
          checked={primary}
          onChange={(e) => setPrimary(e.target.checked)}
        />
        {t("products.primarySupplier")}
      </label>
      <Button type="submit" loading={create.isPending}>
        <Truck className="size-4" /> {t("products.createVendorLink")}
      </Button>
    </form>
  );
}
