"use client";

import {
  BatteryCharging,
  Bike,
  Car,
  Fuel,
  MapPin,
  Truck,
  Wrench,
} from "lucide-react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabase";

const services = [
  {
    name: "Troca de pneu",
    description: "Atendimento rápido para troca emergencial.",
    icon: Wrench,
  },
  {
    name: "Carga na bateria",
    description: "Auxílio para partida e suporte elétrico inicial.",
    icon: BatteryCharging,
  },
  {
    name: "Entrega de combustível",
    description: "Envio de combustível no local solicitado.",
    icon: Fuel,
  },
  {
    name: "Diagnóstico mecânico",
    description: "Avaliação inicial para identificar o problema.",
    icon: Wrench,
  },
  {
    name: "Guincho",
    description: "Remoção do veículo com suporte especializado.",
    icon: Truck,
  },
];

export default function HomePage() {
  const { user, loading } = useUser();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm text-neutral-600">
          <MapPin size={16} />
          Itaboraí / RJ
        </div>

        <h1 className="text-2xl font-bold">Socorro automotivo rápido</h1>

        <p className="mt-2 text-sm text-neutral-600">
          Conectamos você a prestadores próximos para resolver problemas no carro
          ou moto com agilidade e segurança.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-left">
            <Car className="mb-3 text-red-600" />
            <div className="font-semibold">Carro</div>
            <div className="text-sm text-neutral-500">Atendimento automotivo</div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-4 text-left">
            <Bike className="mb-3 text-neutral-800" />
            <div className="font-semibold">Moto</div>
            <div className="text-sm text-neutral-500">Socorro para moto</div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {!loading && !user && (
            <>
              <a
                href="/login"
                className="block w-full rounded-3xl bg-red-600 px-4 py-3 text-center font-semibold text-white"
              >
                Entrar com telefone
              </a>

              <a
                href="/cadastro"
                className="block w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-center font-semibold text-neutral-900"
              >
                Criar cadastro
              </a>
            </>
          )}

          {!loading && user && (
            <>
              <a
                href="/solicitar"
                className="block w-full rounded-3xl bg-red-600 px-4 py-3 text-center font-semibold text-white"
              >
                Pedir socorro
              </a>

              <a
                href="/veiculos"
                className="block w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-center font-semibold text-neutral-900"
              >
                Meus veículos
              </a>

              <button
                onClick={handleLogout}
                className="block w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-center font-semibold text-neutral-900"
              >
                Sair
              </button>
            </>
          )}
        </div>
      </section>

      <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Serviços disponíveis</h2>

        <div className="mt-4 space-y-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.name}
                className="flex items-start gap-3 rounded-2xl border border-neutral-100 p-3"
              >
                <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                  <Icon size={18} />
                </div>

                <div>
                  <div className="font-semibold">{service.name}</div>
                  <div className="text-sm text-neutral-500">
                    {service.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Como funciona</h2>

        <div className="mt-3 space-y-2 text-sm text-neutral-600">
          <div>• Busca de prestadores por raio progressivo</div>
          <div>• 1,5 km → 3 km → 5 km</div>
          <div>• Prestador tem 10 segundos para aceitar</div>
          <div>• Início do deslocamento em até 20 segundos</div>
          <div>• Cancelamento do cliente: R$ 15</div>
          <div>• Prestadores aprovados manualmente</div>
        </div>
      </section>
    </>
  );
}
