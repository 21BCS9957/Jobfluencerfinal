'use client';

import { Suspense } from "react";
import { RegisterPage } from "@/legacy_pages/AuthPages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegisterPage />
    </Suspense>
  );
}
