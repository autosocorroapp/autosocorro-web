"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type VehicleKind = "carro" | "moto";

type VehicleForm = {
  kind: VehicleKind;
  plate: string;
  brand: string;
  model: string;
  year: string;
  color: string;
};

const emptyVehicle = (): VehicleForm => ({
  kind: "carro",
  plate: "",
  brand: "",
  model: "",
  year: "",
  color: "",
});

function formatCpf(value: string) {
  const onlyNumbers = value.replace(/\D/g, "").slice(0, 11);

  return onlyNumbers
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatPhone(value: string) {
  const onlyNumbers = value.replace(/\D/g, "").slice(0, 11);

  if (onlyNumbers.length <= 10) {
    return onlyNumbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return onlyNumbers
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function normalizePlate(value: string) {
  return value.replace(/\s/g, "").toUpperCase();
}

export default function CadastroPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");

  const [vehicles, setVehicles] = useState<VehicleForm[]>([emptyVehicle()]);

  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingCpf, setCheckingCpf] = useState(false);
  const [cpfJaCadastrado, setCpfJaCadastrado] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://autosocorro.online";

  const progressLabel = useMemo(() => {
    if (step === 1) return "Etapa 1 de 3";
    if (step === 2) return "Etapa 2 de 3";
    return "Etapa 3 de 3";
  }, [step]);

  function updateVehicle(index: number, field: keyof VehicleForm, value: string) {
    setVehicles((prev) =>
      prev.map((vehicle, i) =>
        i === index
          ? {
              ...vehicle,
              [field]: field === "plate" ? normalizePlate(value) : value,
            }
          : vehicle
      )
    );
  }

  function addVehicle() {
    setVehicles((prev) => [...prev, emptyVehicle()]);
  }

  function removeVehicle(index: number) {
    setVehicles((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  function validateStep1() {
    const cpfLimpo = cpf.replace(/\D/g, "");

    if (!nomeCompleto.trim()) {
      setErro("Informe seu nome completo.");
      return false;
    }

    if (!cpfLimpo) {
      setErro("Informe seu CPF.");
      return false;
    }

    if (cpfLimpo.length !== 11) {
      setErro("O CPF deve ter 11 números.");
      return false;
    }

    return true;
  }

  async function checkCpfAlreadyExists() {
    const cpfLimpo = cpf.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) return false;

    try {
      setCheckingCpf(true);

      const response = await fetch("/api/account/check-cpf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpf: cpfLimpo }),
      });

      const result = await response.json();

      return !!result?.exists;
    } catch {
      return false;
    } finally {
      setCheckingCpf(false);
    }
  }

  function validateStep2() {
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];

      if (!vehicle.plate.trim()) {
        setErro(`Informe a placa do veículo ${i + 1}.`);
        return false;
      }

      if (!vehicle.brand.trim()) {
        setErro(`Informe a marca do veículo ${i + 1}.`);
        return false;
      }

      if (!vehicle.model.trim()) {
        setErro(`Informe o modelo do veículo ${i + 1}.`);
        return false;
      }

      if (!vehicle.year.trim()) {
        setErro(`Informe o ano do veículo ${i + 1}.`);
        return false;
      }

      if (!vehicle.color.trim()) {
        setErro(`Informe a cor do veículo ${i + 1}.`);
        return false;
      }
    }

    return true;
  }

  function validateStep3() {
    const phoneClean = telefone.replace(/\D/g, "");

    if (!phoneClean) {
      setErro("Informe seu telefone.");
      return false;
    }

    if (phoneClean.length < 10) {
      setErro("Informe um telefone válido.");
      return false;
    }

    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return false;
    }

    if (!senha.trim()) {
      setErro("Informe sua senha.");
      return false;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return false;
    }

    return true;
  }

  async function handleNext() {
    setErro("");
    setCpfJaCadastrado(false);

    if (step === 1) {
      if (!validateStep1()) return;

      const cpfExists = await checkCpfAlreadyExists();

      if (cpfExists) {
        setCpfJaCadastrado(true);
        setErro("Já existe uma conta cadastrada com este CPF.");
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (!validateStep2()) return;
      setStep(3);
    }
  }

  function handleBack() {
    setErro("");
    setCpfJaCadastrado(false);

    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(2);
      return;
    }

    router.back();
  }

  async function handleCadastro(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (!validateStep3()) return;

    const cpfLimpo = cpf.replace(/\D/g, "");
    const telefoneLimpo = telefone.replace(/\D/g, "");

    const normalizedVehicles = vehicles.map((vehicle) => ({
      kind: vehicle.kind,
      plate: normalizePlate(vehicle.plate),
      brand: vehicle.brand.trim(),
      model: vehicle.model.trim(),
      year: Number(vehicle.year),
      color: vehicle.color.trim(),
    }));

    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            full_name: nomeCompleto.trim(),
            cpf: cpfLimpo,
            phone: telefoneLimpo,
            onboarding_vehicles: normalizedVehicles,
            user_type: "customer",
          },
          emailRedirectTo: `${appUrl}/auth/confirmado`,
        },
      });

      if (error) {
        setErro(error.message);
        return;
      }

      setSucesso(
        "Cadastro realizado com sucesso. Enviamos um e-mail para confirmação da sua conta."
      );

      setNomeCompleto("");
      setCpf("");
      setVehicles([emptyVehicle()]);
      setTelefone("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");
      setStep(1);
      setCpfJaCadastrado(false);
    } catch {
      setErro("Erro inesperado ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[32px] bg-white px-6 py-7 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-700"
          >
            <ArrowLeft size={18} />
            {step === 1 ? "Voltar" : "Etapa anterior"}
          </button>

          <div className="mb-2 inline-flex rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-700">
            Usuário
          </div>

          <p className="mb-2 text-sm font-medium text-zinc-500">{progressLabel}</p>

          <h1 className="text-4xl font-extrabold leading-tight text-zinc-900">
            Criar conta
          </h1>

          <p className="mt-3 text-lg leading-7 text-zinc-600">
            Preencha seus dados, cadastre seu veículo e finalize seu acesso.
          </p>

          {erro ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {erro}
            </div>
          ) : null}

          {sucesso ? (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {sucesso}
            </div>
          ) : null}

          {cpfJaCadastrado && step === 1 ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-sm font-semibold text-amber-800">
                Já existe uma conta com este CPF.
              </p>

              <div className="mt-4 space-y-3">
                <Link
                  href="/login"
                  className="flex h-12 w-full items-center justify-center rounded-2xl bg-red-600 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Ir para login
                </Link>

                <Link
                  href="/recuperar-senha"
                  className="flex h-12 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  Esqueci minha senha
                </Link>

                <Link
                  href="/esqueci-email"
                  className="flex h-12 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  Esqueci meu e-mail
                </Link>
              </div>
            </div>
          ) : null}

          {step === 1 && (
            <div className="mt-8 space-y-4">
              <input
                type="text"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                placeholder="Nome completo"
                className="h-16 w-full rounded-2xl border border-zinc-200 bg-white px-5 text-lg text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />

              <input
                type="text"
                inputMode="numeric"
                value={cpf}
                onChange={(e) => {
                  setCpf(formatCpf(e.target.value));
                  setCpfJaCadastrado(false);
                }}
                placeholder="CPF"
                className="h-16 w-full rounded-2xl border border-zinc-200 bg-white px-5 text-lg text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />

              <button
                type="button"
                onClick={handleNext}
                disabled={checkingCpf}
                className="mt-2 h-16 w-full rounded-2xl bg-red-600 text-lg font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkingCpf ? "Verificando CPF..." : "Avançar"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-8 space-y-6">
              {vehicles.map((vehicle, index) => (
                <div key={index} className="rounded-3xl border border-zinc-200 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-900">
                      Veículo {index + 1}
                    </h2>

                    {vehicles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVehicle(index)}
                        className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateVehicle(index, "kind", "carro")}
                      className={`h-14 rounded-2xl border text-base font-semibold transition ${
                        vehicle.kind === "carro"
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      Carro
                    </button>

                    <button
                      type="button"
                      onClick={() => updateVehicle(index, "kind", "moto")}
                      className={`h-14 rounded-2xl border text-base font-semibold transition ${
                        vehicle.kind === "moto"
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      Moto
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      value={vehicle.plate}
                      onChange={(e) => updateVehicle(index, "plate", e.target.value)}
                      placeholder="Placa"
                      className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />

                    <input
                      type="text"
                      value={vehicle.brand}
                      onChange={(e) => updateVehicle(index, "brand", e.target.value)}
                      placeholder="Marca"
                      className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />

                    <input
                      type="text"
                      value={vehicle.model}
                      onChange={(e) => updateVehicle(index, "model", e.target.value)}
                      placeholder="Modelo"
                      className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />

                    <input
                      type="number"
                      value={vehicle.year}
                      onChange={(e) => updateVehicle(index, "year", e.target.value)}
                      placeholder="Ano"
                      className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />

                    <input
                      type="text"
                      value={vehicle.color}
                      onChange={(e) => updateVehicle(index, "color", e.target.value)}
                      placeholder="Cor"
                      className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addVehicle}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 text-base font-semibold text-red-700 transition hover:bg-red-100"
              >
                <Plus size={18} />
                Adicionar outro veículo
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="h-16 w-full rounded-2xl bg-red-600 text-lg font-bold text-white transition hover:bg-red-700"
              >
                Avançar
              </button>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleCadastro} className="mt-8 space-y-4">
              <input
                type="text"
                inputMode="numeric"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                placeholder="Telefone"
                className="h-16 w-full rounded-2xl border border-zinc-200 bg-white px-5 text-lg text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="h-16 w-full rounded-2xl border border-zinc-200 bg-white px-5 text-lg text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />

              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
                className="h-16 w-full rounded-2xl border border-zinc-200 bg-white px-5 text-lg text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />

              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Confirmar senha"
                className="h-16 w-full rounded-2xl border border-zinc-200 bg-white px-5 text-lg text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />

              <button
                type="submit"
                disabled={loading}
                className="h-16 w-full rounded-2xl bg-red-600 text-lg font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Finalizando cadastro..." : "Finalizar cadastro"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-base text-zinc-600">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-red-600 transition hover:text-red-700"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
