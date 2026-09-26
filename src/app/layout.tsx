import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import Logo from "@/components/Logo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flair Auto : vérifiez une annonce de voiture d'occasion avant de vous déplacer",
  description:
    "Envoyez les captures d'écran d'une annonce de voiture d'occasion : Flair Auto repère les signaux d'alerte, estime le prix du marché et vous dit quoi vérifier avant d'acheter.",
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-encre">
              <Logo />
              <span className="text-lg tracking-tight">Flair Auto</span>
            </Link>
            <Link href="/exemple" className="text-sm font-medium text-marque hover:underline">
              Exemple de rapport
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-slate-500">
            <p>
              Flair Auto est une aide à la décision : le rapport signale des points à vérifier, il
              ne constitue pas une garantie.
            </p>
            <p className="mt-2">© {new Date().getFullYear()} Flair Auto</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
