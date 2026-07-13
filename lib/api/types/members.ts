/**
 * Types for the dkPlus Members module (docs/api/members.md).
 * Only Member / Career / Education have documented response examples;
 * the remaining shapes are typed defensively with optional fields.
 */

export interface DkPeriod {
  From?: string;
  To?: string;
}

export interface MemberAddress {
  Address1?: string;
  Address2?: string;
  Address3?: string;
  Address4?: string;
  ZipCode?: string;
  City?: string;
  CountryCode?: string;
  CountryName?: string;
  CountyCode?: string;
}

export interface MemberContactDetail {
  Phone?: string;
  Direct?: string;
  Mobile?: string;
  Fax?: string;
  Telex?: string;
  Email?: string;
  URL?: string;
}

export interface MemberStatistics {
  MemberAge?: number;
  CareerAge?: number;
}

export interface MemberStatusFlags {
  Blocked?: boolean;
  Dead?: boolean;
  Retired?: boolean;
  Disabled?: boolean;
}

export interface Member {
  ID?: number;
  Created?: string;
  Modified?: string;
  Number: string;
  Name?: string;
  SSNumber?: string;
  Address?: MemberAddress;
  ContactDetail?: MemberContactDetail;
  Password?: string;
  Group?: string;
  Tag?: string;
  SalesPerson?: string;
  Discount?: number;
  PaymentType?: string;
  CurrencyCode?: string;
  NoVat?: boolean;
  LedgerCode?: string;
  Points?: number;
  Statistics?: MemberStatistics;
  Status?: MemberStatusFlags;
  Gender?: number;
  PaymentMode?: string;
  HasConfirmedTerms?: boolean;
  ConfirmedTermId?: number;
  ExtraProperties?: Record<string, unknown>;
}

export interface MemberBankAccount {
  Code?: string;
  Group?: string;
  Account?: string;
}

/** GET /member/:number/application — shape undocumented, probed defensively. */
export interface MemberApplication {
  ID?: number;
  Id?: number;
  Member?: string;
  Fund?: string;
  FundName?: string;
  Grant?: string;
  GrantName?: string;
  Description?: string;
  Status?: number | string;
  StatusText?: string;
  Amount?: number;
  Date?: string;
  Created?: string;
  Modified?: string;
  BankAccount?: MemberBankAccount;
}

/** GET /member/fund/:fund/application/:id/attachments — shape undocumented. */
export interface MemberApplicationAttachment {
  ID?: number | string;
  Id?: number | string;
  AttachmentID?: number | string;
  FileName?: string;
  Name?: string;
  Description?: string;
  Size?: number;
  FileSize?: number;
  ContentType?: string;
  Created?: string;
  Modified?: string;
  Date?: string;
}

/** GET /member/:number/subgroup — shape undocumented. */
export interface MemberSubGroup {
  ID?: number;
  Group?: string;
  SubGroup?: string;
  Code?: string;
  Name?: string;
  Description?: string;
  Period?: DkPeriod;
  Created?: string;
  Modified?: string;
}

export interface MemberCareer {
  ID?: number;
  Company?: string;
  CompanyName?: string;
  JobTitleCode?: string;
  JobTitle?: string;
  Period?: DkPeriod;
  WorkPercentage?: number;
  Description?: string;
  Workplace?: string;
  WorkplaceName?: string;
}

/** GET /member/:number/fund — shape undocumented. */
export interface MemberFund {
  ID?: number;
  Fund?: string;
  Code?: string;
  Number?: string;
  Name?: string;
  FundName?: string;
  Description?: string;
  Balance?: number;
  Amount?: number;
  Points?: number;
  Period?: DkPeriod;
  Created?: string;
  Modified?: string;
}

export interface MemberEducationCourse {
  Code?: string;
  Text?: string;
  Description?: string;
}

export interface MemberEducation {
  ID?: number;
  Member?: string;
  Institution?: string;
  InstitutionDesc?: string;
  Period?: DkPeriod;
  Course?: MemberEducationCourse;
  Description?: string;
  Reference?: string;
  ZipCode?: string;
  CountryCode?: string;
  MasterSSNumber?: string;
  MasterName?: string;
  CompanySSNumber?: string;
  CompanyName?: string;
}

/** GET /member/:number/membership — shape undocumented. */
export interface MemberMembership {
  ID?: number;
  Member?: string;
  Group?: string;
  Code?: string;
  Type?: string;
  Name?: string;
  Description?: string;
  Status?: string | number;
  Period?: DkPeriod;
  Created?: string;
  Modified?: string;
}
