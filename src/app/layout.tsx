import type { Metadata } from "next";
import { Manrope, Roboto_Mono } from "next/font/google";
import "./globals.css";

// Sameer's Design System: Manrope for all interface text, Roboto Mono for code.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Figma Contributions",
  description: "A GitHub-style contribution graph for your Figma activity.",
};

// Runs before first paint: the saved theme, else the system setting. Avoids a flash of the wrong theme.
const themeScript = `var t;try{t=localStorage.getItem("theme")}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: themeScript sets data-theme on <html> before React hydrates.
    <html lang="en" className={`${manrope.variable} ${robotoMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
