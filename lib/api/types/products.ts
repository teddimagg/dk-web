/**
 * dkPlus Products module API types. Field names mirror the API payloads
 * (PascalCase). Fields not guaranteed by the docs are optional; endpoints
 * without documented response shapes (product groups, warehouses, barcodes)
 * are typed loosely with narrowing helpers below.
 */

export interface ProductWarehouseStock {
  Warehouse?: string;
  SubGroup1?: string;
  SubGroup2?: string;
  SubGroup3?: string;
  SubGroup4?: string;
  QuantityInStock?: number;
  MinimumStock?: number;
  MaximumStock?: number;
  LocationInWarehouse?: string;
  QuantityOnBackOrders?: number;
  QuantityPoOrders?: number;
  Modified?: string;
  Variations?: unknown[];
}

export interface ProductBarcode {
  RecordID?: number;
  Barcode?: string;
  Code?: string;
  Description?: string;
  UnitCode?: string;
  Quantity?: number;
  Inactive?: boolean;
  Created?: string;
  Modified?: string;
}

export interface ProductAttachment {
  ID?: number;
  Id?: number;
  AttachmentID?: number;
  RecordID?: number;
  FileName?: string;
  Name?: string;
  Description?: string;
  ContentType?: string;
  Size?: number;
  Linked?: string;
  Created?: string;
}

export interface Product {
  RecordID?: number;
  ItemCode: string;
  Description?: string;
  Description2?: string;
  Inactive?: boolean;
  RecordCreated?: string;
  RecordModified?: string;
  AliasItemCode?: string;
  ItemClass?: number;
  UnitCode?: string;
  Group?: string;
  UnitQuantity?: number;
  NetWeight?: number;
  UnitVolume?: number;
  TotalQuantityInWarehouse?: number;
  PurchasePrice?: number;
  CurrencyCode?: string;
  Exchange?: number;
  UnitPrice1?: number;
  Purchasefactor?: number;
  CostPrice?: number;
  ProfitRatio1?: number;
  UnitPrice1WithTax?: number;
  UnitPrice2?: number;
  UnitPrice2WithTax?: number;
  UnitPrice3?: number;
  UnitPrice3WithTax?: number;
  ShowItemInWebShop?: boolean;
  AllowDiscount?: boolean;
  Discount?: number;
  PropositionPrice?: number;
  PropositionDateTo?: string;
  ExtraDesc1?: string;
  ExtraDesc2?: string;
  IsVariation?: boolean;
  TaxPercent?: number;
  SalesTaxCode?: string;
  SalesLedgerCode?: string;
  PurchaseTaxCode?: string;
  PurchaseLedgerCode?: string;
  AllowNegativeInventiry?: boolean;
  DiscountQuantity?: number;
  MaxDiscountAllowed?: number;
  DefaultSaleQuantity?: number;
  ExtraFeeItemCode?: string;
  CostMethod?: number;
  Dim1?: string | null;
  Dim2?: string | null;
  Dim3?: string | null;
  HasAttachments?: boolean;
  HasBarcodes?: boolean;
  HasCurrencyPrices?: boolean;
  HasUnits?: boolean;
  HasAlternative?: boolean;
  Barcodes?: ProductBarcode[];
  Attachments?: ProductAttachment[];
  Categories?: unknown[];
  Warehouses?: ProductWarehouseStock[];
  CurrencyPrices?: unknown[];
  Units?: unknown[];
  Alternative?: unknown[];
  Changes?: unknown[];
}

export interface ProductTransaction {
  ID: number;
  Created?: string;
  Modified?: string;
  Origin?: number;
  HeadId?: number;
  Sequence?: number;
  ItemCode?: string;
  Warehouse?: string;
  TransactionCode?: number;
  JournalDate?: string;
  JournalType?: number;
  Quantity?: number;
  PurchasePrice?: number;
  CurrencyCode?: string;
  Exchange?: number;
  CostPrice?: number;
  CostAmount?: number;
  SalesAmount?: number;
  InventOnHand?: number;
  Text?: string;
  NetWeight?: number;
  UnitVolume?: number;
  NumberOfPackages?: number;
  CountedQuantity?: number;
  JobNumber?: string;
  VendorPrice?: number;
  VendorDiscount?: number;
  Fabrication?: number;
  BatchExpiry?: string;
  TypeOf?: number;
  PurchaseAmount?: number;
  PoBatchId?: number;
}

