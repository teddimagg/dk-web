import {
  BookOpenText,
  Clock,
  FolderKanban,
  IdCard,
  KeyRound,
  Landmark,
  Package,
  ReceiptText,
  Truck,
  Users,
  Webhook,
  type LucideIcon,
} from "lucide-react";

export interface ModuleDef {
  /** i18n slug: labels resolve via t(`module.${key}.label`) / `.desc`. */
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
  desc: string;
  /** Signature color — chips, active tabs and the header wash of the module. */
  accent: string;
  /** Soft tint of the accent for washes and hover states. */
  soft: string;
}

/**
 * Registry of the dkPlus modules — drives the nav launcher, quick links and
 * each module's visual identity (every facet has its own color, so any screen
 * is recognizable at a glance).
 */
export const MODULES: ModuleDef[] = [
  { key: "customers", href: "/customers", label: "Customers", icon: Users, desc: "Cards, contacts, groups & balances", accent: "#76FB91", soft: "#E9FEF0" },
  { key: "sales", href: "/sales", label: "Sales", icon: ReceiptText, desc: "Invoices, orders, quotes & salespeople", accent: "#FFE14D", soft: "#FFF8DC" },
  { key: "products", href: "/products", label: "Products", icon: Package, desc: "Items, barcodes, warehouses & inventory", accent: "#B9A6FF", soft: "#F1EDFF" },
  { key: "vendors", href: "/vendors", label: "Vendors", icon: Truck, desc: "Vendors, invoices, approvals & purchases", accent: "#FFB36B", soft: "#FFF1E2" },
  { key: "projects", href: "/projects", label: "Projects", icon: FolderKanban, desc: "Projects, invoices & transactions", accent: "#7CC7FF", soft: "#E8F5FF" },
  { key: "members", href: "/members", label: "Members", icon: IdCard, desc: "Members, applications, funds & fees", accent: "#FF9ECF", soft: "#FFEBF5" },
  { key: "ledger", href: "/ledger", label: "General Ledger", icon: BookOpenText, desc: "Accounts, transactions & journals", accent: "#5CE0C6", soft: "#E4FBF6" },
  { key: "general", href: "/general", label: "General", icon: Landmark, desc: "Employees, payments, currencies & tables", accent: "#C9D36B", soft: "#F5F8DF" },
  { key: "timeclock", href: "/timeclock", label: "Time Clock", icon: Clock, desc: "Clocked-in staff & registrations", accent: "#FFC94D", soft: "#FFF5DC" },
  { key: "webhooks", href: "/webhooks", label: "Webhooks", icon: Webhook, desc: "Event subscriptions & delivery tests", accent: "#D48CFF", soft: "#F8ECFF" },
  { key: "tokens", href: "/tokens", label: "Tokens & Access", icon: KeyRound, desc: "API tokens, usage reports & invites", accent: "#FF8C7A", soft: "#FFECE8" },
];

/** Lookup by href prefix (e.g. "/customers" matches "/customers/123"). */
export function moduleFor(pathnameOrHref: string): ModuleDef | undefined {
  return MODULES.find((m) => pathnameOrHref.startsWith(m.href));
}
