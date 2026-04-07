"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"email" | "token">("email");
  const [loading, setLoading] = useState(false);

  const emailIsValid = useMemo(() => isValidEmail(email), [email]);

  async function sendCode() {
    if (!emailIsValid) return;

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      setStep("token");
      alert("Código enviado para o e-mail.");
    } catch {
      alert("Erro ao enviar código.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    try {
      setLoading(true);

      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: "email",
      });

      if (error) {
        alert(error.message);
        return;
      }

      window.location.href = "/";
    } catch {
      alert("Erro ao validar código.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="rounded-[28px] bg-white p-6 shadow-sm">
        <a
          href="/"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-neutral-500"
        >
          <ArrowLeft size={16} />
          Voltar
        </a>

        <div className="mb-5">
          <div className="inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
            Entrar
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight">Acesse sua conta</h1>

          <p className="mt-2 text-sm text-neutral-500">
            Entre com seu e-mail para continuar no Auto Socorro.
          </p>
        </div>

        {step === "email" && (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-700">E-mail</span>

              <input
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-base outline-none"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
              />
            </label>

            <button
              onClick={sendCode}
              disabled={loading || !emailIsValid}
              className="w-full rounded-2xl bg-black px-4 py-4 text-center font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Enviando..." : "Receber código"}
            </button>

            <p className="text-center text-xs text-neutral-400">
              Vamos enviar um código de acesso para seu e-mail.
            </p>
          </div>
        )}

        {step === "token" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
              Código enviado para <span className="font-semibold">{email}</span>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-700">
                Código de verificação
              </span>

              <input
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-base outline-none"
                placeholder="Digite o código"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                inputMode="numeric"
              />
            </label>

            <button
              onClick={verifyCode}
              disabled={loading || token.trim().length < 4}
              className="w-full rounded-2xl bg-black px-4 py-4 text-center font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Validando..." : "Entrar"}
            </button>

            <button
              onClick={() => {
                setStep("email");
                setToken("");
              }}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-center font-semibold text-neutral-900"
            >
              Alterar e-mail
            </button>
          </div>
        )}
      </section>

      <section className="mt-5 rounded-[28px] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-green-50 p-3 text-green-700">
            <ShieldCheck size={18} />
          </div>

          <div>
            <h2 className="font-semibold">Acesso rápido e seguro</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Você entra usando código por e-mail, sem precisar decorar senha.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
