/**
 * Types for the General module (docs/api/general.md):
 * employees, payments, currencies/dimensions/nation lookups and the
 * dkSystem table explorer. Uncertain fields are optional.
 */

/** Arbitrary raw dkSystem record — shape depends on the table queried. */
export type DkRecord = Record<string, unknown>;

export interface EmployeeBankAccount {
  Code?: string;
  Owner?: string;
  OwnerName?: string;
  AccountType?: string;
  AccountGroup?: string;
  Account?: string;
}

export interface Employee {
  Number: string;
  Name?: string;
  Address1?: string;
  Address2?: string;
  Address3?: string;
  ZipCode?: string;
  City?: string;
  CountryCode?: string;
  SSNumber?: string;
  Comment?: string;
  StampStatus?: number;
  StampType?: number;
  Phone?: string;
  PhoneLocal?: string;
  PhoneMobile?: string;
  Fax?: string;
  Email?: string;
  Url?: string;
  Tag?: string;
  Status?: number;
  Supervisor?: string;
  Dim1?: string;
  Dim2?: string;
  Dim3?: string;
  Gender?: number;
  Group?: string;
  SpouseName?: string;
  ShortName?: string;
  Modified?: string;
  Created?: string;
  BankAccount?: EmployeeBankAccount;
}

export interface ProjectPhaseRef {
  PhaseID?: string;
  Description?: string;
}

export interface ProjectTaskRef {
  TaskID?: string;
  Description?: string;
}

/** Project row returned by /general/employee/:number/worker and /supervisor. */
export interface EmployeeProject {
  Number: string;
  Name?: string;
  Group?: string;
  MasterJobNumber?: string;
  QuotationNumber?: number;
  CustomerToBill?: string;
  CustomerNameToBill?: string;
  CustomerToRecieve?: string;
  Founder?: string;
  Owner?: string;
  Supervisor?: string;
  Worker?: string;
  Dim1?: string;
  Dim2?: string;
  Dim3?: string;
  FoundingDate?: string;
  EstimatedBeginingDate?: string;
  EstimatedFinishDate?: string;
  ActualBeginingDate?: string;
  ActualFinishDate?: string;
  JobType?: number;
  JobStatus?: number;
  JobBillingMode?: number;
  PhaseId?: string;
  TaskId?: string;
  ForeignName?: string;
  JobContactName?: string;
  QuotationAmount?: number;
  QuotationCurrencyCode?: string;
  Modified?: string;
  LinkedPhases?: ProjectPhaseRef[];
  LinkedTasks?: ProjectTaskRef[];
}

/** One line for POST /General/Employee/:employee/work. */
export interface WorkEntryLine {
  Date: string;
  Text: string;
  Project: string;
  Phase?: string;
  Task?: string;
  DayTime?: number;
  OverTime?: number;
  Billable?: boolean;
}

/** Payment mode / payment term — small code + description lookups. */
export interface PaymentItem {
  Number?: string;
  Code?: string;
  Id?: string;
  Description?: string;
  [key: string]: unknown;
}

export interface NationAddress {
  Address1?: string;
  Address2?: string;
  ZipCode?: string;
  City?: string;
  [key: string]: unknown;
}

/** GET /nation/entry/:id */
export interface NationEntry {
  Number?: string;
  Name?: string;
  Address?: NationAddress;
  [key: string]: unknown;
}

/** GET /general/table/:name/deleted */
export interface DeletedRecord {
  Id?: string;
  Name?: string;
  Created?: string;
  UniqeId?: number;
}

/** GET /general/table/:name/changes?modified=... */
export interface TableChanges {
  Count?: number;
}
