"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type VehicleKind = "carro" | "moto";

type Vehicle = {
  id: string;
  kind: VehicleKind;
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  color: string | null;
};

export default function VeiculosPage() {
  const [kind, setKind] = useState<VehicleKind>("carro");
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function loadVehicles() {
    try {
      setLoadingList(true);
      setErro("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErro("Usuário não autenticado.");
        return;
      }

      const { data, error } = await supabase
        .from("vehicles")
        .select("id, kind, plate, brand, model, year, color")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErro(error.message);
        return;
      }

      setVehicles((data as Vehicle[]) || []);
    } catch {
      setErro("Erro ao carregar veículos.");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (!plate.trim()) {
      setErro("Informe a placa.");
      return;
    }

    if (!brand.trim()) {
      setErro("Informe a marca.");
      return;
    }

    if (!model.trim()) {
      setErro("Informe o modelo.");
      return;
    }

    if (!year.trim()) {
      setErro("Informe o ano.");
      return;
    }

    if (!color.trim()) {
      setErro("Informe a cor.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErro("Usuário não autenticado.");
        return;
      }

      const { error } = await supabase.from("vehicles").insert([
        {
          user_id: user.id,
          kind,
          plate: plate.trim().toUpperCase(),
          brand: brand.trim(),
          model: model.trim(),
          year: Number(year),
          color: color.trim(),
        },
      ]);

      if (error) {
        setErro(error.message);
        return;
      }

      setSucesso("Veículo cadastrado com sucesso.");
      setKind("carro");
      setPlate("");
      setBrand("");
      setModel("");
      setYear("");
      setColor("");

      await loadVehicles();
    } catch {
      setErro("Erro inesperado ao cadastrar veículo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[32px] bg-white px-6 py-7 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="mb-4 inline-flex rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-700">
            Meus veículos
          </div>

          <h1 className="text-3xl font-extrabold text-zinc-900">Cadastrar veículo</h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setKind("carro")}
                className={`h-14 rounded-2xl border text-base font-semibold transition ${
                  kind === "carro"
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                Carro
              </button>

              <button
                type="button"
                onClick={() => setKind("moto")}
                className={`h-14 rounded-2xl border text-base font-semibold transition ${
                  kind === "moto"
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                Moto
              </button>
            </div>

            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="Placa"
              className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />

            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Marca"
              className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />

            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Modelo"
              className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />

            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Ano"
              className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />

            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Cor"
              className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />

            {erro ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {erro}
              </div>
            ) : null}

            {sucesso ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {sucesso}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-16 w-full rounded-2xl bg-red-600 text-lg font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Adicionar veículo"}
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-[32px] bg-white px-6 py-7 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <h2 className="text-2xl font-extrabold text-zinc-900">Veículos cadastrados</h2>

          {loadingList ? (
            <p className="mt-4 text-zinc-600">Carregando...</p>
          ) : vehicles.length === 0 ? (
            <p className="mt-4 text-zinc-600">Nenhum veículo cadastrado.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="rounded-2xl border border-zinc-200 p-4">
                  <p className="text-lg font-bold text-zinc-900">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Tipo: {vehicle.kind === "carro" ? "Carro" : "Moto"}
                  </p>
                  <p className="text-sm text-zinc-600">Placa: {vehicle.plate}</p>
                  <p className="text-sm text-zinc-600">Ano: {vehicle.year ?? "-"}</p>
                  <p className="text-sm text-zinc-600">Cor: {vehicle.color ?? "-"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
