'use client';

import LandingPage from "@/legacy_pages/LandingPage";
import PublicPageShell from "@/components/layouts/PublicPageShell";

export default function Home() {
  return (
    <PublicPageShell>
      <LandingPage />
    </PublicPageShell>
  );
}
