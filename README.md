# autosocorro-web

Aplicativo Auto Socorro - MVP plataforma de socorro automotivo.

## Usuário de teste no Supabase

Para facilitar testes de acesso, você pode criar (ou atualizar) um usuário de teste no projeto Supabase:

```bash
SUPABASE_URL="https://SEU-PROJETO.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE_KEY" \
npm run supabase:create-test-user
```

Variáveis opcionais:

- `TEST_USER_PHONE` (padrão: `+5511999999999`)
- `TEST_USER_EMAIL` (padrão: `usuario.teste@autosocorro.local`)
- `TEST_USER_NAME` (padrão: `Usuário Teste`)
- `TEST_USER_WHATSAPP` (padrão: mesmo valor de `TEST_USER_PHONE`)
- `TEST_USER_CPF` (padrão: `12345678901`)

O script garante:

- Usuário no **Auth** com telefone confirmado
- E-mail associado/confirmado no usuário de teste
- Registro correspondente em `customer_profiles` com e-mail e CPF


## Autenticação sem SMS

Enquanto não houver provedor de SMS, o app usa OTP por e-mail no cadastro e no login.
O telefone continua sendo coletado no cadastro para contato operacional e registro no perfil.
