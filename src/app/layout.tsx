import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

const mplusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-rounded",
});

export const metadata: Metadata = {
  title: "LifePlan Canvas",
  description: "新社会人のための人生攻略シミュレーター",
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${mplusRounded.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-rounded)]">
        {children}
      </body>
    </html>
  );
}
