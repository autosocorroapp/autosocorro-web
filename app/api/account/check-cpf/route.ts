import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cpf = normalizeCpf(body?.cpf || "");

    if (!cpf || cpf.length !== 11) {
      return NextResponse.json(
        { exists: false, message: "CPF inválido." },
        { status: 200 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { exists: false, message: "Configuração do servidor incompleta." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("cpf", cpf)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { exists: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      exists: !!data,
    });
  } catch {
    return NextResponse.json(
      { exists: false, message: "Erro ao verificar CPF." },
      { status: 500 }
    );
  }
}
