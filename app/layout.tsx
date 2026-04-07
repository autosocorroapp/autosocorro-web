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
      <body className="bg-neutral-100 text-neutral-900">
        <main className="mx-auto min-h-screen max-w-md px-4 py-6">
          <header className="mb-6 flex justify-center border-b border-neutral-200 pb-4">
            <Logo />
          </header>

          {children}
        </main>
      </body>
    </html>
  );
}
