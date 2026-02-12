import "./globals.css";
import Navbar from "@/components/Navbar";
import AdminThemeWrapper from "@/components/AdminThemeWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <AdminThemeWrapper>
          <Navbar />
          <main className="container">{children}</main>
        </AdminThemeWrapper>
      </body>
    </html>
  );
}
