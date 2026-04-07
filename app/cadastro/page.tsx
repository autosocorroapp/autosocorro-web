"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CadastroPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    try {
      setLoading(true);

      if (!fullName || !email || !password) {
        alert("Preencha nome, e-mail e senha.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const user = data.user;

      if (!user) {
        alert("Conta criada. Verifique seu e-mail para confirmação.");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        user_type: "customer",
        full_name: fullName,
        phone: phone || null,
        whatsapp: phone || null,
      });

      if (profileError) {
        alert(profileError.message);
        return;
      }

      alert("Conta criada com sucesso.");
      setFullName("");
      setPhone("");
      setEmail("");
      setPassword("");
    } catch (err) {
      alert("Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Cadastre-se para solicitar socorro automotivo.
        </p>

        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none"
            placeholder="Nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none"
            placeholder="Telefone / WhatsApp"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

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
            onClick={handleRegister}
            disabled={loading}
            className="w-full rounded-3xl bg-red-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </div>
      </div>
    </main>
  );
}
