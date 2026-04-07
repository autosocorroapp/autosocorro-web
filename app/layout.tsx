import "./globals.css";
import Logo from "@/components/logo";

export const metadata = {
  title: "Auto Socorro",
  description: "Socorro automotivo rápido",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-neutral-100">

        <main className="mx-auto min-h-screen max-w-md px-4 py-6">

          {/* HEADER GLOBAL */}
          <header className="mb-6 flex justify-center">
            <Logo />
          </header>

          {children}

        </main>

      </body>
    </html>
  );
}
