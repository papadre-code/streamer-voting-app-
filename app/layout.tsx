import type { Metadata } from "next";
import "./globals.css";
import { Cinzel, Roboto } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-heading" });
const roboto = Roboto({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "700"], variable: "--font-body" });

const appName = "Streamer Voting";

export const metadata: Metadata = {
  title: appName,
  description: appName,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={cn("font-body", cinzel.variable, roboto.variable)}>
      <body className="antialiased min-h-screen bg-background flex flex-col">
        <main className="flex-1">{children}</main>
        <footer className="border-t border-amber-900/30">
          <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {appName}
          </div>
        </footer>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
