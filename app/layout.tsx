import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://ledvision.local"),
  title: {
    default: "LEDVision — светодиодные экраны под задачу бизнеса",
    template: "%s | LEDVision",
  },
  description:
    "Производство, поставка и монтаж светодиодных экранов: уличные, интерьерные, для аренды и ритейла. Подбор, проект, запуск и сервис.",
  keywords: [
    "светодиодные экраны",
    "LED экран",
    "медиафасад",
    "видеостена",
    "экраны для рекламы",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
