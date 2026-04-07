import {
  BatteryCharging,
  Bike,
  Car,
  Fuel,
  MapPin,
  Truck,
  Wrench
} from "lucide-react";
import Logo from "@/components/logo";

const services = [
  { name: "Troca de pneu", value: "R$ 65 + localização", icon: Wrench },
  { name: "Carga na bateria", value: "R$ 65 + localização", icon: BatteryCharging },
  { name: "Entrega de combustível", value: "Conforme litragem + localização", icon: Fuel },
  { name: "Diagnóstico mecânico", value: "R$ 80 + localização", icon: Wrench },
  { name: "Guincho", value: "R$ 100 + distância", icon: Truck }
];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-5">
      <header className="mb-6">
        <Logo />
        <div className="mt-4 flex items-center gap-2 text-sm text-neutral-600">
          <MapPin size={16} />
          Itaboraí / RJ
        </div>
      </header>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Socorro automotivo rápido</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Escolha o tipo de veículo e solicite ajuda com valor fechado calculado
          pela localização.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="rounded-3xl border border-red-200 bg-red-50 p-4 text-left">
            <Car className="mb-3 text-red-600" />
            <div className="font-semibold">Carro</div>
            <div className="text-sm text-neutral-500">Atendimento automotivo</div>
          </button>

          <button className="rounded-3xl border border-neutral-200 bg-white p-4 text-left">
            <Bike className="mb-3 text-neutral-800" />
            <div className="font-semibold">Moto</div>
            <div className="text-sm text-neutral-500">Socorro para moto</div>
          </button>
        </div>

        <button className="mt-4 w-full rounded-3xl bg-red-600 px-4 py-3 font-semibold text-white">
          Pedir socorro
        </button>
      </section>

      <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Serviços do MVP</h2>
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
                  <div className="text-sm text-neutral-500">{service.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Regras iniciais</h2>
        <div className="mt-3 space-y-2 text-sm text-neutral-600">
          <div>• Raio progressivo: 1,5 km / 3 km / 5 km</div>
          <div>• Aceite do chamado: 10 segundos</div>
          <div>• Início do deslocamento: 20 segundos</div>
          <div>• Cancelamento do cliente: R$ 15</div>
          <div>• Aprovação manual de prestadores</div>
        </div>
      </section>
    </main>
  );
}
