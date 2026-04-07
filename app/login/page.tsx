"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isValidEmail, normalizeEmail } from "@/lib/email";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const emailIsValid = useMemo(() => isValidEmail(email), [email]);

  async function handleLogin() {
    if (!emailIsValid || password.length < 6) return;

    try {
      setLoading(true);

      const normalizedEmail = normalizeEmail(email);

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        alert("Usuário não encontrado.");
        return;
      }

      const metadata = user.user_metadata || {};

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: metadata.full_name || null,
          cpf: metadata.cpf || null,
          phone: metadata.phone || null,
          whatsapp: metadata.whatsapp || metadata.phone || null,
          email: user.email || normalizedEmail,
          user_type: "driver",
        },
        { onConflict: "id" },
      );

      if (profileError) {
        alert(profileError.message);
        return;
      }

      const { count, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", user.id);

      if (vehiclesError) {
        alert(vehiclesError.message);
        return;
      }

      window.location.href = count && count > 0 ? "/" : "/veiculos";
    } catch {
      alert("Erro ao fazer login.");
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

          <p className="mt-2 text-sm text-neutral-500">Login principal com e-mail e senha.</p>
        </div>

        <div className="space-y-4">
          <input
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-base outline-none"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
          />

          <input
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-base outline-none"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />

          <button
            onClick={handleLogin}
            disabled={loading || !emailIsValid || password.length < 6}
            className="w-full rounded-2xl bg-black px-4 py-4 text-center font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-[28px] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-green-50 p-3 text-green-700">
            <ShieldCheck size={18} />
          </div>

          <div>
            <h2 className="font-semibold">Sem OTP / magic link</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Fluxo principal de autenticação feito com senha.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
