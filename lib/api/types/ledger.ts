/**
 * dkPlus General Ledger module types. Transaction shape comes from the
 * documented example response; account fields are defensive (no example given).
 */

export interface LedgerAccount {
  Number: string;
  Name?: string;
  Description?: string;
  AccountType?: number | string;
  Category?: number | string;
  SubCategory?: number | string;
  TaxCode?: string;
  TaxPercent?: number;
  Active?: boolean;
  IsActive?: boolean;
  Blocked?: boolean;
  Created?: string;
  Modified?: string;
}

/** Row from GET /generalledger/transaction/... (documented example response). */
export interface LedgerTransaction {
  ID?: number;
  Account?: string;
  Created?: string;
  Modified?: string;
  DueDate?: string;
  Text?: string;
  Reference?: string;
  JournalDate?: string;
  Origin?: number;
  Voucher?: string;
  JournalType?: number;
  Code?: number | string;
  Currency?: string;
  Exchange?: number;
  Amount?: number;
  InputAmount?: number;
  TaxCode?: string;
  TaxGroup?: number;
  TaxPercent?: number;
  HCode?: string;
  HType?: number;
  IsCredit?: boolean;
  PeriodId?: number;
  Quantity?: number;
  NumberOfQuantity?: number;
  PercentageOfVATUsed?: number;
  VATReportID?: number;
}

/** Journal line for POST /generalledger/journal. */
export interface JournalLineBody {
  Account: string;
  Amount: number;
  Currency?: string;
  Date?: string;
  DueDate?: string;
  Dim1?: string;
  Reference?: string;
  Text?: string;
  Voucher?: string;
  /** Integer value or name, e.g. 0 or "GeneralLedger". */
  Type?: number | string;
}

/** POST /generalledger/journal body per the API doc. */
export interface JournalCreateBody {
  Code: string;
  Description?: string;
  /** Optional — defaults to this year. */
  Period?: number;
  Options?: {
    /** Optional — default false. */
    Post?: boolean;
    /** Optional — default true. */
    GenerateVoucher?: boolean;
  };
  Lines: JournalLineBody[];
}

/** Documented JournalType names (list truncated in the doc). */
export const JOURNAL_LINE_TYPES = [
  "GeneralLedger",
  "Customer",
  "Vendor",
  "Project",
  "Payroll",
  "FixedAssets",
  "Member",
] as const;
