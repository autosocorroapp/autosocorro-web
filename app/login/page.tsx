"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"phone" | "token">("phone");
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    try {
      setLoading(true);

      const cleaned = phone.trim();

      const { error } = await supabase.auth.signInWithOtp({
        phone: cleaned,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Código enviado.");
      setStep("token");
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
        phone: phone.trim(),
        token: token.trim(),
        type: "sms",
      });

      if (error) {
        alert(error.message);
        return;
      }

      window.location.href = "/cadastro";
    } catch {
      alert("Erro ao validar código.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Entrar com telefone</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Informe seu número para receber um código de acesso.
        </p>

        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none"
            placeholder="+55DDDNUMERO"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={step === "token"}
          />

          {step === "token" && (
            <input
              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none"
              placeholder="Código recebido"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          )}

          {step === "phone" ? (
            <button
              onClick={sendCode}
              disabled={loading}
              className="w-full rounded-3xl bg-red-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Receber código"}
            </button>
          ) : (
            <button
              onClick={verifyCode}
              disabled={loading}
              className="w-full rounded-3xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Validando..." : "Validar código"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
