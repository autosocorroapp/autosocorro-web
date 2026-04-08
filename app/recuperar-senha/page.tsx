"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://autosocorro.online";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${appUrl}/login`,
      });

      if (error) {
        setErro(error.message);
        return;
      }

      setSucesso("Enviamos as instruções de recuperação para o seu e-mail.");
      setEmail("");
    } catch {
      setErro("Erro inesperado ao solicitar recuperação de senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[32px] bg-white px-6 py-7 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="mb-2 inline-flex rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-700">
            Recuperação de acesso
          </div>

          <h1 className="text-3xl font-extrabold text-zinc-900">
            Esqueci minha senha
          </h1>

          <p className="mt-3 text-lg leading-7 text-zinc-600">
            Informe o e-mail da sua conta para receber o link de recuperação.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="h-16 w-full rounded-2xl border border-zinc-200 bg-white px-5 text-lg text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />

            {erro ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {erro}
              </div>
            ) : null}

            {sucesso ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {sucesso}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-16 w-full rounded-2xl bg-red-600 text-lg font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar recuperação"}
            </button>
          </form>

          <Link
            href="/login"
            className="mt-6 block text-center text-base font-semibold text-red-600 transition hover:text-red-700"
          >
            Voltar para login
          </Link>
        </div>
      </div>
    </main>
  );
}
