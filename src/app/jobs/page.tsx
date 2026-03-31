'use client';

import { Suspense } from "react";
import JobsPage from "@/legacy_pages/JobsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JobsPage />
    </Suspense>
  );
}
