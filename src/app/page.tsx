'use client';

import PremiumHero from "@/components/marketing/PremiumHero";
import LandingSections from "@/components/marketing/LandingSections";
import PublicPageShell from "@/components/layouts/PublicPageShell";

export default function Home() {
  return (
    <PublicPageShell>
      <PremiumHero />
      <LandingSections />
    </PublicPageShell>
  );
}
