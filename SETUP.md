# Configuração do ListShop com Prisma + Supabase

## 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```bash
# Configuração do banco de dados PostgreSQL (Supabase)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:6543/postgres?schema=public"

# Configuração do Supabase (Auth + Storage)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxxxx"
```

### Como obter DATABASE_URL do Supabase:

1. Acesse o dashboard do Supabase
2. Vá em Settings > Database
3. Copie a "Connection string" e substitua `[YOUR-PASSWORD]` pela senha do seu banco

Exemplo:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

## 2. Instalação e Configuração

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Criar tabelas no banco
npx prisma migrate dev --name init
```

## 3. Executar

```bash
npm run dev
```

## 4. Verificar

- Acesse http://localhost:3000
- O sistema deve redirecionar para `/login` se não autenticado
- Após login, será redirecionado para `/lists`

## Estrutura do Banco

- **Profile**: Usuários do sistema
- **List**: Listas de compras
- **Category**: Categorias dentro das listas
- **Item**: Itens das listas
- **Share**: Compartilhamento de listas entre usuários

## APIs Disponíveis

- `GET/POST /api/lists` - Gerenciar listas
- `GET/PATCH/DELETE /api/lists/[id]` - Operações em lista específica
- `GET/POST /api/lists/[id]/items` - Gerenciar itens
- `PATCH/DELETE /api/items/[id]` - Operações em item específico
- `GET/POST /api/lists/[id]/categories` - Gerenciar categorias
- `GET/POST /api/lists/[id]/shares` - Gerenciar compartilhamentos
- `GET/PATCH /api/profiles/me` - Perfil do usuário autenticado

