# 🏦 API Imóveis Caixa PB

API intermediária que busca o CSV público da Caixa Econômica Federal e serve os dados sem bloqueio de CORS.

## Deploy no Vercel (gratuito, ~3 minutos)

### Passo 1 — Criar conta no GitHub
Se não tiver, acesse https://github.com e crie uma conta gratuita.

### Passo 2 — Criar repositório
1. Acesse https://github.com/new
2. Nome: `caixa-imoveis-api`
3. Visibilidade: **Public** ou **Private** (tanto faz)
4. Clique em **Create repository**

### Passo 3 — Subir os arquivos
No repositório criado, clique em **"uploading an existing file"** e suba os 3 arquivos:
- `api/imoveis.js`
- `vercel.json`
- `package.json`

Ou, se tiver Git instalado no computador:
```bash
git clone https://github.com/SEU_USUARIO/caixa-imoveis-api
# Copie os arquivos para a pasta
git add .
git commit -m "API Caixa"
git push
```

### Passo 4 — Deploy no Vercel
1. Acesse https://vercel.com e faça login com sua conta GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório `caixa-imoveis-api`
4. Clique em **Deploy** (sem mudar nada)
5. Aguarde ~1 minuto

### Passo 5 — Pegar a URL
Após o deploy, o Vercel vai mostrar uma URL como:
```
https://caixa-imoveis-api.vercel.app
```

### Passo 6 — Testar a API
Acesse no browser:
```
https://caixa-imoveis-api.vercel.app/api/imoveis?uf=PB
```
Deve retornar um JSON com os imóveis da Paraíba.

### Passo 7 — Atualizar o app
Cole a URL no campo indicado no app Monitor de Leilões e clique em Conectar.

---

## Endpoints

### GET /api/imoveis?uf=PB
Retorna todos os imóveis do estado informado.

**Parâmetros:**
- `uf` (obrigatório): Sigla do estado. Ex: PB, SP, RJ

**Resposta:**
```json
{
  "ok": true,
  "uf": "PB",
  "total": 342,
  "atualizado": "2026-04-20T14:30:00.000Z",
  "imoveis": [
    {
      "id": "12345",
      "cidade": "João Pessoa",
      "bairro": "Manaíra",
      "endereco": "Rua das Flores, 123",
      "cat": "imoveis",
      "lance": 185000,
      "aval": 320000,
      "desconto": 42,
      "area": 85,
      "quartos": 3,
      "descricao": "Apartamento 3/4...",
      "modalidade": "Venda Direta",
      "urlImovel": "https://venda-imoveis.caixa.gov.br/sistema/detalhe-imovel.asp?hdnimovel=12345",
      "destaque": true
    }
  ]
}
```

---

## Como funciona

O site da Caixa disponibiliza um CSV público em:
`https://venda-imoveis.caixa.gov.br/sistema/download-lista.asp?hdnUF=PB`

O problema é que navegadores bloqueiam chamadas diretas por política de CORS.
Esta API roda no servidor (Vercel), baixa o CSV, parseia e devolve como JSON com os headers CORS corretos.

**Custo:** R$ 0,00 — Vercel free tier suporta 100.000 execuções/mês.
