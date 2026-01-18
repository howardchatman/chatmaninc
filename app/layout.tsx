import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Chatman Inc | AI Business Architecture",
  description: "We partner with founders and executives to build intelligent systems that reduce friction and accelerate decision-making.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased bg-dark text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
