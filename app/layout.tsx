import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Socorro",
  description: "Socorro automotivo rápido em Itaboraí"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
