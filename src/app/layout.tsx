import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://admin.ngamia.cc"),
  title: {
    default: "Ngamia Admin — Platform Operations",
    template: "%s | Ngamia Admin",
  },
  description: "Securely manage Ngamia users, payments, models, analytics, and platform operations.",
  applicationName: "Ngamia Admin",
  icons: {
    icon: [
      { url: "/logo-512.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/logo-512.png",
    apple: [{ url: "/logo-512.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_TZ",
    url: "https://admin.ngamia.cc",
    siteName: "Ngamia Admin",
    title: "Ngamia Admin — Platform Operations",
    description: "Securely manage Ngamia users, payments, models, analytics, and platform operations.",
    images: [{ url: "/logo-512.png", width: 512, height: 512, alt: "Ngamia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ngamia Admin — Platform Operations",
    description: "Securely manage Ngamia users, payments, models, analytics, and platform operations.",
    images: [{ url: "/logo-512.png", alt: "Ngamia" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
