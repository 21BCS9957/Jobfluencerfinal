'use client';

import PremiumHero from "@/components/marketing/PremiumHero";
import BrandMarquee from "@/components/marketing/BrandMarquee";
import PersonaCards from "@/components/marketing/PersonaCards";
import FeaturedOpportunities from "@/components/marketing/FeaturedOpportunities";
import FeaturedInfluencer from "@/components/marketing/FeaturedInfluencer";
import WhyChooseUs from "@/components/marketing/WhyChooseUs";
import LandingSections from "@/components/marketing/LandingSections";
import PublicPageShell from "@/components/layouts/PublicPageShell";

export default function Home() {
  return (
    <PublicPageShell>
      <PremiumHero />
      <BrandMarquee />
      <PersonaCards />
      <FeaturedOpportunities />
      <FeaturedInfluencer />
      <WhyChooseUs />
      <LandingSections />
    </PublicPageShell>
  );
}
