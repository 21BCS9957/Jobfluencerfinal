'use client';

import { Suspense } from "react";
import { RegisterWorkspace } from '@/components/auth/AuthWorkspace';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegisterWorkspace />
    </Suspense>
  );
}
