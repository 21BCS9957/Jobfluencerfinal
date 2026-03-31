import type { Metadata } from "next";
import "../index.css";
import "../App.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Jobfluencer",
  description: "Jobfluencer Next.js frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
