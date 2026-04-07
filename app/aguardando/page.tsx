export default function AguardandoPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-6">
      <div className="w-full rounded-3xl bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-full bg-red-100" />

        <h1 className="text-2xl font-bold">Buscando prestadores...</h1>

        <p className="mt-3 text-sm text-neutral-600">
          Estamos procurando prestadores próximos para atender seu chamado.
        </p>

        <div className="mt-6 space-y-3 rounded-2xl border border-neutral-100 p-4 text-left text-sm text-neutral-600">
          <div>• Raio inicial: 1,5 km</div>
          <div>• Expansão automática: 3 km e 5 km</div>
          <div>• Tempo de aceite: 10 segundos</div>
          <div>• Você será avisado assim que alguém aceitar</div>
        </div>

        <div className="mt-6">
          <a
            href="/"
            className="block w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-center font-semibold text-neutral-900"
          >
            Voltar para início
          </a>
        </div>
      </div>
    </main>
  );
}
