import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GameProvider } from "@/context";
import { Web3Provider } from "@/context/Web3Context";
import { FarcasterSDK } from "@/components/FarcasterSDK";
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
  title: "Cast Colony",
  description: "Multiplayer strategy game on Base chain",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#1a1a2e",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cast Colony",
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://cast-colony.vercel.app/api/og",
      button: {
        title: "Play Cast Colony",
        action: {
          type: "launch_miniapp",
          name: "Cast Colony",
          url: "https://cast-colony.vercel.app"
        }
      }
    })
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FarcasterSDK />
        <Web3Provider>
          <GameProvider>
            {children}
          </GameProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
