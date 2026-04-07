"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPhoneBR, isValidBrazilPhone, toSupabasePhone } from "@/lib/phone";
import { formatCpf, isValidCpf, normalizeCpf } from "@/lib/cpf";
import { isValidEmail, normalizeEmail } from "@/lib/email";

export default function CadastroPrestadorPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const phoneIsValid = useMemo(() => isValidBrazilPhone(phone), [phone]);
  const emailIsValid = useMemo(() => isValidEmail(email), [email]);
  const cpfIsValid = useMemo(() => isValidCpf(cpf), [cpf]);
  const passwordMatches = useMemo(
    () => password.length >= 6 && password === confirmPassword,
    [password, confirmPassword],
  );

  async function handleRegisterProvider() {
    if (!fullName.trim() || !phoneIsValid || !emailIsValid || !cpfIsValid || !passwordMatches) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    try {
      setLoading(true);

      const normalizedPhone = toSupabasePhone(phone);
      const normalizedCpf = normalizeCpf(cpf);
      const normalizedEmail = normalizeEmail(email);

      const { data: phoneExists } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", normalizedPhone)
        .limit(1);

      if (phoneExists && phoneExists.length > 0) {
        alert("Telefone já cadastrado.");
        return;
      }

      const { data: cpfExists } = await supabase
        .from("profiles")
        .select("id")
        .eq("cpf", normalizedCpf)
        .limit(1);

      if (cpfExists && cpfExists.length > 0) {
        alert("CPF já cadastrado.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            cpf: normalizedCpf,
            phone: normalizedPhone,
            whatsapp: normalizedPhone,
            email: normalizedEmail,
            user_type: "provider",
            provider_status: "pending",
          },
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (!data.user) {
        alert("Não foi possível criar conta de prestador.");
        return;
      }

      alert("Cadastro enviado! Confirme o e-mail. Após isso, sua aprovação será manual.");
      window.location.href = "/login";
    } catch {
      alert("Erro ao criar cadastro de prestador.");
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
          <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Prestador
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight">Cadastro de prestador</h1>

          <p className="mt-2 text-sm text-neutral-500">
            Sua conta será criada com status <strong>pending</strong> e aprovação manual da equipe.
          </p>
        </div>

        <div className="space-y-4">
          <input className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none" placeholder="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none" placeholder="CPF" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} inputMode="numeric" />
          <input className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none" placeholder="Telefone" value={phone} onChange={(e) => setPhone(formatPhoneBR(e.target.value))} inputMode="numeric" />
          <input className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" />
          <input className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          <input className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none" placeholder="Confirmar senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" />

          <button
            onClick={handleRegisterProvider}
            disabled={loading || !fullName.trim() || !phoneIsValid || !emailIsValid || !cpfIsValid || !passwordMatches}
            className="w-full rounded-2xl bg-amber-600 px-4 py-4 text-center font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Enviando..." : "Cadastrar como prestador"}
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-[28px] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
            <ShieldAlert size={18} />
          </div>
          <p className="text-sm text-neutral-600">
            Após o envio, a equipe valida seus dados e libera o acesso para atendimentos.
          </p>
        </div>
      </section>
    </>
  );
}