/** GET /productgroup — response shape undocumented, all fields optional. */
export interface ProductGroup {
  RecordID?: number;
  Number?: string;
  Group?: string;
  Code?: string;
  Description?: string;
  Name?: string;
  Created?: string;
  Modified?: string;
}

/** GET /productwarehouse — response shape undocumented, all fields optional. */
export interface ProductWarehouseInfo {
  RecordID?: number;
  Number?: string;
  Warehouse?: string;
  Code?: string;
  Description?: string;
  Name?: string;
}

// ---------------------------------------------------------------------------
// Request bodies
// ---------------------------------------------------------------------------

export interface ProductPriceInput {
  UnitPrice?: number;
  UnitPriceWithTax?: number;
}

/** POST /Product and PUT /Product/:itemcode. */
export interface ProductWriteBody {
  ItemCode?: string;
  AliasItemCode?: string;
  Group?: string;
  Description?: string;
  Description2?: string;
  Price1?: ProductPriceInput;
  Price2?: ProductPriceInput;
  Price3?: ProductPriceInput;
  CostPrice?: number;
  TaxPercent?: number;
  Inactive?: boolean;
  PurchacePrice?: number;
  AllowDiscount?: boolean;
  Discount?: number;
  ExtraDesc1?: string;
  ExtraDesc2?: string;
  AllowNegativeInventory?: boolean;
  ShowItemInWebShop?: boolean;
}

/** POST /Product/:itemcode/VendorLinks. */
export interface VendorLinkBody {
  Vendor: string;
  Description?: string;
  PrimarySupplier?: boolean;
  Price?: number;
}

/** POST /product/register/journal line. */
export interface InventoryJournalLine {
  ItemCode: string;
  Text?: string;
  Reference?: string;
  Warehouse: string;
  Date?: string;
  Quantity: number;
  Price1?: number;
}

export interface InventoryJournalBody {
  Date?: string;
  Description: string;
  Lines: InventoryJournalLine[];
}

/** POST /Product/register/transfer — body is an array of these. */
export interface WarehouseTransferItem {
  ItemCode: string;
  From: string;
  To: string;
  Comment?: string;
  Quantity: number;
}

/** POST /product/register/Inventorying line. */
export interface InventoryingLine {
  ItemCode: string;
  Warehouse: string;
  Counted: number;
}

export interface InventoryingBody {
  Description: string;
  Lines: InventoryingLine[];
}

// ---------------------------------------------------------------------------
// Narrowing helpers for loosely-documented payloads
// ---------------------------------------------------------------------------

export function productGroupCode(g: ProductGroup): string {
  return g.Number ?? g.Group ?? g.Code ?? (g.RecordID != null ? String(g.RecordID) : "");
}

export function productGroupLabel(g: ProductGroup): string {
  const code = productGroupCode(g);
  const desc = g.Description ?? g.Name ?? "";
  if (desc && code && desc !== code) return `${code} — ${desc}`;
  return code || desc;
}

export function warehouseCode(w: ProductWarehouseInfo): string {
  return w.Number ?? w.Warehouse ?? w.Code ?? (w.RecordID != null ? String(w.RecordID) : "");
}

export function warehouseLabel(w: ProductWarehouseInfo): string {
  const code = warehouseCode(w);
  const desc = w.Description ?? w.Name ?? "";
  if (desc && code && desc !== code) return `${code} — ${desc}`;
  return code || desc;
}

export function barcodeValue(b: ProductBarcode): string {
  return b.Barcode ?? b.Code ?? "";
}

export function attachmentId(a: ProductAttachment): number | undefined {
  return a.ID ?? a.Id ?? a.AttachmentID ?? a.RecordID;
}

export function attachmentName(a: ProductAttachment): string {
  const id = attachmentId(a);
  return a.FileName ?? a.Name ?? a.Description ?? (id != null ? `attachment-${id}` : "attachment");
}
