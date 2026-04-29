'use client';

import HowJobfluencerWorks from "@/components/marketing/HowJobfluencerWorks";
import CreatorConstellation from "@/components/marketing/CreatorConstellation";
import BigTypographyFooter from "@/components/marketing/BigTypographyFooter";

export default function LandingSections() {
  return (
    <div className="bg-white text-black">
      <HowJobfluencerWorks />
      <CreatorConstellation />
      <BigTypographyFooter />
    </div>
  );
}
