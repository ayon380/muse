import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import type { Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";
import { StrictMode } from "react";
// import { SpeedInsights } from '@vercel/speed-insights/next';

const APP_NAME = "Muse";
const APP_DEFAULT_TITLE = "Muse";
const APP_TITLE_TEMPLATE = "%s - Muse";
const APP_DESCRIPTION = "Join our vibrant social media community where you can connect with friends, share moments, and discover new interests. Our platform offers seamless communication, engaging content sharing features, and a supportive environment for building meaningful connections. Whether you're sharing photos, videos, or thoughts, our app provides the perfect space to express yourself and connect with like-minded individuals. Experience the power of social networking redefined with our intuitive interface and robust features. Join us today and be part of something special! ";

export const metadata: Metadata = {
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    // Primary Keywords
    "Social media platform",
    "Muse app",
    "Social networking",
    "Connect with friends",
    "Share moments",
    "Discover interests",
    // Secondary Keywords
    "Online community",
    "Engaging content sharing",
    "Building meaningful connections",
    "Express yourself",
    "Like-minded individuals",
    "Vibrant community",
    "Photo sharing",
    "Video sharing",
    "Thought sharing",
    // Branded Keywords
    "Muse social",
    "Muse community",
    "Muse networking",
    "Muse connect",
    "Muse moments",
    // Feature-specific Keywords
    "Instant messaging",
    "Content discovery",
    "Privacy settings",
    "Profile customization",
    "Group chats",
    "Event planning",
    "Trending topics",
    "Content moderation",
    // User Experience Keywords
    "Intuitive interface",
    "User-friendly design",
    "Seamless navigation",
    "Responsive layout",
    "Personalized feeds",
    "Notification system",
    // Target Audience Keywords
    "Millennials",
    "Gen Z",
    "Social influencers",
    "Content creators",
    "Community builders",
    "Digital nomads",
    "Creative professionals",
    "Hobby enthusiasts",
    // Localized Keywords
    "Muse app india",
    "Indian social media",
    "Kolkata networking",
    "Local events on Muse",
    "Connect with Worldwide community",
    // Long-tail Keywords
    "Share travel experiences with friends",
    "Connect with fellow photographers",
    "Discover new music interests",
    "Plan group outings easily",
    "Find inspiration for art projects"
  ],

  authors: [{ name: 'Ayon' }, { name: 'Ayon', url: 'https://github.com/ayon380' }],
  creator: 'Ayon Sarkar',
  publisher: 'Ayon Sarkar',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  applicationName: APP_NAME,
  metadataBase: new URL("https://muse-mauve.vercel.app/"),
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },

  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

const lucy = localFont({
  src: "/fonts/Pacifico-Regular.ttf",
  variable: "--font-lucy",
});
export const viewport: Viewport = {
  themeColor: "violet",
};
const rethink = localFont({
  src: [
    {
      path: "/fonts/Product Sans Regular.ttf",
    },
    {
      path: "/fonts/Product Sans Italic.ttf",
      style: "italic",
    },
    {
      path: "/fonts/Product Sans Bold.ttf",
      weight: "bold",
    },
    {
      path: "/fonts/Product Sans Bold Italic.ttf",
      weight: "bold",
      style: "italic",
    },
  ],
  variable: "--font-rethink",
});
const inter = Inter({ subsets: ["latin"] });



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <html lang="en" className={`${lucy.variable} ${rethink.variable}`}>
      <StrictMode>
        <body className={inter.className}>
          {children}
          <Analytics />
          {/* <SpeedInsights /> */}
        </body>
      </StrictMode>
    </html>

  );
}
