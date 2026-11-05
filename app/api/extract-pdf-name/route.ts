import {GoogleGenAI, ThinkingLevel, Type} from '@google/genai';
import {NextRequest, NextResponse} from 'next/server';
import {
  cleanMissingOrUnidentifiedField,
  decodeCampaignAndFilenameHints,
  extractMonthFromDateStringPtBr,
  lookupAdAccountInDirectory,
  normalizeBuField,
  normalizePlataformaField,
  stripAccents,
} from '@/lib/pdf-utils';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function normalizeCurrencyValue(raw: string | undefined): string {
  if (!raw) return '';
  let cleaned = raw.replace(/[R$\sBRL]/gi, '').trim();
  if (!cleaned) return '';

  if (/^\d{1,3}(,\d{3})+\.\d{2}$/.test(cleaned)) {
    cleaned = cleaned.replace(/,/g, '').replace('.', ',');
  } else if (/^\d+\.\d{2}$/.test(cleaned)) {
    cleaned = cleaned.replace('.', ',');
  }

  const parts = cleaned.split(',');
  if (parts.length === 2) {
    const intPart = parts[0].replace(/\D/g, '');
    const decPart = parts[1].replace(/\D/g, '').slice(0, 2).padEnd(2, '0');
    if (intPart) {
      const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${formattedInt},${decPart}`;
    }
  }

  return cleaned;
}

const PT_MONTHS_FULL = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function normalizeMonthFullNamePtBr(raw: string | undefined): string {
  if (!raw) return '';
  const clean = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (!clean) return '';

  const monthAliases: Record<string, number> = {
    janeiro: 0,
    jan: 0,
    january: 0,
    fevereiro: 1,
    fev: 1,
    feb: 1,
    february: 1,
    marco: 2,
    mar: 2,
    march: 2,
    abril: 3,
    abr: 3,
    apr: 3,
    april: 3,
    maio: 4,
    mai: 4,
    may: 4,
    junho: 5,
    jun: 5,
    june: 5,
    julho: 6,
    jul: 6,
    july: 6,
    agosto: 7,
    ago: 7,
    aug: 7,
    august: 7,
    setembro: 8,
    set: 8,
    sep: 8,
    sept: 8,
    september: 8,
    outubro: 9,
    out: 9,
    oct: 9,
    october: 9,
    novembro: 10,
    nov: 10,
    november: 10,
    dezembro: 11,
    dez: 11,
    dec: 11,
    december: 11,
  };

  for (const [alias, idx] of Object.entries(monthAliases)) {
    const regex = new RegExp(`\\b${alias}\\b`, 'i');
    if (regex.test(clean)) {
      return PT_MONTHS_FULL[idx];
    }
  }

  const yyyyMm = clean.match(/^(?:20\d{2})[-/](\d{1,2})$/);
  if (yyyyMm) {
    const m = parseInt(yyyyMm[1], 10);
    if (m >= 1 && m <= 12) return PT_MONTHS_FULL[m - 1];
  }

  const mmYyyy = clean.match(/^(\d{1,2})[-/](?:20\d{2}|\d{2})$/);
  if (mmYyyy) {
    const m = parseInt(mmYyyy[1], 10);
    if (m >= 1 && m <= 12) return PT_MONTHS_FULL[m - 1];
  }

  const onlyNum = clean.match(/^0?([1-9]|1[0-2])$/);
  if (onlyNum) {
    const m = parseInt(onlyNum[1], 10);
    return PT_MONTHS_FULL[m - 1];
  }

  return raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1).toLowerCase();
}

function normalizeProdutoName(raw: string | undefined): string {
  if (!raw) return '';
  return stripAccents(raw.trim().replace(/\bgraduate\b/gi, 'Graduacao'));
}

function classifyDocumentPattern(parsed: {
  padraoDetectado?: string;
  tipoDocumento?: string;
  primeiraPaginaEhBoleto?: boolean;
  primeiraPaginaEhFatura?: boolean;
  primeiraPaginaEhNfsePrefeitura?: boolean;
}): string {
  if (parsed.primeiraPaginaEhNfsePrefeitura) {
    return 'NF';
  }
  if (parsed.primeiraPaginaEhFatura) {
    return 'Fatura';
  }
  if (parsed.primeiraPaginaEhBoleto) {
    return 'Boleto';
  }

  const raw = (parsed.tipoDocumento || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (raw === 'boleto' || raw.startsWith('bol')) return 'Boleto';
  if (raw === 'fatura' || raw.startsWith('fat') || raw === 'invoice')
    return 'Fatura';
  if (raw === 'nf' || raw.includes('nota') || raw.includes('nfs')) return 'NF';
  if (raw === 'pi' || raw.includes('insercao')) return 'PI';
  if (raw.includes('contrato')) return 'Contrato';

  return parsed.tipoDocumento?.trim() || 'NF';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      base64Pdf,
      originalName,
      customInstruction,
      patternTemplate,
      separator = '-',
      defaultContext,
      fastMode = true,
    } = body as {
      base64Pdf: string;
      originalName: string;
      customInstruction?: string;
      patternTemplate?: string;
      separator?: string;
      fastMode?: boolean;
      defaultContext?: {
        bu?: string;
        marca?: string;
        produto?: string;
        plataforma?: string;
        mesVeiculacao?: string;
      };
    };

    if (!base64Pdf) {
      return NextResponse.json(
        {error: 'O conteúdo do arquivo PDF não foi fornecido.'},
        {status: 400}
      );
    }

    const promptText = `Você é um especialista em auditoria de documentos de mídia e faturamento corporativo (Grupo Cogna / Platos / Kroton / Vasta / Saber).
Analise o PDF ("${originalName}") seguindo os padrões de layout e a Tabela de Contas de Anúncio (AdAccount) abaixo:

1. IDENTIFICAÇÃO DO TIPO DE DOCUMENTO (Olhe a PÁGINA 1 do PDF):
- PADRÃO A — NFS-e Prefeitura (Nota Fiscal):
  A página 1 tem cabeçalho "PREFEITURA DO MUNICÍPIO..." / "NOTA FISCAL ELETRÔNICA DE SERVIÇOS - NFS-e".
  -> Defina primeiraPaginaEhNfsePrefeitura = true e tipoDocumento = "NF".
- PADRÃO B — Fatura / Invoice de Plataforma (ex: Meta / Facebook):
  A página 1 tem título em destaque "FATURA" ou "INVOICE" e tabela "Descrição Detalhada" com linhas de campanha, MESMO QUE a página 2 ou 3 contenha um boleto bancário anexo.
  -> Defina primeiraPaginaEhFatura = true e tipoDocumento = "Fatura".
- PADRÃO C — Boleto Bancário Isolado (ex: Banco Itaú 341-7 ou Bank of America 755-2):
  A página 1 já é o próprio boleto ("Recibo do Sacado" / "Recibo do Pagador" / "Ficha de Compensação" com código de barras e linha digitável), MESMO QUE dentro do quadro "Instruções" apareça escrito "Número da fatura: ..." ou "Número da Nota: ...".
  -> Defina primeiraPaginaEhBoleto = true e tipoDocumento = "Boleto".

2. EXTRAÇÃO DE CONTA DE ANÚNCIO (AdAccount) E TABELA DE MEMÓRIA:
Extraia sempre o número da Conta de Anúncios em "contaAnuncios" (ex: "Referente a conta de anuncios: 847121826181253" ou "Identificação de Conta (AdAccount): 394854253002344" ou ID Google Ads de 10 dígitos).
Quando o PDF não informar diretamente a Marca ou o Produto (como acontece na NFS-e da Prefeitura), consulte esta tabela oficial pelo ID da conta:
Google (GA):
- 6229390997 -> Marca: Anhanguera | Produto: Livres | BU: Editora
- 2461697933 -> Marca: Anhanguera | Produto: Prof | BU: Editora
- 3308992750 -> Marca: Anhanguera | Produto: Tecnico | BU: Editora
- 9132551823 -> Marca: Anhanguera | Produto: Tecnico | BU: Editora
- 7897306766 -> Marca: Mackenzie | Produto: PosGrad | BU: Platos
- 5559513692 -> Marca: UMC | Produto: PosGrad | BU: Platos
- 3723241349 -> Marca: UPF | Produto: PosGrad | BU: Platos
- 5278063742 -> Marca: UTP | Produto: PosGrad | BU: Platos
Meta (FB):
- 590352796038847 -> Marca: Anhanguera | Produto: Livres | BU: Editora
- 1225955748924394 -> Marca: Anhanguera | Produto: Prof | BU: Editora
- 953670416812558 -> Marca: Anhanguera | Produto: Tecnico | BU: Editora
- 1063462275625969 -> Marca: Anhanguera | Produto: Tecnico | BU: Editora
- 394854253002344 -> Marca: Mackenzie | Produto: PosGrad | BU: Platos
- 1045398269986927 -> Marca: UMC | Produto: PosGrad | BU: Platos
- 716716590382666 -> Marca: UTP | Produto: PosGrad | BU: Platos
- 891218699281892 -> Marca: UPF | Produto: PosGrad | BU: Platos
- 847121826181253 -> Marca: Uniderp | Produto: Graduacao | BU: Editora
- 540820733733109 -> Marca: Pitagoras | Produto: Graduacao | BU: Editora
- 843996726246005 -> Marca: Unic | Produto: Graduacao | BU: Editora
DV360 (DV):
- 577201594 Plataform -> Plataforma: DV360 Fee | Marca: Consideracao | Produto: Graduacao | BU: Editora (IN | DV | GERAL | GRADUACAO — quando constar "577201594 Plataform", "Platform" ou "Fee")
- 577201594 -> Plataforma: DV360 | Marca: Consideracao | Produto: Graduacao | BU: Editora (IN | DV | GERAL | GRADUACAO)

3. EXTRAÇÃO DE BU (PELA RAZÃO SOCIAL DO TOMADOR / SACADO):
- Se o Tomador/Sacado for "PLATOS SOLUCOES EDUCACIONAIS S.A." -> bu = "Platos".
- Se o Tomador/Sacado for "EDITORA E DISTRIBUIDORA EDUCACIONAL S/A" (CNPJ 38.733.648/0001-40) -> bu = "Editora" (apenas "Editora").
- Se o Tomador/Sacado for "SABER..." -> bu = "Saber".
- Se o Tomador/Sacado for "SOMOS..." / "VASTA..." -> bu = "Vasta".

4. EXTRAÇÃO DE PRODUTO E MARCA NAS LINHAS DE CAMPANHA DA FATURA OU NOME DO ARQUIVO (TUDO SEM ACENTO):
- Padrão Pipe ("c:...|p:...|b:..."), ex: "c:Facebook|p:Graduate|b:Mackenzie":
  • Se encontrar "p:Graduate", converta para produto = "Graduacao" (sem acento).
  • O valor após "b:" é a Marca (ex: "b:Mackenzie" -> marca = "Mackenzie").
- Padrão Underscore ("_"), ex: "grfp-008_fb_scl-adv_prim_grad_unid_aon_grad_ecomm_institucional_na_na_inscricoes":
  • "_grad_" significa produto = "Graduacao".
  • "_pos_" ou "_posgrad_" significa produto = "PosGrad".
  • "_tec_" significa produto = "Tecnico".
  • "_unid_" significa marca = "Uniderp".
  • "_anh_" significa marca = "Anhanguera".
  • "_pit_" ou "Pita_goras" significa marca = "Pitagoras".
  • "_unop_" significa marca = "Unopar".
  • "_unic_" significa marca = "Unic".
  • "_unime_" significa marca = "Unime".
  • "_fama_" significa marca = "Fama".
- Se o documento for uma NFS-e isolada da Editora (Uniderp, Pitagoras, Unic, Unopar, Unime, Fama) onde o produto não está impresso e não é conta de Livres/Prof/Tecnico, defina produto = "Graduacao".

5. REGRA OBRIGATÓRIA DE MÊS PARA NOTA FISCAL (NFS-e) DE GOOGLE E DEMAIS CAMPOS (TUDO SEM ACENTO):
- plataforma:
  • "DV360 Fee" (quando constar "577201594 Plataform" ou "DV360 Fee").
  • "DV360" (PRIORIDADE: SEMPRE que no corpo da NF/Fatura/Boleto constar "Display and Video 360", "Display & Video 360" ou "DV360", mesmo que o Prestador seja Google Brasil Internet Ltda., mude para "DV360").
  • "Meta" (quando o Prestador/Fornecedor for Facebook Serviços Online do Brasil Ltda).
  • "Google" (quando o Prestador/Fornecedor for Google Brasil Internet Ltda e NÃO for Display and Video 360).
  • "TikTok" (SEMPRE que o Prestador/Fornecedor/Beneficiário for "BYTEDANCE", ex: "BYTEDANCE BRASIL TECNOLOGIA LTDA" ou "ByteDance", mude para "TikTok").
- mesVeiculacao e dataEmissao:
  • ATENÇÃO — NOTA FISCAL (NFS-e) DE GOOGLE (ou DV360): O campo "mesVeiculacao" PRECISA SER LIDO OBRIGATORIAMENTE NA PARTE "EMITIDO EM" (ex: na linha "RPS Nº ... Série ..., emitido em DD/MM/AAAA" ou em Outras Informações "emitido em DD/MM/AAAA", ou no campo de emissão). Extraia essa data exata (DD/MM/AAAA) para "dataEmissao" e converta o mês dessa data por extenso em português para "mesVeiculacao" (ex: se "emitido em 30/09/2026" -> mesVeiculacao = "Setembro"; se "emitido em 15/10/2026" -> mesVeiculacao = "Outubro").
  • ATENÇÃO — BOLETO BANCÁRIO (tipoDocumento = "Boleto"): Leia o campo "Data do Documento" / "Data Documento" em "dataEmissao" (formato DD/MM/AAAA) e, para o campo "mesVeiculacao", coloque SEMPRE 1 MÊS ANTES da Data do Documento! Exemplo: se a Data do Documento for mês 11 (Novembro), considere mês 10 ("Outubro"); se a Data do Documento for mês 10 (Outubro), considere mês 09 ("Setembro"); se for mês 01 (Janeiro), considere mês 12 ("Dezembro").
  • Para os demais documentos (Meta, Faturas): extraia APENAS o nome do mês por extenso em português sem acento (ex: "Setembro", "Outubro", "Marco").
- numero: Número da Nota na NFS-e (ex: "146206970"), Número da Fatura/RPS na Fatura (ex: "534692"), ou Número do Documento/Fatura no Boleto (ex: "5705566190").
- valor: Valor Total formatado em padrão brasileiro (ex: "238.648,93").
- IMPORTANTE: Retorne TODOS os textos de campos e "sugestaoNome" 100% SEM ACENTOS e sem caracteres especiais (ex: "Graduacao", "PosGrad", "Tecnico", "Pitagoras", "Consideracao").

Máscara ativa: "${patternTemplate || '{tipo}-{plataforma}-{numero}-{mes_veiculacao}-{valor}-{bu}-{produto}-{marca}'}" (separador "${separator}").`;

    const selectedModel = fastMode
      ? 'gemini-3.1-flash-lite'
      : 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Pdf,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        temperature: 0,
        thinkingConfig: {
          thinkingLevel: fastMode ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW,
        },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primeiraPaginaEhNfsePrefeitura: {type: Type.BOOLEAN},
            primeiraPaginaEhFatura: {type: Type.BOOLEAN},
            primeiraPaginaEhBoleto: {type: Type.BOOLEAN},
            tipoDocumento: {type: Type.STRING},
            plataforma: {type: Type.STRING},
            numero: {type: Type.STRING},
            numeroNfseVinculada: {type: Type.STRING},
            numeroRpsOuFatura: {type: Type.STRING},
            contaAnuncios: {type: Type.STRING},
            dataEmissao: {type: Type.STRING},
            dataVencimento: {type: Type.STRING},
            mesVeiculacao: {type: Type.STRING},
            valor: {type: Type.STRING},
            bu: {type: Type.STRING},
            produto: {type: Type.STRING},
            marca: {type: Type.STRING},
            resumoCurto: {type: Type.STRING},
            sugestaoNome: {type: Type.STRING},
          },
          required: [
            'primeiraPaginaEhNfsePrefeitura',
            'primeiraPaginaEhFatura',
            'primeiraPaginaEhBoleto',
            'tipoDocumento',
            'plataforma',
            'numero',
            'numeroNfseVinculada',
            'numeroRpsOuFatura',
            'contaAnuncios',
            'dataEmissao',
            'dataVencimento',
            'mesVeiculacao',
            'valor',
            'bu',
            'produto',
            'marca',
            'resumoCurto',
            'sugestaoNome',
          ],
        },
      },
    });

    const rawText = response.text?.trim() || '{}';
    const parsed = JSON.parse(rawText);

    // Limpa eventuais strings como "Nao identificado" / "N/A" para que o vínculo com a Fatura do lote preencha os campos faltantes
    const cleanedMarcaFromAi = cleanMissingOrUnidentifiedField(parsed.marca);
    const cleanedProdutoFromAi = cleanMissingOrUnidentifiedField(
      parsed.produto
    );
    const cleanedPlataformaFromAi = cleanMissingOrUnidentifiedField(
      parsed.plataforma
    );
    const cleanedBuFromAi = cleanMissingOrUnidentifiedField(parsed.bu);
    const cleanedNumeroFromAi = cleanMissingOrUnidentifiedField(parsed.numero);
    const cleanedNfVinculadaFromAi = cleanMissingOrUnidentifiedField(
      parsed.numeroNfseVinculada
    );
    const cleanedRpsFromAi = cleanMissingOrUnidentifiedField(
      parsed.numeroRpsOuFatura
    );
    const cleanedContaFromAi = cleanMissingOrUnidentifiedField(
      parsed.contaAnuncios
    );
    const cleanedMesFromAi = cleanMissingOrUnidentifiedField(
      parsed.mesVeiculacao
    );

    const normalizedTipo = classifyDocumentPattern(parsed);
    const normalizedValor = normalizeCurrencyValue(
      cleanMissingOrUnidentifiedField(parsed.valor)
    );

    // 1. Cruzamento determinístico pelo ID da Conta de Anúncio (AdAccount) na memória
    const adAccountMatch = lookupAdAccountInDirectory(
      cleanedContaFromAi,
      `${parsed.resumoCurto || ''} ${originalName || ''}`
    );

    // 2. Decodificação determinística de nomenclaturas de campanha (_grad_unid_) e pistas no nome do arquivo
    const hints = decodeCampaignAndFilenameHints(
      `${parsed.resumoCurto || ''} ${parsed.sugestaoNome || ''} ${originalName || ''}`
    );

    const resolvedMarca = stripAccents(
      cleanedMarcaFromAi ||
        adAccountMatch?.marca ||
        hints.marca ||
        defaultContext?.marca ||
        ''
    );
    const resolvedPlataforma = stripAccents(
      normalizePlataformaField(
        adAccountMatch?.plataforma.startsWith('DV360')
          ? adAccountMatch.plataforma
          : cleanedPlataformaFromAi ||
              adAccountMatch?.plataforma ||
              hints.plataforma ||
              defaultContext?.plataforma ||
              '',
        `${parsed.resumoCurto || ''} ${parsed.sugestaoNome || ''} ${originalName || ''}`
      )
    );
    const resolvedBu = stripAccents(
      normalizeBuField(
        cleanedBuFromAi || adAccountMatch?.bu || defaultContext?.bu || '',
        resolvedMarca,
        `${parsed.resumoCurto || ''} ${originalName || ''}`
      )
    );

    // Regra especial para Nota Fiscal (NF) de Google ou DV360: ler o mês da parte "Emitido em" (dataEmissao)
    const isGoogleOrDvNf =
      normalizedTipo === 'NF' &&
      (resolvedPlataforma === 'Google' ||
        resolvedPlataforma.startsWith('DV360'));

    // Regra especial para Boleto: sempre considerar 1 mês antes da Data do Documento (dataEmissao)
    const isBoleto = normalizedTipo === 'Boleto';

    const monthFromEmissao = isGoogleOrDvNf
      ? extractMonthFromDateStringPtBr(parsed.dataEmissao, 0)
      : isBoleto
        ? extractMonthFromDateStringPtBr(parsed.dataEmissao, -1)
        : '';

    const normalizedMes = stripAccents(
      monthFromEmissao ||
        normalizeMonthFullNamePtBr(
          cleanedMesFromAi || defaultContext?.mesVeiculacao
        )
    );

    const rawProduto =
      cleanedProdutoFromAi ||
      adAccountMatch?.produto ||
      hints.produto ||
      defaultContext?.produto ||
      (!isBoleto && resolvedBu === 'Editora'
        ? 'Graduacao'
        : !isBoleto && resolvedBu === 'Platos'
          ? 'PosGrad'
          : '');
    const normalizedProduto = normalizeProdutoName(rawProduto);

    const normalizedSugestao = stripAccents(
      (parsed.sugestaoNome || originalName.replace(/\.pdf$/i, ''))
        .replace(/\bnao[\s_-]*identificad[oa]\b/gi, '')
        .replace(/\bgraduate\b/gi, 'Graduacao')
        .replace(/\bbytedance\b/gi, 'TikTok')
        .replace(/\bkroton\b/gi, 'Editora')
        .replace(/display\s*(?:and|&|e)\s*video\s*360/gi, 'DV360')
    );

    return NextResponse.json({
      extracted: {
        tipoDocumento: stripAccents(normalizedTipo),
        plataforma: resolvedPlataforma,
        numero: stripAccents(cleanedNumeroFromAi),
        numeroNfseVinculada: stripAccents(cleanedNfVinculadaFromAi),
        numeroRpsOuFatura: stripAccents(cleanedRpsFromAi),
        contaAnuncios: cleanedContaFromAi || adAccountMatch?.id || '',
        adAccountName: adAccountMatch?.accountName || '',
        dataEmissao: cleanMissingOrUnidentifiedField(parsed.dataEmissao),
        dataVencimento: cleanMissingOrUnidentifiedField(parsed.dataVencimento),
        mesVeiculacao: normalizedMes,
        valor: normalizedValor,
        bu: resolvedBu,
        produto: normalizedProduto,
        marca: resolvedMarca,
        resumoCurto: parsed.resumoCurto || 'Documento PDF processado via IA',
        sugestaoNome: normalizedSugestao,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Falha ao analisar o PDF com Inteligência Artificial.';
    return NextResponse.json({error: message}, {status: 500});
  }
}
