import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "VetJobs",
  description: "Gestione lavori veterinari (Next.js + Supabase)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <Navbar />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
