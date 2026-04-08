"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

function formatCpf(value: string) {
  const onlyNumbers = value.replace(/\D/g, "").slice(0, 11);

  return onlyNumbers
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export default function EsqueciEmailPage() {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [emailHint, setEmailHint] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErro("");
    setEmailHint("");

    const cpfLimpo = cpf.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      setErro("Informe um CPF válido.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/account/hint-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpf: cpfLimpo }),
      });

      const result = await response.json();

      if (!response.ok || !result?.emailHint) {
        setErro(result?.message || "Não foi possível localizar sua conta.");
        return;
      }

      setEmailHint(result.emailHint);
    } catch {
      setErro("Erro inesperado ao localizar o e-mail.");
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
            Esqueci meu e-mail
          </h1>

          <p className="mt-3 text-lg leading-7 text-zinc-600">
            Informe seu CPF para localizar sua conta com segurança.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="text"
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="CPF"
              className="h-16 w-full rounded-2xl border border-zinc-200 bg-white px-5 text-lg text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />

            {erro ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {erro}
              </div>
            ) : null}

            {emailHint ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
                <p className="font-semibold">Encontramos uma conta com este CPF.</p>
                <p className="mt-2">
                  O e-mail cadastrado é parecido com:
                  <span className="ml-1 font-bold">{emailHint}</span>
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-16 w-full rounded-2xl bg-red-600 text-lg font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Localizando..." : "Localizar meu e-mail"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            <Link
              href="/login"
              className="block text-sm font-semibold text-red-600 transition hover:text-red-700"
            >
              Voltar para login
            </Link>

            <Link
              href="/suporte"
              className="block text-sm font-semibold text-red-600 transition hover:text-red-700"
            >
              Ainda precisa de ajuda?
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
