// api/imoveis.js
// IMPORTANTE: Este arquivo deve estar na pasta "api/" do repositório GitHub
// Estrutura correta:
//   meu-repo/
//     api/
//       imoveis.js   ← este arquivo
//     vercel.json
//     package.json

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const uf = (req.query.uf || "PB").toUpperCase();
  const csvUrl = `https://venda-imoveis.caixa.gov.br/sistema/download-lista.asp?hdnUF=${uf}`;

  try {
    const response = await fetch(csvUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9",
        "Referer": "https://venda-imoveis.caixa.gov.br/sistema/busca-imovel.asp",
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Caixa retornou ${response.status}` });
    }

    const buffer = await response.arrayBuffer();
    const text = new TextDecoder("iso-8859-1").decode(buffer);

    if (!text || text.length < 200) {
      return res.status(502).json({ error: "CSV vazio recebido da Caixa" });
    }

    const imoveis = parseCSV(text, uf);
    res.setHeader("Cache-Control", "s-maxage=7200, stale-while-revalidate=3600");

    return res.status(200).json({
      ok: true, uf, total: imoveis.length,
      atualizado: new Date().toISOString(),
      fonte: csvUrl, imoveis,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Erro interno" });
  }
}

function parseCSV(csvText, uf) {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const imoveis = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    if (cols.length < 6) continue;

    const numero    = col(cols, 0);
    const cidade    = col(cols, 2);
    const bairro    = col(cols, 3);
    const endereco  = col(cols, 4);
    const preco     = parseBRL(col(cols, 5));
    const avaliacao = parseBRL(col(cols, 6));
    const descricao = col(cols, 8);
    const modalidade= col(cols, 9);
    const link      = col(cols, 10);

    if (!numero || !cidade || preco <= 0) continue;

    const txt = (descricao + " " + modalidade).toLowerCase();
    let cat = "imoveis";
    if (/terreno|lote(?! condominial)/.test(txt)) cat = "terreno";
    else if (/comercial|sala|galpão|galpao|loja|escritório/.test(txt)) cat = "comercial";
    else if (/rural|chácara|sitio|fazenda/.test(txt)) cat = "rural";

    const qMatch = txt.match(/(\d)\s*(?:quarto|dorm)/);
    const quartos = qMatch ? parseInt(qMatch[1]) : 0;
    const aMatch = descricao.match(/(\d+[.,]?\d*)\s*m[²2]/i);
    const area = aMatch ? parseFloat(aMatch[1].replace(",", ".")) : 0;
    const descontoPct = avaliacao > 0 ? Math.round((1 - preco / avaliacao) * 100) : 0;
    const urlImovel = link?.startsWith("http") ? link
      : `https://venda-imoveis.caixa.gov.br/sistema/detalhe-imovel.asp?hdnimovel=${numero}`;

    imoveis.push({
      id: numero, numero, uf,
      cidade: toTitleCase(cidade),
      bairro: toTitleCase(bairro) || "–",
      endereco: toTitleCase(endereco) || "",
      cat, lance: preco, aval: avaliacao || preco,
      desconto: descontoPct, area, quartos,
      descricao: descricao || `${modalidade} – ${toTitleCase(cidade)}`,
      modalidade: modalidade || "Venda Direta",
      urlImovel, destaque: descontoPct >= 40,
      leiloeiro: "Caixa Econômica Federal",
    });
  }
  return imoveis;
}

function splitLine(line) {
  const result = []; let cur = ""; let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ";" && !inQ) { result.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  result.push(cur.trim());
  return result;
}

function col(arr, i) { return (arr[i] || "").replace(/^["'\s]+|["'\s]+$/g, "").trim(); }

function parseBRL(s) {
  if (!s) return 0;
  const clean = s.replace(/R\$\s*/g, "").replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  return parseFloat(clean) || 0;
}

function toTitleCase(s) {
  if (!s) return "";
  return s.toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
