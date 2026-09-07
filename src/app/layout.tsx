import "@w-iris/react/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Mixi Config",
    template: "%s · Mixi Config",
  },
  description: "Manage service configuration across projects and environments.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-testid="auto-layout-1-html" lang="en">
      <body
        data-testid="auto-layout-2-body"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
