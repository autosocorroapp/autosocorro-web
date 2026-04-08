"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  const onlyNumbers = onlyDigits(value).slice(0, 11);

  return onlyNumbers
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function isCpfLike(value: string) {
  const digits = onlyDigits(value);
  return digits.length >= 3 && !value.includes("@");
}

async function syncVehiclesFromMetadata() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const metadataVehicles = Array.isArray(user.user_metadata?.onboarding_vehicles)
    ? user.user_metadata.onboarding_vehicles
    : [];

  if (metadataVehicles.length === 0) return;

  const { data: existingVehicles, error: existingError } = await supabase
    .from("vehicles")
    .select("id, plate")
    .eq("user_id", user.id);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingPlateSet = new Set(
    (existingVehicles || []).map((vehicle) => String(vehicle.plate).toUpperCase())
  );

  const vehiclesToInsert = metadataVehicles
    .filter(
      (vehicle: { plate: string }) =>
        !existingPlateSet.has(String(vehicle.plate).toUpperCase())
    )
    .map(
      (vehicle: {
        kind: "carro" | "moto";
        plate: string;
        brand: string;
        model: string;
        year: number;
        color: string;
      }) => ({
        user_id: user.id,
        kind: vehicle.kind,
        plate: vehicle.plate.toUpperCase(),
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
      })
    );

  if (vehiclesToInsert.length > 0) {
    const { error: insertError } = await supabase.from("vehicles").insert(vehiclesToInsert);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }
}

async function syncProfileFromMetadata() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const cpf = String(user.user_metadata?.cpf || "").replace(/\D/g, "");
  const phone = String(user.user_metadata?.phone || "").replace(/\D/g, "");
  const fullName = String(user.user_metadata?.full_name || "");
  const email = String(user.email || "").toLowerCase();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      user_id: user.id,
      full_name: fullName || null,
      cpf: cpf || null,
      phone: phone || null,
      email: email || null,
      role: "customer",
      is_active: true,
    },
    {
      onConflict: "id",
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const cpfMode = isCpfLike(identifier);

  function handleIdentifierChange(value: string) {
    if (value.includes("@")) {
      setIdentifier(value);
      return;
    }

    if (/^\d/.test(value) || isCpfLike(value)) {
      setIdentifier(formatCpf(value));
      return;
    }

    setIdentifier(value);
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErro("");

    if (!identifier.trim()) {
      setErro("Informe seu e-mail ou CPF.");
      return;
    }

    if (!senha.trim()) {
      setErro("Informe sua senha.");
      return;
    }

    try {
      setLoading(true);

      let emailToLogin = identifier.trim().toLowerCase();

      if (!identifier.includes("@")) {
        const response = await fetch("/api/account/resolve-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ identifier }),
        });

        const result = await response.json();

        if (!response.ok || !result?.email) {
          setErro("Não foi possível localizar uma conta com este CPF.");
          return;
        }

        emailToLogin = String(result.email).toLowerCase();
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailToLogin,
        password: senha,
      });

      if (error) {
        setErro(
          "Não foi possível entrar. Verifique seus dados e se sua conta já foi confirmada por e-mail."
        );
        return;
      }

      await syncProfileFromMetadata();
      await syncVehiclesFromMetadata();

      router.push("/");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro inesperado ao fazer login. Tente novamente.";

      setErro(message);
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
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-700"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <div className="mb-4 inline-flex rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-700">
            Acesso
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-zinc-900">
            Entrar
          </h1>

          <p className="mt-3 text-lg leading-7 text-zinc-600">
            Entre com seu <strong>e-mail ou CPF</strong> e sua senha.
          </p>

          {erro ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {erro}
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input
              type="text"
              inputMode={cpfMode ? "numeric" : "email"}
              value={identifier}
              onChange={(e) => handleIdentifierChange(e.target.value)}
              placeholder={cpfMode ? "CPF" : "E-mail ou CPF"}
              className="h-16 w-full rounded-2xl border border-zinc-200 bg-white px-5 text-lg text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
              className="h-16 w-full rounded-2xl border border-zinc-200 bg-white px-5 text-lg text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-16 w-full rounded-2xl bg-red-600 text-lg font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar agora"}
            </button>
          </form>

          <div className="mt-5 space-y-2 text-center">
            <Link
              href="/recuperar-senha"
              className="block text-sm font-semibold text-red-600 transition hover:text-red-700"
            >
              Esqueci minha senha
            </Link>

            <Link
              href="/esqueci-email"
              className="block text-sm font-semibold text-red-600 transition hover:text-red-700"
            >
              Esqueci meu e-mail
            </Link>
          </div>

          <p className="mt-6 text-center text-base text-zinc-600">
            Não tem conta?{" "}
            <Link
              href="/cadastro"
              className="font-semibold text-red-600 transition hover:text-red-700"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
