"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Vehicle = {
  id: string;
  kind: "carro" | "moto";
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  color: string | null;
};

type ManualVehicle = {
  kind: "carro" | "moto";
  plate: string;
  brand: string;
  model: string;
  year: string;
  color: string;
};

export default function SolicitarSocorroPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [useAnotherVehicle, setUseAnotherVehicle] = useState(false);

  const [manualVehicle, setManualVehicle] = useState<ManualVehicle>({
    kind: "carro",
    plate: "",
    brand: "",
    model: "",
    year: "",
    color: "",
  });

  useEffect(() => {
    async function loadVehicles() {
      try {
        setLoading(true);
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
          .order("created_at", { ascending: true });

        if (error) {
          setErro(error.message);
          return;
        }

        const list = (data as Vehicle[]) || [];
        setVehicles(list);

        if (list.length === 1) {
          setSelectedVehicleId(list[0].id);
        }
      } catch {
        setErro("Erro ao carregar veículos.");
      } finally {
        setLoading(false);
      }
    }

    loadVehicles();
  }, []);

  const hasOneVehicle = vehicles.length === 1;
  const hasMultipleVehicles = vehicles.length > 1;

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) || null,
    [vehicles, selectedVehicleId]
  );

  async function handleSolicitarSocorro() {
    setErro("");

    if (useAnotherVehicle) {
      if (!manualVehicle.plate.trim()) {
        setErro("Informe a placa do veículo.");
        return;
      }

      if (!manualVehicle.brand.trim()) {
        setErro("Informe a marca do veículo.");
        return;
      }

      if (!manualVehicle.model.trim()) {
        setErro("Informe o modelo do veículo.");
        return;
      }

      if (!manualVehicle.year.trim()) {
        setErro("Informe o ano do veículo.");
        return;
      }

      if (!manualVehicle.color.trim()) {
        setErro("Informe a cor do veículo.");
        return;
      }

      alert("Socorro solicitado para outro veículo.");
      return;
    }

    if (hasMultipleVehicles && !selectedVehicleId) {
      setErro("Selecione o veículo para o qual deseja solicitar socorro.");
      return;
    }

    if (hasOneVehicle && !selectedVehicleId && vehicles[0]) {
      setSelectedVehicleId(vehicles[0].id);
    }

    alert("Socorro solicitado com sucesso.");
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[32px] bg-white px-6 py-7 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="mb-4 inline-flex rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-700">
            Solicitar socorro
          </div>

          <h1 className="text-3xl font-extrabold text-zinc-900">Escolha o veículo</h1>

          {loading ? (
            <p className="mt-4 text-zinc-600">Carregando...</p>
          ) : (
            <>
              {!useAnotherVehicle && hasOneVehicle && vehicles[0] && (
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-700">
                    Usaremos automaticamente seu veículo cadastrado:
                  </p>
                  <p className="mt-2 font-bold text-zinc-900">
                    {vehicles[0].brand} {vehicles[0].model}
                  </p>
                  <p className="text-sm text-zinc-600">Placa: {vehicles[0].plate}</p>
                  <p className="text-sm text-zinc-600">
                    Tipo: {vehicles[0].kind === "carro" ? "Carro" : "Moto"}
                  </p>
                </div>
              )}

              {!useAnotherVehicle && hasMultipleVehicles && (
                <div className="mt-6 space-y-3">
                  {vehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selectedVehicleId === vehicle.id
                          ? "border-red-600 bg-red-50"
                          : "border-zinc-200 bg-white hover:bg-zinc-50"
                      }`}
                    >
                      <p className="font-bold text-zinc-900">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-sm text-zinc-600">Placa: {vehicle.plate}</p>
                      <p className="text-sm text-zinc-600">
                        Tipo: {vehicle.kind === "carro" ? "Carro" : "Moto"}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setUseAnotherVehicle((prev) => !prev)}
                className="mt-6 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                {useAnotherVehicle
                  ? "Usar um veículo cadastrado"
                  : "O socorro é para outro veículo"}
              </button>

              {useAnotherVehicle && (
                <div className="mt-6 space-y-4 rounded-3xl border border-zinc-200 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setManualVehicle((prev) => ({ ...prev, kind: "carro" }))
                      }
                      className={`h-14 rounded-2xl border text-base font-semibold transition ${
                        manualVehicle.kind === "carro"
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      Carro
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setManualVehicle((prev) => ({ ...prev, kind: "moto" }))
                      }
                      className={`h-14 rounded-2xl border text-base font-semibold transition ${
                        manualVehicle.kind === "moto"
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      Moto
                    </button>
                  </div>

                  <input
                    type="text"
                    value={manualVehicle.plate}
                    onChange={(e) =>
                      setManualVehicle((prev) => ({
                        ...prev,
                        plate: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Placa"
                    className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />

                  <input
                    type="text"
                    value={manualVehicle.brand}
                    onChange={(e) =>
                      setManualVehicle((prev) => ({ ...prev, brand: e.target.value }))
                    }
                    placeholder="Marca"
                    className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />

                  <input
                    type="text"
                    value={manualVehicle.model}
                    onChange={(e) =>
                      setManualVehicle((prev) => ({ ...prev, model: e.target.value }))
                    }
                    placeholder="Modelo"
                    className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />

                  <input
                    type="number"
                    value={manualVehicle.year}
                    onChange={(e) =>
                      setManualVehicle((prev) => ({ ...prev, year: e.target.value }))
                    }
                    placeholder="Ano"
                    className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />

                  <input
                    type="text"
                    value={manualVehicle.color}
                    onChange={(e) =>
                      setManualVehicle((prev) => ({ ...prev, color: e.target.value }))
                    }
                    placeholder="Cor"
                    className="h-14 w-full rounded-2xl border border-zinc-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />
                </div>
              )}

              {selectedVehicle && !useAnotherVehicle && hasMultipleVehicles && (
                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-700">
                    Veículo selecionado:
                  </p>
                  <p className="mt-2 font-bold text-zinc-900">
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </p>
                  <p className="text-sm text-zinc-600">Placa: {selectedVehicle.plate}</p>
                </div>
              )}

              {erro ? (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {erro}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSolicitarSocorro}
                className="mt-6 h-16 w-full rounded-2xl bg-red-600 text-lg font-bold text-white transition hover:bg-red-700"
              >
                Solicitar socorro agora
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
