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
  description: "Full-stack software engineer based out of NYC, exploring AI x life sciences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head>
        <script
          // This script is used to set the initial dark mode based on the user's preference or stored preference - prevents a flicker on page load
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const stored = localStorage.getItem("theme");
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                const isDark = stored ? stored === "dark" : prefersDark;
                if (isDark) {
                  document.documentElement.classList.add("dark");
                }

                // Disable transitions on initial load to prevent flicker
                document.documentElement.classList.add("no-transitions");
              })();
            `,
          }}
        />
      </head> */}
      <body
        className={`${anonymousPro.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
