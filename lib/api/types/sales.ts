/**
 * dkPlus Sales module API types (docs/api/sales.md).
 * PascalCase fields mirror the API payloads; uncertain fields are optional.
 */

/* ---------------------------------- Invoices ---------------------------------- */

export interface SalesInvoiceLine {
  SequenceNumber?: number;
  ItemCode?: string;
  Text?: string;
  Text2?: string;
  Warehouse?: string;
  Quantity?: number;
  UnitCode?: string;
  UnitPrice?: number;
  UnitPriceWithTax?: number;
  Discount?: number;
  DiscountAmount?: number;
  DiscountAmountWithTax?: number;
  TotalAmount?: number;
  TotalAmountWithTax?: number;
  Dim1?: string;
  Variations?: unknown[];
}

export interface SalesInvoice {
  Number?: string;
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
  DueDate?: string;
  DiscountPercent?: number;
  Discount?: number;
  TotalAmount?: number;
  TotalAmountWithTax?: number;
  Currency?: string;
  Reference?: string;
  /** 0 = unsettled, 1 = partially settled, 2 = settled (inferred from demo data). */
  SettledType?: number;
  SettledAmount?: number;
  SalePerson?: string;
  Text1?: string;
  Text2?: string;
  Dim1?: string | null;
  Origin?: number;
  PaymentTerm?: string;
  ClaimStatus?: number;
  ClaimNumber?: number;
  ClaimDate?: string;
  Exchange?: number;
  /** 0 = debit, 1 = credit. */
  SalesType?: number;
  Version?: number;
  Project?: string;
  Voucher?: string;
  IRNumber?: string;
  IRName?: string;
  IRAddress1?: string;
  IRAddress2?: string;
  IRZipCode?: string;
  IRContact?: string;
  ExternalInvoiceNumber?: number;
  Register?: string;
  PosInvoice?: number;
  Lines?: SalesInvoiceLine[] | null;
}

/** Line shape for POST /sales/invoice (the doc's create example uses `Price`). */
export interface InvoiceDraftLine {
  ItemCode: string;
  Quantity: number;
  Price?: number;
  Text?: string;
}

/** Body for POST /sales/invoice. */
export interface InvoiceDraft {
  Customer: { Number: string; Name?: string };
  Reference?: string;
  /** Doc property list names the field `Date`; responses use `InvoiceDate`. */
  Date?: string;
  InvoiceDate?: string;
  SalesPerson?: string;
  Text1?: string;
  Lines: InvoiceDraftLine[];
}

/** Body for PATCH /sales/invoice/calculate. */
export interface InvoiceCalculateBody {
  Customer: { Number: string };
  Date?: string;
  SalesPerson?: string;
  Lines: { ItemCode: string; Quantity: number; WareHouse?: string }[];
}

/* -------------------------------- Payment plans -------------------------------- */

export interface PaymentPlanTransaction {
  Amount: number;
  Date: string;
}

/** Body for POST /sales/invoice/:number/paymentplan. */
export interface PaymentPlanBody {
  Description: string;
  Amount: number;
  Transactions: PaymentPlanTransaction[];
  Reference?: string;
  Card?: { Number: string; Type: string };
  SenderId?: string;
}

/** Body for PUT /sales/invoice/:invoice/paymentplan/:number (cancel). */
export interface PaymentPlanCancelBody {
  User?: string;
  Reason?: string;
}

/* ---------------------------------- Email ---------------------------------- */

/** Body for POST /sales/{invoice|order|quote}/:number/email. */
export interface SalesEmailBody {
  To: string;
  Subject: string;
  Cc?: string;
  Bcc?: string;
  /** None(0), Highest(1), High(2), Normal(3), Low(4), Lowest(5). */
  Priority?: number;
  DisplayName?: string;
}

/* ------------------------------- Orders & quotes ------------------------------- */

export interface SalesOrderCustomer {
  Number?: string;
  Name?: string;
  Address1?: string;
  Address2?: string;
  ZipCode?: string;
  City?: string;
  Country?: string;
}

