/** Slim shapes consumed by the Overview/Analytics/Calculator pages. */

export interface InvoiceSummary {
  Number: number | string;
  RecordID?: number;
  InvoiceDate: string;
  DueDate?: string;
  Created?: string;
  CName?: string;
  CNumber?: string;
  TotalAmount: number;
  TotalAmountWithTax: number;
  /** 0 = open, 2 = fully settled (observed in demo data). */
  SettledType?: number;
  SettledAmount?: number;
  SalePerson?: string;
  PaymentMode?: string;
  PaymentTerm?: string;
  Currency?: string;
  Voucher?: string;
}

export interface CustomerSummary {
  Number: string;
  Name: string;
  SSNumber?: string;
  Group?: string;
  BalanceAmount?: number;
  Blocked?: boolean;
  Modified?: string;
  SalesPerson?: string;
}

export interface ProductSummary {
  ItemCode: string;
  Description?: string;
  UnitPrice1?: number;
  UnitPrice1WithTax?: number;
  Modified?: string;
  TotalQuantityInWarehouse?: number;
  Warehouses?: { Warehouse?: string; QuantityInWarehouse?: number }[];
}

export interface TimeClockEntry {
  ID: string;
  Employee: string;
  Project?: string;
  Start?: string;
  TotalHours?: number;
  EntryType?: { Name?: string };
}

export interface ProjectSummary {
  Number?: string;
  Name?: string;
  Description?: string;
  Closed?: boolean;
}

export interface EmployeeSummary {
  Number?: string;
  Name?: string;
  Email?: string;
  Phone?: string;
}

export interface LedgerAccount {
  Number?: string;
  Name?: string;
  AccountType?: number;
}

/** PATCH /sales/invoice/calculate — request and response. */
export interface CalcLineInput {
  ItemCode: string;
  Quantity: number;
  Warehouse?: string;
  UnitPrice?: number;
  Discount?: number;
}

export interface CalcRequest {
  Customer?: { Number: string };
  Date?: string;
  SalesPerson?: string;
  Currency?: string;
  Lines: CalcLineInput[];
}

export interface CalcLineResult {
  SequenceNumber?: number;
  ItemCode: string;
  Text?: string;
  Quantity: number;
  UnitPrice?: number;
  UnitPriceWithTax?: number;
  Discount?: number;
  DiscountAmount?: number;
  DiscountAmountWithTax?: number;
  TotalAmount?: number;
  TotalAmountWithTax?: number;
}

export interface CalcResult {
  CNumber?: string;
  InvoiceDate?: string;
  TotalAmount?: number;
  TotalAmountWithTax?: number;
  Currency?: string;
  DiscountPercent?: number;
  Discount?: number;
  Lines?: CalcLineResult[];
}
