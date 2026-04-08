import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) return "";

  const firstTwo = localPart.slice(0, 2);
  const lastChar = localPart.slice(-1);

  return `${firstTwo}***${lastChar}@${domain}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cpf = normalizeCpf(String(body?.cpf || ""));

    if (cpf.length !== 11) {
      return NextResponse.json(
        { success: false, message: "CPF inválido." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "Configuração do servidor incompleta." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("cpf", cpf)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    if (!data?.email) {
      return NextResponse.json(
        { success: false, message: "Nenhuma conta encontrada para este CPF." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      emailHint: maskEmail(data.email),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Erro ao localizar o e-mail." },
      { status: 500 }
    );
  }
}
