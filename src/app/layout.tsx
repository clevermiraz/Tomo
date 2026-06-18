import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import ServiceWorker from "./service-worker";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tomo.lavlos.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Tomo",
  title: {
    default: "Tomo — Pomodoro Focus Timer",
    template: "%s · Tomo",
  },
  description:
    "Tomo is your focus friend — a simple, modern Pomodoro timer with focus sounds, quick naps, and breathwork to help you concentrate, beat procrastination, and get more done.",
  keywords: ["pomodoro", "focus timer", "productivity", "breathwork", "focus sounds", "study timer"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tomo",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Tomo",
    title: "Tomo — Pomodoro Focus Timer",
    description:
      "Your focus friend — a simple, modern Pomodoro timer with focus sounds, quick naps, and breathwork.",
    url: siteUrl,
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Tomo" }],
  },
  twitter: {
    card: "summary",
    title: "Tomo — Pomodoro Focus Timer",
    description: "Your focus friend — focus timer, quick naps, breathwork & focus sounds.",
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c11" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Set the theme before paint to avoid a flash of the wrong colors.
const themeScript = `(function(){try{var t=localStorage.getItem('tomo-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
