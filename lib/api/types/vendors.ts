/**
 * dkPlus Vendor API types. Fields are PascalCase as returned by the API.
 * Many fields are marked optional — the dkPlus payloads vary between
 * installations, so renders should always fall back gracefully.
 */

export interface Vendor {
  Number: string;
  Name?: string;
  SSNumber?: string;
  Alias?: string;
  Address1?: string;
  Address2?: string;
  City?: string;
  ZipCode?: string;
  Country?: string;
  Phone?: string;
  Fax?: string;
  Email?: string;
  ContactName?: string;
  PaymentMode?: string;
  PaymentTerm?: string;
  LedgerCode?: string;
  CurrencyCode?: string;
  Blocked?: boolean;
  Inactive?: boolean;
  Balance?: number;
  Comment?: string;
  BankAccount?: string;
  Created?: string;
  Modified?: string;
}

/** Body for POST /vendor and PUT /vendor/:number (send only the fields you set). */
export interface VendorWriteBody {
  Number?: string;
  SSNumber?: string;
  Name?: string;
  Alias?: string;
  Address1?: string;
  Address2?: string;
  City?: string;
  ZipCode?: string;
  Phone?: string;
  Email?: string;
  PaymentMode?: string;
  PaymentTerm?: string;
  LedgerCode?: string;
  Comment?: string;
}

export interface VendorTransaction {
  ID?: number;
  RecordID?: number;
  Voucher?: string;
  Reference?: string;
  Journal?: string;
  Description?: string;
  Text?: string;
  Date?: string;
  DueDate?: string;
  Created?: string;
  Modified?: string;
  Amount?: number;
  Balance?: number;
  Remaining?: number;
  Currency?: string;
  CurrencyAmount?: number;
  Dim1?: string;
  Dim2?: string;
  Vendor?: string;
  VendorNumber?: string;
  VendorName?: string;
  Status?: number | string;
}

export interface VendorInvoiceLine {
  ID?: number;
  Sequence?: number;
  Account?: string;
  Type?: number | string;
  Text?: string;
  Description?: string;
  Amount?: number;
  Reference?: string;
  Dim1?: string;
  Dim2?: string;
}

export interface VendorInvoiceAttachment {
  ID?: number;
  Name?: string;
  FileName?: string;
  ContentType?: string;
  Size?: number;
  /** base64 payload — never render or fetch in list views. */
  Content?: string;
}

/** Vendor invoice as returned by processed / unprocessed / approval routes. */
export interface VendorInvoice {
  ID?: number;
  InvoiceID?: number;
  RecordID?: number;
  Number?: string;
  InvoiceNumber?: string;
  Reference?: string;
  Description?: string;
  Text?: string;
  Vendor?: string | { Number?: string; Name?: string };
  VendorNumber?: string;
  VendorName?: string;
  Date?: string;
  DueDate?: string;
  ReceivedDate?: string;
  Created?: string;
  Modified?: string;
  Amount?: number;
  TotalAmount?: number;
  TotalAmountWithTax?: number;
  Currency?: string;
  Exchange?: number;
  Status?: number | string;
  /** Approved(0), UnApproved(1), Denied(2) */
  ApprovalStatus?: number | string;
  Approved?: number | boolean;
  Voucher?: string;
  Journal?: string;
  Lines?: VendorInvoiceLine[];
  Attachments?: VendorInvoiceAttachment[];
  Files?: VendorInvoiceAttachment[];
}

/** LineType for new vendor invoice lines: Expenses(0), Payment(1). */
export type VendorInvoiceLineType = "Expenses" | "Payment";

export interface VendorInvoiceCreateLine {
  Account: string;
  Type: VendorInvoiceLineType;
  Amount: number;
  Text?: string;
  Reference?: string;
  Dim1?: string;
  Dim2?: string;
}

/** Body for POST /Vendor/:number/Invoice */
export interface VendorInvoiceCreateBody {
  Number: string;
  Date: string;
  Reference?: string;
  Description?: string;
  Text?: string;
  DueDate?: string;
  ReceivedDate?: string;
  Amount?: number;
  Currency?: string;
  Exchange?: number;
  Lines: VendorInvoiceCreateLine[];
}

/** Body for PUT /vendor/invoice/my/approval/:invoiceid */
export interface VendorInvoiceApprovalBody {
  /** Approved(0), UnApproved(1), Denied(2) */
  ApprovalAction: 0 | 1 | 2;
  Description?: string | null;
  Reference?: string | null;
  Dim1?: string | null;
  Dim2?: string | null;
  Dim3?: string | null;
}

export interface PurchaseOrderVendor {
  Number?: string;
  Name?: string;
  Address1?: string;
  Address2?: string;
}

export interface PurchaseOrderLine {
  ID?: number;
  Sequence?: number;
  LineID?: number;
  Warehouse?: string;
  Code?: string;
  ItemCode?: string;
  ExternalCode?: string;
  CodeType?: number | string;
  Description?: string;
  Text?: string;
  Reference?: string;
  Quantity?: number;
  QuantityReceived?: number;
  UnitPrice?: number;
  Price?: number;
  Amount?: number;
  TotalAmount?: number;
}

export interface PurchaseOrder {
  RecordID?: number;
  ID?: number;
  Number?: string | number;
  Reference?: string;
  Vendor?: PurchaseOrderVendor;
  VendorNumber?: string;
  VendorName?: string;
  OrderDate?: string;
  DeliveryDate?: string;
  Created?: string;
  Modified?: string;
  Status?: number | string;
  TotalAmount?: number;
  Currency?: string;
  Lines?: PurchaseOrderLine[];
}

export type PurchaseCodeType = "ItemCode" | "Barcode" | "VendorItemCode";

export interface PurchaseCreateLine {
  Code: string;
  CodeType: PurchaseCodeType;
  Quantity: number;
  Warehouse?: string;
  Reference?: string;
}

/** One order of the array body for POST /purchase */
export interface PurchaseCreateBody {
  Vendor: { Number: string; Name?: string };
  Lines: PurchaseCreateLine[];
  Reference?: string;
  OrderDate?: string;
}

/** Body for PATCH /purchase/:id */
export interface PurchaseUpdateBody {
  Reference?: string;
  OrderDate?: string;
  Vendor?: { Number: string };
  Lines?: { ID: number; Quantity?: number }[];
}

/** Body for PATCH /purchase/:id/line/:seq */
export interface PurchaseLineUpdateBody {
  Warehouse?: string;
  ItemCode?: string;
  ExternalCode?: string;
  Reference?: string;
  Quantity?: number;
}
