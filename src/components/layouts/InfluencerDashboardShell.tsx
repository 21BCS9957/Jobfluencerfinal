'use client';

import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { DashboardHeader, BottomNav } from "@/legacy_pages/dashboard/shared";

export default function InfluencerDashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader user={user} role="influencer" />
      <main className="pt-16 pb-20 px-4 md:px-8 max-w-3xl mx-auto">{children}</main>
      <BottomNav role="influencer" />
    </div>
  );
}
