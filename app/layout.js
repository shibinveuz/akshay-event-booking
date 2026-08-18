import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import "../public/assets/styles/ticket.css";
import "../public/assets/styles/style-new.css";
import Header from "./components/common/headers/Header";
import AuthenticatedHeader from "./components/common/headers/AuthenticatedHeader";
import UtmCapture from "./components/analytics/UtmCapture";
import Providers from "./providers";
import Footer from "./components/common/footers/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_USER_URL ||
  "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "GITEX Nigeria 2026",
    template: "%s | GITEX Nigeria 2026",
  },
  description: "Register for GITEX Nigeria 2026.",

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

  openGraph: {
    title: "GITEX Nigeria 2026",
    description: "Register for GITEX Nigeria 2026.",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "GITEX Nigeria 2026",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "GITEX Nigeria 2026",
    description: "Register for GITEX Nigeria 2026.",
    images: ["/favicon.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <Providers>
          <UtmCapture />
          <AuthenticatedHeader />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
