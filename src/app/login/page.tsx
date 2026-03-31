'use client';

import { Suspense } from "react";
import { LoginPage } from "@/legacy_pages/AuthPages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
