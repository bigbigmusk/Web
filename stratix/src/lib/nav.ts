import {
  LayoutDashboard,
  FolderPlus,
  FlaskConical,
  Radar,
  ScanSearch,
  Users,
  PenLine,
  FileText,
  Rocket,
  FileBarChart,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group: "Workspace" | "Intelligence" | "Execution" | "Account";
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Workspace" },
  { label: "New Project", href: "/projects/new", icon: FolderPlus, group: "Workspace" },
  { label: "Product Lab", href: "/product-lab", icon: FlaskConical, group: "Intelligence" },
  { label: "Market Radar", href: "/market-radar", icon: Radar, group: "Intelligence" },
  { label: "Competitor X-Ray", href: "/competitor-xray", icon: ScanSearch, group: "Intelligence" },
  { label: "Lead Finder", href: "/lead-finder", icon: Users, group: "Execution" },
  { label: "Content Studio", href: "/content-studio", icon: PenLine, group: "Execution" },
  { label: "Proposal Builder", href: "/proposal-builder", icon: FileText, group: "Execution" },
  { label: "Growth Command", href: "/growth", icon: Rocket, group: "Execution" },
  { label: "Reports", href: "/reports", icon: FileBarChart, group: "Account" },
  { label: "Settings", href: "/settings", icon: Settings, group: "Account" },
];

export const NAV_GROUPS = ["Workspace", "Intelligence", "Execution", "Account"] as const;
