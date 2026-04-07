"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CarFront } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPhoneBR, isValidBrazilPhone, toSupabasePhone } from "@/lib/phone";

function normalizeCpf(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function formatCpf(value: string) {
  const digits = normalizeCpf(value);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function isValidCpf(cpf: string) {
  return normalizeCpf(cpf).length === 11;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function CadastroPage() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"register" | "token">("register");
  const [loading, setLoading] = useState(false);

  const phoneIsValid = useMemo(() => isValidBrazilPhone(phone), [phone]);
  const emailIsValid = useMemo(() => isValidEmail(email), [email]);
  const cpfIsValid = useMemo(() => isValidCpf(cpf), [cpf]);

  async function sendCode() {
    if (!phoneIsValid || !emailIsValid || !cpfIsValid) return;

    try {
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedCpf = normalizeCpf(cpf);
      const supabasePhone = toSupabasePhone(phone);

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          data: {
            cpf: normalizedCpf,
            phone: supabasePhone,
            whatsapp: supabasePhone,
          },
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

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedCpf = normalizeCpf(cpf);
      const supabasePhone = toSupabasePhone(phone);

      const { error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: token.trim(),
        type: "email",
      });

      if (error) {
        alert(error.message);
        return;
      }

      const { data } = await supabase.auth.getUser();

      if (data.user) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          data: {
            cpf: normalizedCpf,
            phone: supabasePhone,
            whatsapp: supabasePhone,
          },
        });

        if (updateAuthError) {
          alert(updateAuthError.message);
          return;
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            phone: supabasePhone,
            whatsapp: supabasePhone,
            email: normalizedEmail,
            cpf: normalizedCpf,
          })
          .eq("id", data.user.id);

        if (profileError) {
          alert(profileError.message);
          return;
        }
      }

      window.location.href = "/veiculos";
    } catch {
      alert("Erro ao validar código.");
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
            Cadastre telefone, e-mail e CPF. A validação será feita por código no e-mail.
          </p>
        </div>

        <div className="p-6">
          {step === "register" && (
            <div className="space-y-4">
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

              <button
                onClick={sendCode}
                disabled={loading || !phoneIsValid || !emailIsValid || !cpfIsValid}
                className="w-full rounded-2xl bg-red-600 px-4 py-4 text-center font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Enviando..." : "Receber código por e-mail"}
              </button>

              <p className="text-center text-xs text-neutral-400">
                O e-mail será usado para autenticação enquanto o SMS não estiver disponível.
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
                className="w-full rounded-2xl bg-red-600 px-4 py-4 text-center font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Validando..." : "Continuar cadastro"}
              </button>

              <button
                onClick={() => {
                  setStep("register");
                  setToken("");
                }}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-center font-semibold text-neutral-900"
              >
                Alterar dados
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mt-5 rounded-[28px] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-red-50 p-3 text-red-600">
            <CarFront size={18} />
          </div>

          <div>
            <h2 className="font-semibold">Depois você cadastra seus veículos</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Carro, moto ou quantos veículos quiser para usar no Auto Socorro.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
