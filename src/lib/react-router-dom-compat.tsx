'use client';

import { useCallback, useEffect, type ReactNode } from "react";
import NextLink from "next/link";
import {
  usePathname,
  useRouter,
  useParams as useNextParams,
} from "next/navigation";

type To = string;

export function BrowserRouter({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Routes({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Route() {
  return null;
}

export function Outlet() {
  return null;
}

export function Link({
  to,
  children,
  ...props
}: {
  to: string;
  children: ReactNode;
  [key: string]: unknown;
}) {
  return (
    <NextLink href={to} {...(props as Record<string, never>)}>
      {children}
    </NextLink>
  );
}

export function Navigate({ to, replace }: { to: To; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}

export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (to: To | number, options?: { replace?: boolean }) => {
      if (typeof to === "number") {
        if (to < 0) router.back();
        return;
      }
      if (options?.replace) router.replace(to);
      else router.push(to);
    },
    [router]
  );
}

export function useLocation() {
  const pathname = usePathname();
  const search =
    typeof window !== "undefined" && window.location.search
      ? window.location.search
      : "";
  return { pathname, search, hash: "", state: null, key: "next" };
}

export function useParams<T extends Record<string, string | string[]>>() {
  return useNextParams() as T;
}

export function useSearchParams(): [
  URLSearchParams,
  (next: Record<string, string> | URLSearchParams) => void
] {
  const router = useRouter();
  const pathname = usePathname();
  const current = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );

  const setSearchParams = useCallback(
    (next: Record<string, string> | URLSearchParams) => {
      const params =
        next instanceof URLSearchParams
          ? next
          : new URLSearchParams(Object.entries(next));
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname]
  );

  return [current, setSearchParams];
}
