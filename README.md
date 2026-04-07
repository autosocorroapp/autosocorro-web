# autosocorro-web

Aplicativo Auto Socorro - MVP plataforma de socorro automotivo.

## Autenticação atual

- Cadastro principal (`/cadastro`) com **e-mail e senha**
- Campos obrigatórios: nome completo, CPF, telefone, e-mail, senha e confirmar senha
- CPF validado matematicamente e salvo sem máscara
- Validação de unicidade (CPF/telefone) consultando `profiles`
- Verificação obrigatória por e-mail (fluxo do Supabase Auth)
- Login com `supabase.auth.signInWithPassword()`

## Fluxo pós-login

- Usuário `driver` sem veículos -> `/veiculos`
- Usuário `driver` com veículos -> `/`
- Usuário `provider` -> `/`

## Prestador

- CTA na home: **Quero ser um prestador**
- Rota de início: `/prestador/cadastro`
- Cadastro criado com:
  - `user_type = provider`
  - `provider_status = pending`
- Aprovação de prestador é manual

## Usuário de teste no Supabase

Para facilitar testes de acesso, você pode criar (ou atualizar) um usuário de teste no projeto Supabase:

```bash
SUPABASE_URL="https://SEU-PROJETO.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE_KEY" \
npm run supabase:create-test-user
```
