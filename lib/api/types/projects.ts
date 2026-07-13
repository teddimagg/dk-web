/**
 * dkPlus Projects module types. The API doc only documents the POST body
 * (`Number` + `Name`), so most fields are optional/defensive.
 */

export interface Project {
  Number: string;
  Name?: string;
  Description?: string;
  Manager?: string;
  Contact?: string;
  Closed?: boolean;
  Locked?: boolean;
  Created?: string;
  Modified?: string;
  StartDate?: string;
  EndDate?: string;
}

/** Sales invoice as returned by GET /project/:number/invoice. */
export interface ProjectInvoice {
  Number?: number | string;
  InvoiceNumber?: number | string;
  Reference?: string;
  Customer?: {
    Number?: string;
    Name?: string;
  };
  SalesPerson?: string;
  Date?: string;
  DueDate?: string;
  Currency?: string;
  TotalAmount?: number;
  TotalAmountWithTax?: number;
  Text1?: string;
  Text2?: string;
}

/** Row from GET /project/transaction/page/:page/:count. */
export interface ProjectTransaction {
  ID?: number;
  Project?: string;
  Number?: string;
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
  Currency?: string;
  Exchange?: number;
  Amount?: number;
  InputAmount?: number;
  Quantity?: number;
  Dim1?: string;
  IsCredit?: boolean;
  PeriodId?: number;
}

/** POST /project body per the API doc. */
export interface ProjectCreateBody {
  Number: string;
  Name: string;
}
