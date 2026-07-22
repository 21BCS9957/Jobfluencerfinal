'use client';

import { Suspense } from "react";
import BrandMessagesWorkspace from '@/components/dashboard/brand/BrandMessagesWorkspace';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BrandMessagesWorkspace workspaceRole="creator" />
    </Suspense>
  );
}
