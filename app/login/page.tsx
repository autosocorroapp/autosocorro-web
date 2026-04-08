"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

type OnboardingVehicle = {
  kind: "carro" | "moto";
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
};

type PendingGoogleSignupData = {
  full_name: string;
  cpf: string;
  phone: string;
  onboarding_vehicles: OnboardingVehicle[];
};

async function syncVehiclesFromMetadata() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const metadataVehicles = (user.user_metadata?.onboarding_vehicles || []) as OnboardingVehicle[];

  if (!Array.isArray(metadataVehicles) || metadataVehicles.length === 0) return;

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
    .filter((vehicle) => !existingPlateSet.has(vehicle.plate.toUpperCase()))
    .map((vehicle) => ({
      user_id: user.id,
      kind: vehicle.kind,
      plate: vehicle.plate.toUpperCase(),
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
    }));

  if (vehiclesToInsert.length > 0) {
    const { error: insertError } = await supabase.from("vehicles").insert(vehiclesToInsert);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const rawPendingGoogleData = sessionStorage.getItem("autosocorro_pre_google_signup");

    if (!rawPendingGoogleData) return;

    const pendingGoogleData = rawPendingGoogleData;

    async function persistGoogleExtraData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const parsed = JSON.parse(pendingGoogleData) as PendingGoogleSignupData;

        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            full_name: parsed.full_name,
            cpf: parsed.cpf,
            phone: parsed.phone,
            onboarding_vehicles: parsed.onboarding_vehicles,
            user_type: "customer",
          },
        });

        await syncVehiclesFromMetadata();

        sessionStorage.removeItem("autosocorro_pre_google_signup");
      } catch {
        // silencioso para não travar a tela
      }
    }

    persistGoogleExtraData();
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErro("");

    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return;
    }

    if (!senha.trim()) {
      setErro("Informe sua senha.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        setErro(
          "Não foi possível entrar. Verifique e-mail, senha e se sua conta já foi confirmada por e-mail."
        );
        return;
      }

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

  async function handleGoogleLogin() {
    try {
      setErro("");
      setLoadingGoogle(true);

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
        "https://autosocorro.online";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${appUrl}/login`,
        },
      });

      if (error) {
        setErro("Não foi possível iniciar o login com Google.");
      }
    } catch {
      setErro("Erro inesperado ao iniciar o Google.");
    } finally {
      setLoadingGoogle(false);
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
            Entre com seu <strong>e-mail e senha</strong> ou use sua conta Google.
          </p>

          {erro ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {erro}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white text-base font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingGoogle ? "Abrindo Google..." : "Entrar com Google"}
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-sm text-zinc-400">ou</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-16 w-full rounded-2xl bg-red-600 text-lg font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar agora"}
            </button>
          </form>

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
