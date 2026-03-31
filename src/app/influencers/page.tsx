'use client';

import { Suspense } from "react";
import InfluencersPage from "@/legacy_pages/InfluencersPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <InfluencersPage />
    </Suspense>
  );
}
