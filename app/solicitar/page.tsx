"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SolicitarPage() {

  const [service, setService] = useState("")
  const [vehicle, setVehicle] = useState("car")
  const [loading, setLoading] = useState(false)

  async function solicitar() {

    if (!service) {
      alert("Escolha um serviço")
      return
    }

    setLoading(true)

    const { data: user } = await supabase.auth.getUser()

    if (!user?.user) {
      alert("Faça login primeiro")
      window.location.href = "/login"
      return
    }

    const { error } = await supabase
      .from("service_requests")
      .insert({
        customer_profile_id: user.user.id,
        service_code: service,
        vehicle_kind: vehicle,
        status: "searching"
      })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    alert("Chamado criado")

    window.location.href = "/aguardando"
  }

  return (
    <main className="mx-auto max-w-md p-5">

      <h1 className="text-2xl font-bold">
        Solicitar socorro
      </h1>

      <div className="mt-5 space-y-3">

        <select
          className="w-full border rounded-xl p-3"
          value={vehicle}
          onChange={(e)=>setVehicle(e.target.value)}
        >
          <option value="car">Carro</option>
          <option value="motorcycle">Moto</option>
        </select>

        <select
          className="w-full border rounded-xl p-3"
          value={service}
          onChange={(e)=>setService(e.target.value)}
        >
          <option value="">Escolha o serviço</option>
          <option value="tire_change">Troca de pneu</option>
          <option value="battery_jump">Carga na bateria</option>
          <option value="fuel_delivery">Entrega de combustível</option>
          <option value="diagnostics">Diagnóstico mecânico</option>
          <option value="tow">Guincho</option>
        </select>

        <button
          onClick={solicitar}
          className="w-full bg-red-600 text-white rounded-xl p-3"
        >
          {loading ? "Enviando..." : "Pedir socorro"}
        </button>

      </div>

    </main>
  )
}