export interface SalesOrderPayment {
  ID?: number;
  Name?: string;
  Amount?: number;
}

export interface SalesOrderLine {
  SequenceNumber?: number;
  ItemCode?: string;
  Text?: string;
  Text2?: string;
  Warehouse?: string;
  Quantity?: number;
  QuantityDelivered?: number;
  UnitPrice?: number;
  UnitPriceWithTax?: number;
  Price?: number;
  IncludingVAT?: boolean;
  UnitCode?: string;
  Discount?: number;
  DiscountAmount?: number;
  DiscountPercent?: number;
  TotalAmount?: number;
  TotalAmountWithTax?: number;
  BarCode?: string;
  Reference?: string;
  EDIOrderNumber?: string;
  UNDOrderNumber?: number;
  Dim1?: string;
  Variations?: unknown[];
}

/** Shape returned by GET /sales/order/:id (also used for quotes). */
export interface SalesOrder {
  Number?: number | string;
  ID?: number;
  Customer?: SalesOrderCustomer;
  DeliverTo?: SalesOrderCustomer;
  Date?: string;
  OrderDate?: string;
  TotalAmount?: number;
  TotalAmountWithTax?: number;
  Currency?: string;
  Exchange?: number;
  Reference?: string;
  SalePerson?: string;
  Text1?: string;
  Text2?: string;
  Dim1?: string;
  PaymentTerm?: string;
  Warehouse?: string;
  Lines?: SalesOrderLine[] | null;
  Payments?: SalesOrderPayment[] | null;
}

/** Line shape for POST /sales/order and POST /sales/quote. */
export interface OrderDraftLine {
  ItemCode: string;
  Quantity: number;
  UnitPrice?: number;
  Text?: string;
}

/** Body for POST /sales/order and PUT /sales/order/:id. */
export interface OrderDraft {
  Number?: number;
  Customer: SalesOrderCustomer & { Number: string };
  OrderDate?: string;
  Currency?: string;
  Reference?: string;
  SalePerson?: string;
  PaymentTerm?: string;
  Text1?: string;
  Text2?: string;
  Lines?: OrderDraftLine[];
}

/** Body for POST /sales/quote (same as order but the date field is `Date`). */
export interface QuoteDraft {
  Customer: SalesOrderCustomer & { Number: string };
  Date?: string;
  Currency?: string;
  Reference?: string;
  SalePerson?: string;
  Text1?: string;
  Lines?: OrderDraftLine[];
}

/** Body for POST /sales/order/:id/line and PUT /sales/order/:id/line/:lineid. */
export interface OrderLineBody {
  SequenceNumber?: number;
  ItemCode?: string;
  Text?: string;
  Quantity?: number;
  UnitPrice?: number;
  Warehouse?: string;
}

/* -------------------------------- Salespeople -------------------------------- */

export interface SalesPerson {
  Number: string;
  Employee?: string;
  NameOnSalesOrders?: string;
  Warehouse?: string;
  Modified?: string;
  Created?: string;
  PriceGroup?: number;
  Price1Closed?: boolean;
  Price2Closed?: boolean;
  Price3Closed?: boolean;
  CanChangeDueDate?: boolean;
  FilterOnCustomer?: boolean;
}

/** Body for POST /sales/person and PUT /sales/person/:number. */
export interface SalesPersonBody {
  Number?: string;
  Employee?: string;
  NameOnSalesOrders?: string;
  Warehouse?: string;
  PriceGroup?: number;
  Price1Closed?: boolean;
  Price2Closed?: boolean;
  Price3Closed?: boolean;
  CanChangeDueDate?: boolean;
  FilterOnCustomer?: boolean;
}

/** Response of DELETE /sales/person/:number. */
export interface SalesDeleteResult {
  Deleted?: number;
}

/* -------------------------------- Payment types -------------------------------- */

export interface SalesPaymentType {
  PaymentId: number;
  Name?: string;
  Type?: number;
  GLAccountNumber?: string;
  Active?: boolean;
  Modified?: string;
}
