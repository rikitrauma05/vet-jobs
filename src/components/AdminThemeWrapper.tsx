"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AdminThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;

    if (pathname.startsWith("/admin")) {
      body.classList.add("admin-mode");
    } else {
      body.classList.remove("admin-mode");
    }

    return () => {
      body.classList.remove("admin-mode");
    };
  }, [pathname]);

  return <>{children}</>;
}
