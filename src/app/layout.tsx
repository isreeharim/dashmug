import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { 
  title: { default: "tabletap | Digital menus", template: "%s | tabletap" }, 
  description: "Premium QR menus for restaurants." 
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { 
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  ); 
}
