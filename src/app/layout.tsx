import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import type { Viewport } from "next";
import Head from 'next/head';
import StoreProvider from "@/store/StoreProvider";
const lucy = localFont({
  src: "/fonts/lucy.ttf",
  variable: "--font-lucy",
});
export const viewport: Viewport = {
  themeColor: 'violet',
}
const rethink = localFont({
  src: [
    {
      path: "/fonts/RethinkSans-Regular.ttf",
    },
    {
      path: "/fonts/RethinkSans-Italic.ttf",
      style: "italic",
    },
    {
      path: "/fonts/RethinkSans-Bold.ttf",
      weight: "bold",
    },
    {
      path: "/fonts/RethinkSans-BoldItalic.ttf",
      weight: "bold",
      style: "italic",
    },
  ],
  variable: "--font-rethink",
});
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Muse",
  description: "Next Gen Social Media",
  icons: {
    icon: '',
  },
  // theme-color: "#4285f4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <Head>
        {/* Add the meta tag for theme-color */}
        <meta name="theme-color" content="#4285f4" />
      </Head>
      <html lang="en" className={`${lucy.variable} ${rethink.variable}`}>
        <body className={inter.className}>{children}</body>
      </html>
    </StoreProvider>
  );
}
