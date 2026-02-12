import "./globals.css";
import Navbar from "@/components/Navbar";
import AdminThemeWrapper from "@/components/AdminThemeWrapper";
import RefreshOnLoad from "@/components/RefreshOnLoad";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <AdminThemeWrapper>
          <RefreshOnLoad />
          <Navbar />
          <main className="container">{children}</main>
        </AdminThemeWrapper>
      </body>
    </html>
  );
}
