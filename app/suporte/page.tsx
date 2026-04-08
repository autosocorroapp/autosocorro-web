import Link from "next/link";
import { Mail } from "lucide-react";

export default function SuportePage() {
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "suporte@autosocorro.online";

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[32px] bg-white px-6 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="mb-2 inline-flex rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-700">
            Suporte
          </div>

          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Mail className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <h1 className="text-center text-3xl font-extrabold text-zinc-900">
            Ainda precisa de ajuda?
          </h1>

          <p className="mt-4 text-center text-lg leading-7 text-zinc-600">
            Entre em contato conosco e nossa equipe vai te ajudar a recuperar o acesso.
          </p>

          <a
            href={`mailto:${supportEmail}`}
            className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-red-600 text-lg font-bold text-white transition hover:bg-red-700"
          >
            Enviar e-mail para suporte
          </a>

          <p className="mt-4 text-center text-sm text-zinc-500">
            {supportEmail}
          </p>

          <Link
            href="/login"
            className="mt-6 block text-center text-sm font-semibold text-red-600 transition hover:text-red-700"
          >
            Voltar para login
          </Link>
        </div>
      </div>
    </main>
  );
}
