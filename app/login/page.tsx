"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Login realizado com sucesso.");
      window.location.href = "/";
    } catch {
      alert("Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Acesse sua conta no Auto Socorro.
        </p>

        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none"
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none"
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-3xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    </main>
  );
}
