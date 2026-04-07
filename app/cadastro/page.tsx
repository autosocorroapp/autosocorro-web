"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function handleCadastro(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }

    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return;
    }

    if (!senha.trim()) {
      setErro("Informe sua senha.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            nome: nome.trim(),
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        setErro(error.message);
        return;
      }

      setSucesso(
        "Cadastro realizado com sucesso. Verifique seu e-mail para confirmar a conta antes de fazer login."
      );

      setNome("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");
    } catch {
      setErro("Erro inesperado ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Criar conta</h1>

        <form onSubmit={handleCadastro} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium mb-1">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium mb-1">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="******"
            />
          </div>

          <div>
            <label
              htmlFor="confirmarSenha"
              className="block text-sm font-medium mb-1"
            >
              Confirmar senha
            </label>
            <input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="******"
            />
          </div>

          {erro ? (
            <p className="text-sm text-red-600 font-medium">{erro}</p>
          ) : null}

          {sucesso ? (
            <p className="text-sm text-green-600 font-medium">{sucesso}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Já tem conta?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
