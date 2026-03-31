'use client';

import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function PublicPageShell({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}
