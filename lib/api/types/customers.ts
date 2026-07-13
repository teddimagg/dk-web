/**
 * dkPlus API response types for the Customers module.
 * Field names mirror the API's PascalCase payloads; anything not confirmed by
 * the reference doc's sample payloads is optional.
 */

export interface CustomerContact {
  Number: string;
  Name: string;
  Title?: string;
  Address1?: string;
  Address2?: string;
  Address3?: string;
  City?: string;
  ZipCode?: string;
  CountryCode?: string;
  Department?: string;
  SSNumber?: string;
  Phone?: string;
  PhoneLocal?: string;
  PhoneMobile?: string;
  Fax?: string;
  Telex?: string;
  Email?: string;
  URL?: string;
  JobTitleCode?: string;
  Modified?: string;
}

export interface CustomerAttachment {
  ID?: number;
  Id?: number;
  RecordID?: number;
  AttachmentID?: number;
  FileName?: string;
  Name?: string;
  Description?: string;
  ContentType?: string;
  Size?: number;
  Date?: string;
  Created?: string;
  Modified?: string;
}

/** Best-effort id for an attachment row (exact field name varies). */
export function attachmentId(a: CustomerAttachment): number | undefined {
  return a.ID ?? a.Id ?? a.AttachmentID ?? a.RecordID;
}

/** Best-effort display name for an attachment row. */
export function attachmentName(a: CustomerAttachment): string {
  return a.FileName || a.Name || a.Description || `attachment-${attachmentId(a) ?? "?"}`;
}

export interface Customer {
  RecordID?: number;
  Number: string;
  Name: string;
  Alias?: string;
  Address1?: string;
  Address2?: string;
  Address3?: string;
  City?: string;
  ZipCode?: string;
  BalanceAmount?: number;
  Phone?: string;
  PhoneLocal?: string;
  PhoneMobile?: string;
  PhoneFax?: string;
  CountryCode?: string;
  OriginCountryCode?: string;
  Email?: string;
  SSNumber?: string;
  Password?: string;
  Group?: string;
  SalesPerson?: string;
  Discount?: number;
  UseItemRecivers?: boolean;
  PaymentTerm?: string;
  PaymentMode?: string;
  CurrencyCode?: string;
  NoVat?: boolean;
  LedgerCode?: string;
  Blocked?: boolean;
  Gender?: number;
  PriceGroup?: number;
  BillingFee?: number;
  Modified?: string;
  Contacts?: CustomerContact[];
  Recivers?: unknown[];
  Memos?: unknown[];
  Properties?: unknown[];
  Changes?: unknown[];
  Attachments?: CustomerAttachment[];
}

export interface CustomerGroup {
  Number: string;
  Description?: string;
  Text?: string;
  Name?: string;
  Modified?: string;
}

/** Best-effort label for a customer group (exact field name varies). */
export function customerGroupLabel(g: CustomerGroup): string {
  return g.Description || g.Text || g.Name || "";
}

/** Ledger transaction row — shape not documented, so everything is optional. */
export interface CustomerTransaction {
  RecordID?: number;
  Number?: string;
  Voucher?: string;
  Journal?: string;
  Date?: string;
  TransactionDate?: string;
  DueDate?: string;
  Created?: string;
  Text?: string;
  Reference?: string;
  Amount?: number;
  AmountWithTax?: number;
  Balance?: number;
  Currency?: string;
  CurrencyCode?: string;
  Origin?: number | string;
  Status?: number | string;
}

/** Sales order / quote header — shape not documented, everything optional. */
export interface CustomerSalesDoc {
  RecordID?: number;
  Number?: string | number;
  OrderNumber?: string | number;
  QuoteNumber?: string | number;
  Reference?: string;
  Date?: string;
  OrderDate?: string;
  QuoteDate?: string;
  DeliveryDate?: string;
  Created?: string;
  Modified?: string;
  TotalAmount?: number;
  TotalAmountWithTax?: number;
  Currency?: string;
  SalePerson?: string;
  SalesPerson?: string;
  Text1?: string;
  Text2?: string;
  Project?: string;
}

/** Invoice overview row (documented sample payload). */
export interface CustomerInvoice {
  Number: string;
  CNumber?: string;
  CName?: string;
  CAddress1?: string;
  CAddress2?: string;
  CZipCode?: string;
  CCountryCode?: string;
  CSSNumber?: string;
  CPhone?: string;
  CContact?: string;
  RecordID?: number;
  OrderNumber?: number;
  InvoiceDate?: string;
  DiscountPercent?: number;
  Discount?: number;
  TotalAmount?: number;
  TotalAmountWithTax?: number;
  Currency?: string;
  Reference?: string;
  SettledType?: number;
  SettledAmount?: number;
  SalePerson?: string;
  Text1?: string;
  Text2?: string;
  Origin?: number;
  PaymentTerm?: string;
  ClaimStatus?: number;
  Exchange?: number;
  SalesType?: number;
  Version?: number;
  Project?: string;
  IRNumber?: string;
  IRName?: string;
}

/** Project owned by the customer — shape not documented, everything optional. */
export interface CustomerProject {
  RecordID?: number;
  Number?: string | number;
  Name?: string;
  Description?: string;
  Group?: string;
  Status?: number | string;
  Closed?: boolean;
  Created?: string;
  Modified?: string;
}

/** Body for POST /customer and PUT /customer/:number (partial update). */
export interface CustomerUpsertBody {
  Number?: string;
  Name?: string;
  SSNumber?: string;
  Address1?: string;
  Address2?: string;
  City?: string;
  ZipCode?: string;
  Phone?: string;
  PhoneMobile?: string;
  Email?: string;
}

/** Body for contact create/update. */
export interface ContactUpsertBody {
  Number?: string;
  Name?: string;
  Title?: string;
  Department?: string;
  Email?: string;
  Phone?: string;
  PhoneMobile?: string;
  JobTitleCode?: string;
}

/** Narrow an unknown phone-lookup payload to customer-ish rows. */
export function asCustomerRows(data: unknown): Customer[] {
  const isCustomerish = (v: unknown): v is Customer =>
    !!v && typeof v === "object" && "Number" in (v as Record<string, unknown>);
  if (Array.isArray(data)) return data.filter(isCustomerish);
  if (isCustomerish(data)) return [data];
  return [];
}
