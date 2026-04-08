import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = String(body?.identifier || "").trim();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "Configuração do servidor incompleta." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Se for e-mail, devolve o próprio e-mail
    if (identifier.includes("@")) {
      return NextResponse.json({
        success: true,
        email: identifier.toLowerCase(),
      });
    }

    const cpf = normalizeCpf(identifier);

    if (cpf.length !== 11) {
      return NextResponse.json(
        { success: false, message: "Informe um e-mail ou CPF válido." },
        { status: 400 }
      );
    }

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
        { success: false, message: "Conta não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      email: data.email,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Erro ao resolver login." },
      { status: 500 }
    );
  }
}
