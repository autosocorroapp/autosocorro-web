import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CadastroConfirmadoPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[32px] bg-white px-6 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="mb-4 inline-flex rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
            Confirmação concluída
          </div>

          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
          </div>

          <h1 className="text-center text-3xl font-extrabold text-zinc-900">
            Cadastro validado com sucesso
          </h1>

          <p className="mt-4 text-center text-lg leading-7 text-zinc-600">
            Sua conta foi confirmada com sucesso.
            Agora você já pode entrar no sistema e continuar usando o Auto Socorro.
          </p>

          <Link
            href="/login"
            className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-red-600 text-lg font-bold text-white transition hover:bg-red-700"
          >
            Fazer login agora
          </Link>
        </div>
      </div>
    </main>
  );
}
