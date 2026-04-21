# API Imóveis Caixa PB

## ⚠️ Por que deu 404?

O erro `404: NOT_FOUND` no Vercel acontece quando os arquivos não estão na estrutura correta.

**Estrutura ERRADA** (causa o 404):
```
meu-repo/
  imoveis.js        ← arquivo na raiz = Vercel não reconhece como API
  vercel.json
  package.json
```

**Estrutura CORRETA**:
```
meu-repo/
  api/
    imoveis.js      ← DEVE estar dentro da pasta "api/"
  vercel.json
  package.json
```

## Como corrigir no GitHub

1. Acesse seu repositório no GitHub
2. Clique em **"Add file" → "Upload files"**  
3. **Arraste a pasta `api/`** inteira (não só o arquivo)
4. O GitHub vai criar `api/imoveis.js` automaticamente
5. Clique em **Commit changes**
6. O Vercel vai fazer novo deploy automático em ~1 minuto

## Testar se funcionou

Acesse no browser:
```
https://caixa-imoveis-api.vercel.app/api/imoveis?uf=PB
```
Deve retornar JSON com os imóveis.

## Deploy do zero (mais simples)

Se preferir começar do zero:

1. Acesse https://vercel.com/new
2. Escolha **"Deploy from template"** ou importe do GitHub
3. Suba os 3 arquivos com a estrutura correta acima
