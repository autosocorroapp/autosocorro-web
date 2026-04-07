import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Defina SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL) e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const testPhone = process.env.TEST_USER_PHONE || "+5511999999999";
const testEmail = (process.env.TEST_USER_EMAIL || "usuario.teste@autosocorro.local").trim().toLowerCase();
const testName = process.env.TEST_USER_NAME || "Usuário Teste";
const testWhatsapp = process.env.TEST_USER_WHATSAPP || testPhone;
const testCpf = (process.env.TEST_USER_CPF || "12345678901").replace(/\D/g, "").slice(0, 11);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function listAllUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });

    if (error) {
      throw new Error(`Erro ao listar usuários: ${error.message}`);
    }

    users.push(...data.users);

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return users;
}

async function ensureUser() {
  const users = await listAllUsers();
  let existingUser = users.find((user) => user.phone === testPhone) || null;

  if (!existingUser) {
    existingUser = users.find((user) => user.email?.toLowerCase() === testEmail) || null;
  }

  if (!existingUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      email_confirm: true,
      phone: testPhone,
      phone_confirm: true,
      user_metadata: { full_name: testName, cpf: testCpf },
    });

    if (error || !data.user) {
      throw new Error(`Erro ao criar usuário de teste: ${error?.message || "sem usuário retornado"}`);
    }

    existingUser = data.user;
    console.log(`Usuário criado: ${existingUser.id} (${testPhone} / ${testEmail})`);
  } else {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      email: testEmail,
      email_confirm: true,
      phone: testPhone,
      phone_confirm: true,
      user_metadata: {
        ...(existingUser.user_metadata || {}),
        full_name: testName,
        cpf: testCpf,
      },
    });

    if (error || !data.user) {
      throw new Error(`Erro ao atualizar usuário existente: ${error?.message || "sem usuário retornado"}`);
    }

    existingUser = data.user;
    console.log(`Usuário atualizado: ${existingUser.id} (${testPhone} / ${testEmail})`);
  }

  if (!existingUser.email || existingUser.email.toLowerCase() !== testEmail) {
    throw new Error("Falha na verificação de e-mail: usuário não está com o e-mail esperado.");
  }

  const { error: profileError } = await supabase
    .from("customer_profiles")
    .upsert(
      {
        id: existingUser.id,
        full_name: testName,
        phone: testPhone,
        whatsapp: testWhatsapp,
        email: testEmail,
        cpf: testCpf,
      },
      { onConflict: "id" },
    );

  if (profileError) {
    throw new Error(`Erro ao criar/atualizar perfil em customer_profiles: ${profileError.message}`);
  }

  console.log("Perfil customer_profiles criado/atualizado com sucesso.");
  console.log("Verificação concluída: conta de teste possui e-mail configurado.");
}

ensureUser().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
