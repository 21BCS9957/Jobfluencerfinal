'use client';

import { ReactNode } from "react";
import BrandDashboardShell from "@/components/layouts/BrandDashboardShell";

export default function Layout({ children }: { children: ReactNode }) {
  return <BrandDashboardShell>{children}</BrandDashboardShell>;
}
