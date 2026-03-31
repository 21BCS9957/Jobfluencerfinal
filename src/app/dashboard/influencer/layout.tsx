'use client';

import { ReactNode } from "react";
import InfluencerDashboardShell from "@/components/layouts/InfluencerDashboardShell";

export default function Layout({ children }: { children: ReactNode }) {
  return <InfluencerDashboardShell>{children}</InfluencerDashboardShell>;
}
