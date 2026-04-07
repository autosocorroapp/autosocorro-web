"use client";

import { useEffect, useState } from "react";
import { CarFront, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type VehicleForm = {
  kind: "car" | "motorcycle";
  plate: string;
  brand: string;
  model: string;
  color: string;
  year: string;
};

const emptyVehicle: VehicleForm = {
  kind: "car",
  plate: "",
  brand: "",
  model: "",
  color: "",
  year: "",
};

export default function VeiculosPage() {
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [vehicles, setVehicles] = useState<VehicleForm[]>([{ ...emptyVehicle }]);

  useEffect(() => {
    async function loadData() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", authData.user.id)
        .single();

      if (profile?.full_name) setFullName(profile.full_name);

      const { data: userVehicles } = await supabase
        .from("vehicles")
        .select("kind, plate, brand, model, color, year")
        .eq("profile_id", authData.user.id)
        .order("created_at", { ascending: true });

      if (userVehicles && userVehicles.length > 0) {
        setVehicles(
          userVehicles.map((v) => ({
            kind: v.kind === "motorcycle" ? "motorcycle" : "car",
            plate: v.plate || "",
            brand: v.brand || "",
            model: v.model || "",
            color: v.color || "",
            year: v.year || "",
          }))
        );
      }

      setProfileLoading(false);
    }

    loadData();
  }, []);

  function updateVehicle(index: number, field: keyof VehicleForm, value: string) {
    setVehicles((prev) =>
      prev.map((vehicle, i) =>
        i === index ? { ...vehicle, [field]: value } : vehicle
      )
    );
  }

  function addVehicle() {
    setVehicles((prev) => [...prev, { ...emptyVehicle }]);
  }

  function removeVehicle(index: number) {
    setVehicles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    try {
      setLoading(true);

      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        window.location.href = "/login";
        return;
      }

      if (!fullName.trim()) {
        alert("Preencha seu nome.");
        return;
      }

      const validVehicles = vehicles.filter(
        (v) => v.plate.trim() || v.model.trim() || v.brand.trim()
      );

      if (validVehicles.length === 0) {
        alert("Cadastre pelo menos um veículo.");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", authData.user.id);

      if (profileError) {
        alert(profileError.message);
        return;
      }

      const { error: deleteError } = await supabase
        .from("vehicles")
        .delete()
        .eq("profile_id", authData.user.id);

      if (deleteError) {
        alert(deleteError.message);
        return;
      }

      const payload = validVehicles.map((vehicle) => ({
        profile_id: authData.user.id,
        kind: vehicle.kind,
        plate: vehicle.plate.trim().toUpperCase(),
        brand: vehicle.brand.trim() || null,
        model: vehicle.model.trim() || null,
        color: vehicle.color.trim() || null,
        year: vehicle.year.trim() || null,
      }));

      const { error: vehiclesError } = await supabase
        .from("vehicles")
        .insert(payload);

      if (vehiclesError) {
        alert(vehiclesError.message);
        return;
      }

      window.location.href = "/";
    } catch {
      alert("Erro ao salvar veículos.");
    } finally {
      setLoading(false);
    }
  }

  if (profileLoading) {
    return (
      <section className="rounded-[28px] bg-white p-5 shadow-sm">
        Carregando...
      </section>
    );
  }

  return (
    <>
      <section className="rounded-[28px] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-red-50 p-3 text-red-600">
            <CarFront size={18} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Meus veículos</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Cadastre um ou mais veículos para pedir socorro mais rápido.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <input
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none"
            placeholder="Seu nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
      </section>

      <div className="mt-5 space-y-4">
        {vehicles.map((vehicle, index) => (
          <section key={index} className="rounded-[28px] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Veículo {index + 1}</h2>

              {vehicles.length > 1 && (
                <button
                  onClick={() => removeVehicle(index)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-600"
                >
                  <Trash2 size={16} />
                  Remover
                </button>
              )}
            </div>

            <div className="space-y-3">
              <select
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none"
                value={vehicle.kind}
                onChange={(e) =>
                  updateVehicle(index, "kind", e.target.value as "car" | "motorcycle")
                }
              >
                <option value="car">Carro</option>
                <option value="motorcycle">Moto</option>
              </select>

              <input
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none"
                placeholder="Placa"
                value={vehicle.plate}
                onChange={(e) => updateVehicle(index, "plate", e.target.value)}
              />

              <input
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none"
                placeholder="Marca"
                value={vehicle.brand}
                onChange={(e) => updateVehicle(index, "brand", e.target.value)}
              />

              <input
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none"
                placeholder="Modelo"
                value={vehicle.model}
                onChange={(e) => updateVehicle(index, "model", e.target.value)}
              />

              <input
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none"
                placeholder="Cor"
                value={vehicle.color}
                onChange={(e) => updateVehicle(index, "color", e.target.value)}
              />

              <input
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none"
                placeholder="Ano"
                value={vehicle.year}
                onChange={(e) => updateVehicle(index, "year", e.target.value)}
              />
            </div>
          </section>
        ))}

        <button
          onClick={addVehicle}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-center font-semibold text-neutral-900"
        >
          <Plus size={18} />
          Adicionar outro veículo
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full rounded-2xl bg-red-600 px-4 py-4 text-center font-semibold text-white disabled:opacity-40"
        >
          {loading ? "Salvando..." : "Salvar veículos"}
        </button>
      </div>
    </>
  );
}
