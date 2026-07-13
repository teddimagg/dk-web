/**
 * Platform module types — time clock, webhooks, tokens & access, company info,
 * My Pages invites and global search. dk response shapes for several of these
 * endpoints are undocumented, so fields are optional and objects carry an
 * `unknown` index signature for defensive rendering.
 */

// ---------- Time clock ----------

export interface TimeClockEntry {
  Employee?: string | number;
  EmployeeNumber?: string | number;
  Name?: string;
  EmployeeName?: string;
  Type?: number;
  TypeName?: string;
  EntryTypeName?: string;
  Start?: string;
  End?: string;
  TotalHours?: number;
  [key: string]: unknown;
}

export interface RegisterTimeClockBody {
  Employee: string;
  Start: string;
  End?: string;
}

// ---------- Webhooks ----------

export interface WebhookOptions {
  Enabled?: boolean;
  Product?: boolean;
  Customer?: boolean;
  Vendor?: boolean;
  Project?: boolean;
}

export interface WebhookSubscription {
  ID: string;
  Description?: string;
  Url?: string;
  AuthorizationScheme?: string;
  AuthorizationValue?: string;
  Options?: WebhookOptions;
}

export interface WebhookBody {
  Description: string;
  Url: string;
  AuthorizationScheme?: string;
  AuthorizationValue?: string;
  Options: WebhookOptions;
}

// ---------- Tokens ----------

export interface TokenCompany {
  ID?: string;
  Name?: string;
  [key: string]: unknown;
}

export interface CreateTokenBody {
  /** Company GUID (optional — defaults to the token's own company). */
  Company?: string;
  Description: string;
}

export interface UsageEmailBody {
  To: string;
  Subject: string;
  Cc?: string;
  Bcc?: string;
  /** None(0) Highest(1) High(2) Normal(3) Low(4) Lowest(5) */
  Priority?: number;
}

// ---------- Company information (GET /company) ----------

export interface CompanyDetails {
  Number?: string;
  Name?: string;
  SSNumber?: string;
  Address1?: string;
  Address2?: string;
  Address3?: string;
  ZipCode?: string;
  Country?: string;
  BankCode?: string;
  BankAccGroup?: string;
  BankAccount?: string;
  VATNumber?: string;
  Phone?: string;
  Mobile?: string;
  Fax?: string;
  Email?: string;
  Url?: string;
  Swift?: string;
  IBAN?: string;
  City?: string;
}

export interface CompanyInfoResponse {
  Information?: {
    Owner?: string;
    OwnerName?: string;
    License?: string;
    Company?: CompanyDetails;
  };
  Customer?: { Enabled?: boolean };
  Product?: {
    Enabled?: boolean;
    Warehouse?: { Enabled?: boolean; Default?: string };
    Categories?: boolean;
  };
  Vendor?: { Enabled?: boolean; Confirmation?: boolean };
  Sale?: { Enabled?: boolean };
  Project?: {
    Enabled?: boolean;
    PhaseEnabled?: boolean;
    TaskEnabled?: boolean;
    EnterDriveInJournal?: boolean;
    DefaultDriveUnit?: number;
  };
  Dimmension?: { Dim1Enabled?: boolean; Dim2Enabled?: boolean; Dim3Enabled?: boolean };
  General?: { CurrencyEnabled?: boolean; DefaultCurrency?: string; Attachments?: boolean };
  Member?: { Enabled?: boolean };
  [key: string]: unknown;
}

// ---------- My Pages invites ----------

export interface MyPagesInvite {
  ID?: string;
  Email?: string;
  Customer?: string | number;
  Role?: string;
  Created?: string;
  [key: string]: unknown;
}

export interface MyPagesInviteBody {
  Email: string;
  Customer: string;
  Role: string;
}

// ---------- Search ----------

/** Global search hit — Type: 0 Customer, 1 Vendor, 2 Product, 3 Employee. */
export interface SearchHit {
  Type?: number;
  ID?: string | number;
  Name?: string;
  Url?: string;
  [key: string]: unknown;
}

export interface CustomerSearchHit {
  Number?: string | number;
  Name?: string;
  SSNumber?: string;
  Email?: string;
  Phone?: string;
  Address1?: string;
  City?: string;
  [key: string]: unknown;
}

export interface ProductSearchHit {
  ItemCode?: string;
  Description?: string;
  Description2?: string;
  UnitPrice1?: number;
  UnitPrice1WithTax?: number;
  Inactive?: boolean;
  [key: string]: unknown;
}
