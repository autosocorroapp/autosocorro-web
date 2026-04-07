"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CarFront } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPhoneBR, isValidBrazilPhone, toSupabasePhone } from "@/lib/phone";
import { formatCpf, isValidCpf, normalizeCpf } from "@/lib/cpf";
import { isValidEmail, normalizeEmail } from "@/lib/email";

export default function CadastroPage() {
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

  async function handleRegister() {
    if (!fullName.trim() || !phoneIsValid || !emailIsValid || !cpfIsValid || !passwordMatches) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    try {
      setLoading(true);

      const normalizedPhone = toSupabasePhone(phone);
      const normalizedCpf = normalizeCpf(cpf);
      const normalizedEmail = normalizeEmail(email);

      const { data: phoneExists, error: phoneError } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", normalizedPhone)
        .limit(1);

      if (phoneError) {
        alert(phoneError.message);
        return;
      }

      if (phoneExists && phoneExists.length > 0) {
        alert("Telefone já cadastrado.");
        return;
      }

      const { data: cpfExists, error: cpfError } = await supabase
        .from("profiles")
        .select("id")
        .eq("cpf", normalizedCpf)
        .limit(1);

      if (cpfError) {
        alert(cpfError.message);
        return;
      }

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
            user_type: "driver",
          },
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (!data.user) {
        alert("Não foi possível criar usuário.");
        return;
      }

      alert("Conta criada! Verifique seu e-mail para ativar o acesso.");
      window.location.href = "/login";
    } catch {
      alert("Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-[28px] bg-white shadow-sm">
        <div className="bg-red-600 p-6 text-white">
          <a
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/90"
          >
            <ArrowLeft size={16} />
            Voltar
          </a>

          <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            Primeiro acesso
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight">Crie sua conta</h1>

          <p className="mt-2 text-sm text-white/85">
            Cadastro com e-mail e senha, com confirmação obrigatória por e-mail.
          </p>
        </div>

        <div className="space-y-4 p-6">
          <input
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-base outline-none"
            placeholder="Nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-700">CPF</span>
            <input
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-base outline-none"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              inputMode="numeric"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-700">Telefone</span>
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
              <span className="text-xl">🇧🇷</span>
              <span className="text-sm font-medium text-neutral-500">+55</span>
              <input
                className="w-full bg-transparent text-base outline-none"
                placeholder="(21) 9 9999-9999"
                value={phone}
                onChange={(e) => setPhone(formatPhoneBR(e.target.value))}
                inputMode="numeric"
              />
            </div>
          </label>

          <input
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-base outline-none"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
          />

          <input
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-base outline-none"
            placeholder="Senha (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />

          <input
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-base outline-none"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
          />

          <button
            onClick={handleRegister}
            disabled={
              loading ||
              !fullName.trim() ||
              !phoneIsValid ||
              !emailIsValid ||
              !cpfIsValid ||
              !passwordMatches
            }
            className="w-full rounded-2xl bg-red-600 px-4 py-4 text-center font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-[28px] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-red-50 p-3 text-red-600">
            <CarFront size={18} />
          </div>

          <div>
            <h2 className="font-semibold">Confirmação obrigatória por e-mail</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Após criar a conta, confirme no e-mail para liberar o login.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
