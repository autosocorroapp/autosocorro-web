import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const cpf = normalizeCpf(String(body?.cpf || ""));
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = normalizePhone(String(body?.phone || ""));

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "Configuração do servidor incompleta." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const checks = await Promise.all([
      cpf
        ? supabaseAdmin.from("profiles").select("id").eq("cpf", cpf).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      email
        ? supabaseAdmin.from("profiles").select("id").eq("email", email).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      phone
        ? supabaseAdmin.from("profiles").select("id").eq("phone", phone).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    const [cpfResult, emailResult, phoneResult] = checks;

    if (cpfResult.error || emailResult.error || phoneResult.error) {
      return NextResponse.json(
        { success: false, message: "Erro ao verificar disponibilidade." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      exists: {
        cpf: !!cpfResult.data,
        email: !!emailResult.data,
        phone: !!phoneResult.data,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Erro inesperado na verificação." },
      { status: 500 }
    );
  }
}
