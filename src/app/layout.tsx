import type { Metadata } from "next";
import { Anonymous_Pro } from "next/font/google";
import "./globals.css";

const anonymousPro = Anonymous_Pro({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-anonymous-pro",
});

export const metadata: Metadata = {
  title: "Phillip Yu",
  description: "Full-stack software engineer based out of NYC, exploring AI x healthcare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${anonymousPro.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
