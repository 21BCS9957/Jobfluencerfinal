'use client';

import { Suspense } from "react";
import MessagesPage from "@/legacy_pages/MessagesPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MessagesPage />
    </Suspense>
  );
}
