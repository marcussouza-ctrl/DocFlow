export type MandatoryFieldKey =
  | 'tipoDocumento'
  | 'plataforma'
  | 'numero'
  | 'mesVeiculacao'
  | 'valor'
  | 'bu'
  | 'produto'
  | 'marca';

export const MANDATORY_FIELD_DEFINITIONS: {
  key: MandatoryFieldKey;
  token: string;
  label: string;
  shortLabel: string;
  placeholder: string;
}[] = [
  {
    key: 'tipoDocumento',
    token: '{tipo}',
    label: 'Tipo de Documento',
    shortLabel: 'Tipo',
    placeholder: 'Ex: NF, Fatura, Boleto, PI',
  },
  {
    key: 'plataforma',
    token: '{plataforma}',
    label: 'Plataforma / Veículo',
    shortLabel: 'Plataforma',
    placeholder: 'Ex: Meta, Google, TikTok',
  },
  {
    key: 'numero',
    token: '{numero}',
    label: 'Número Principal (NF / Fatura / Doc)',
    shortLabel: 'Número',
    placeholder: 'Ex: 146202369, 529929, 5705566190',
  },
  {
    key: 'mesVeiculacao',
    token: '{mes_veiculacao}',
    label: 'Mês de Veiculação (Por Extenso)',
    shortLabel: 'Mês Veic.',
    placeholder: 'Ex: Setembro, Outubro',
  },
  {
    key: 'valor',
    token: '{valor}',
    label: 'Valor Total (R$)',
    shortLabel: 'Valor',
    placeholder: 'Ex: 83.484,20',
  },
  {
    key: 'bu',
    token: '{bu}',
    label: 'BU (Tomador / Sacado)',
    shortLabel: 'BU',
    placeholder: 'Ex: Platos, Kroton, Vasta, Saber',
  },
  {
    key: 'produto',
    token: '{produto}',
    label: 'Produto (ex: Graduação)',
    shortLabel: 'Produto',
    placeholder: 'Ex: Graduação, Pós-Graduação, Livres',
  },
  {
    key: 'marca',
    token: '{marca}',
    label: 'Marca (ex: b:Mackenzie)',
    shortLabel: 'Marca',
    placeholder: 'Ex: Mackenzie, Anhanguera, Anglo',
  },
];

export const EXTRA_TOKEN_DEFINITIONS: {
  token: string;
  label: string;
}[] = [
  {token: '{nf_vinculada}', label: 'Nº NFS-e Vinculada'},
  {token: '{rps_fatura}', label: 'Nº RPS / Fatura'},
  {token: '{conta}', label: 'Conta de Anúncios (AdAccount)'},
  {token: '{vencimento}', label: 'Data de Vencimento'},
];

export interface AdAccountEntry {
  id: string;
  accountName: string;
  escopo: 'EXT' | 'IN';
  plataformaSigla: 'GA' | 'FB' | 'DV' | 'TT';
  plataforma: 'Google' | 'Meta' | 'DV360' | 'DV360 Fee' | 'TikTok';
  marca: string;
  produto: string;
  bu?: string;
}

/**
 * Tabela oficial das Contas de Anúncio (Google & Meta) para consulta e cruzamento automático por ID (AdAccount).
 */
export const AD_ACCOUNT_DIRECTORY: AdAccountEntry[] = [
  // Google (GA)
  {
    id: '6229390997',
    accountName: 'EXT | GA | ANHANGUERA | LIVRES',
    escopo: 'EXT',
    plataformaSigla: 'GA',
    plataforma: 'Google',
    marca: 'Anhanguera',
    produto: 'Livres',
    bu: 'Editora',
  },
  {
    id: '2461697933',
    accountName: 'EXT | GA | ANHANGUERA | PROF',
    escopo: 'EXT',
    plataformaSigla: 'GA',
    plataforma: 'Google',
    marca: 'Anhanguera',
    produto: 'Prof',
    bu: 'Editora',
  },
  {
    id: '3308992750',
    accountName: 'IN | GA | ANHANGUERA | TECNICO',
    escopo: 'IN',
    plataformaSigla: 'GA',
    plataforma: 'Google',
    marca: 'Anhanguera',
    produto: 'Tecnico',
    bu: 'Editora',
  },
  {
    id: '9132551823',
    accountName: 'EXT | GA | ANHANGUERA | TECNICO',
    escopo: 'EXT',
    plataformaSigla: 'GA',
    plataforma: 'Google',
    marca: 'Anhanguera',
    produto: 'Tecnico',
    bu: 'Editora',
  },
  {
    id: '7897306766',
    accountName: 'EXT | GA | MACKENZIE | POSGRAD',
    escopo: 'EXT',
    plataformaSigla: 'GA',
    plataforma: 'Google',
    marca: 'Mackenzie',
    produto: 'PosGrad',
    bu: 'Platos',
  },
  {
    id: '5559513692',
    accountName: 'EXT | GA | UMC | POSGRAD',
    escopo: 'EXT',
    plataformaSigla: 'GA',
    plataforma: 'Google',
    marca: 'UMC',
    produto: 'PosGrad',
    bu: 'Platos',
  },
  {
    id: '3723241349',
    accountName: 'EXT | GA | UPF | POSGRAD',
    escopo: 'EXT',
    plataformaSigla: 'GA',
    plataforma: 'Google',
    marca: 'UPF',
    produto: 'PosGrad',
    bu: 'Platos',
  },
  {
    id: '5278063742',
    accountName: 'EXT | GA | UTP | POSGRAD',
    escopo: 'EXT',
    plataformaSigla: 'GA',
    plataforma: 'Google',
    marca: 'UTP',
    produto: 'PosGrad',
    bu: 'Platos',
  },
  // Meta (FB)
  {
    id: '590352796038847',
    accountName: 'EXT | FB | ANHANGUERA | LIVRES',
    escopo: 'EXT',
    plataformaSigla: 'FB',
    plataforma: 'Meta',
    marca: 'Anhanguera',
    produto: 'Livres',
    bu: 'Editora',
  },
  {
    id: '1225955748924394',
    accountName: 'EXT | FB | ANHANGUERA | PROF',
    escopo: 'EXT',
    plataformaSigla: 'FB',
    plataforma: 'Meta',
    marca: 'Anhanguera',
    produto: 'Prof',
    bu: 'Editora',
  },
  {
    id: '953670416812558',
    accountName: 'EXT | FB | ANHANGUERA | TECNICO',
    escopo: 'EXT',
    plataformaSigla: 'FB',
    plataforma: 'Meta',
    marca: 'Anhanguera',
    produto: 'Tecnico',
    bu: 'Editora',
  },
  {
    id: '1063462275625969',
    accountName: 'IN | FB | ANHANGUERA | TECNICO.',
    escopo: 'IN',
    plataformaSigla: 'FB',
    plataforma: 'Meta',
    marca: 'Anhanguera',
    produto: 'Tecnico',
    bu: 'Editora',
  },
  {
    id: '394854253002344',
    accountName: 'EXT | FB | MACKENZIE | POSGRAD',
    escopo: 'EXT',
    plataformaSigla: 'FB',
    plataforma: 'Meta',
    marca: 'Mackenzie',
    produto: 'PosGrad',
    bu: 'Platos',
  },
  {
    id: '1045398269986927',
    accountName: 'EXT | FB | UMC | POSGRAD',
    escopo: 'EXT',
    plataformaSigla: 'FB',
    plataforma: 'Meta',
    marca: 'UMC',
    produto: 'PosGrad',
    bu: 'Platos',
  },
  {
    id: '716716590382666',
    accountName: 'EXT | FB | UTP | POSGRAD',
    escopo: 'EXT',
    plataformaSigla: 'FB',
    plataforma: 'Meta',
    marca: 'UTP',
    produto: 'PosGrad',
    bu: 'Platos',
  },
  {
    id: '891218699281892',
    accountName: 'EXT | FB | UPF | POSGRAD',
    escopo: 'EXT',
    plataformaSigla: 'FB',
    plataforma: 'Meta',
    marca: 'UPF',
    produto: 'PosGrad',
    bu: 'Platos',
  },
  {
    id: '847121826181253',
    accountName: 'EXT | FB | UNIDERP | GRADUACAO',
    escopo: 'EXT',
    plataformaSigla: 'FB',
    plataforma: 'Meta',
    marca: 'Uniderp',
    produto: 'Graduacao',
    bu: 'Editora',
  },
  {
    id: '540820733733109',
    accountName: 'EXT | FB | PITAGORAS | GRADUACAO',
    escopo: 'EXT',
    plataformaSigla: 'FB',
    plataforma: 'Meta',
    marca: 'Pitagoras',
    produto: 'Graduacao',
    bu: 'Editora',
  },
  {
    id: '843996726246005',
    accountName: 'EXT | FB | UNIC | GRADUACAO',
    escopo: 'EXT',
    plataformaSigla: 'FB',
    plataforma: 'Meta',
    marca: 'Unic',
    produto: 'Graduacao',
    bu: 'Editora',
  },
  // DV360 (DV)
  {
    id: '577201594 Plataform',
    accountName: 'IN | DV | GERAL | GRADUACAO',
    escopo: 'IN',
    plataformaSigla: 'DV',
    plataforma: 'DV360 Fee',
    marca: 'Consideracao',
    produto: 'Graduacao',
    bu: 'Editora',
  },
  {
    id: '577201594',
    accountName: 'IN | DV | GERAL | GRADUACAO',
    escopo: 'IN',
    plataformaSigla: 'DV',
    plataforma: 'DV360',
    marca: 'Consideracao',
    produto: 'Graduacao',
    bu: 'Editora',
  },
];

export function lookupAdAccountInDirectory(
  contaAnuncios: string | undefined,
  extraTextToScan = '',
  customDirectory: AdAccountEntry[] = AD_ACCOUNT_DIRECTORY
): AdAccountEntry | undefined {
  const rawTrimmed = (contaAnuncios || '').trim().toLowerCase();
  const fullContextLower = `${contaAnuncios || ''} ${extraTextToScan}`.toLowerCase();

  // 1. Match exato por ID alfanumérico (ex: "577201594 Plataform")
  if (rawTrimmed) {
    const exactAlpha = customDirectory.find(
      (entry) => entry.id.toLowerCase() === rawTrimmed
    );
    if (exactAlpha) return exactAlpha;
  }

  // 2. Caso específico "577201594 Plataform" (DV360 Fee) quando houver 577201594 + Plataform/Platform/Fee
  if (
    fullContextLower.includes('577201594') &&
    /\b(plataform|platform|fee)\b/i.test(fullContextLower)
  ) {
    const feeEntry = customDirectory.find(
      (entry) => entry.id.toLowerCase() === '577201594 plataform'
    );
    if (feeEntry) return feeEntry;
  }

  const digitsOnly = (contaAnuncios || '').replace(/\D/g, '');
  if (digitsOnly) {
    const exact = customDirectory.find((entry) => entry.id === digitsOnly);
    if (exact) return exact;
  }

  const combinedDigits = `${contaAnuncios || ''} ${extraTextToScan}`.replace(
    /[-.\s]/g,
    ''
  );
  for (const entry of customDirectory) {
    const entryDigits = entry.id.replace(/\D/g, '');
    if (
      entry.id === entryDigits &&
      entryDigits &&
      combinedDigits.includes(entryDigits)
    ) {
      return entry;
    }
  }

  return undefined;
}

/**
 * Converte razões sociais corporativas (ex: EDITORA E DISTRIBUIDORA EDUCACIONAL S/A -> Editora, PLATOS SOLUCOES EDUCACIONAIS -> Platos)
 * ou infere a BU a partir da Marca quando o campo BU vier vazio ou com a Razão Social por extenso.
 */
export function normalizeBuField(
  rawBu: string | undefined,
  marcaHint = '',
  extraContext = ''
): string {
  const combined = `${rawBu || ''} ${extraContext}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (rawBu) {
    const cleanBu = rawBu
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
    if (cleanBu === 'platos') return 'Platos';
    if (cleanBu === 'editora' || cleanBu === 'kroton') return 'Editora';
    if (cleanBu === 'vasta' || cleanBu === 'somos') return 'Vasta';
    if (cleanBu === 'saber') return 'Saber';
    if (cleanBu === 'cogna') return 'Cogna';
    if (
      cleanBu.includes('editora e distribuidora educacional') ||
      cleanBu.startsWith('editora') ||
      cleanBu.includes('38.733.648')
    ) {
      return 'Editora';
    }
    if (cleanBu.includes('platos solucoes')) {
      return 'Platos';
    }
  }

  if (
    combined.includes('editora e distribuidora educacional') ||
    combined.includes('38.733.648')
  ) {
    return 'Editora';
  }
  if (combined.includes('platos solucoes') || /\bplatos\b/i.test(combined)) {
    return 'Platos';
  }

  const cleanMarca = marcaHint
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (
    [
      'anhanguera',
      'uniderp',
      'pitagoras',
      'unopar',
      'unic',
      'unime',
      'fama',
    ].includes(cleanMarca)
  ) {
    return 'Editora';
  }
  if (['mackenzie', 'umc', 'upf', 'utp'].includes(cleanMarca)) {
    return 'Platos';
  }

  return rawBu?.trim() || '';
}

/**
 * Decodifica taxonomias de campanha com pipes (c:Facebook|p:Graduate|b:Mackenzie)
 * e com underscores (ex: grfp-008_fb_scl-adv_prim_grad_unid_aon_grad_ecomm_...),
 * além de dicas presentes no nome do arquivo (incluindo nomes onde acentos viraram '_', ex: Pita_goras).
 */
export function decodeCampaignAndFilenameHints(text: string): {
  marca?: string;
  produto?: string;
  plataforma?: string;
} {
  if (!text) return {};
  const clean = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  let marca: string | undefined;
  let produto: string | undefined;
  let plataforma: string | undefined;

  // Marca por taxonomia de campanha (_unid_, _anh_, b:Mackenzie) ou nome (incluindo Pita_goras)
  if (/(?:^|[_|\s-])(unid|uniderp)(?:$|[_|\s-])/i.test(clean)) {
    marca = 'Uniderp';
  } else if (/(?:^|[_|\s-])(anh|anhang|anhanguera)(?:$|[_|\s-])/i.test(clean)) {
    marca = 'Anhanguera';
  } else if (/(?:^|[_|\s-]|b:)(mack|mackenzie)(?:$|[_|\s-])/i.test(clean)) {
    marca = 'Mackenzie';
  } else if (
    /(?:^|[_|\s-])(pit|pita[_-]?goras|pitagoras)(?:$|[_|\s-])/i.test(clean)
  ) {
    marca = 'Pitagoras';
  } else if (/(?:^|[_|\s-])(unop|unopar)(?:$|[_|\s-])/i.test(clean)) {
    marca = 'Unopar';
  } else if (/(?:^|[_|\s-])(unic)(?:$|[_|\s-])/i.test(clean)) {
    marca = 'Unic';
  } else if (/(?:^|[_|\s-])(unime)(?:$|[_|\s-])/i.test(clean)) {
    marca = 'Unime';
  } else if (/(?:^|[_|\s-])(fama)(?:$|[_|\s-])/i.test(clean)) {
    marca = 'Fama';
  } else if (/(?:^|[_|\s-])(umc)(?:$|[_|\s-])/i.test(clean)) {
    marca = 'UMC';
  } else if (/(?:^|[_|\s-])(upf)(?:$|[_|\s-])/i.test(clean)) {
    marca = 'UPF';
  } else if (/(?:^|[_|\s-])(utp)(?:$|[_|\s-])/i.test(clean)) {
    marca = 'UTP';
  } else if (/(?:^|[_|\s-])(consideracao|considerac[_-]?ao)(?:$|[_|\s-])/i.test(clean)) {
    marca = 'Consideracao';
  }

  // Produto por taxonomia de campanha (_grad_, p:Graduate, _posgrad_, _tec_, _livres_, _prof_)
  if (
    /(?:^|[_|\s-]|p:)(posgrad|pos[_-]?graduacao|pos)(?:$|[_|\s-])/i.test(clean)
  ) {
    produto = 'PosGrad';
  } else if (
    /(?:^|[_|\s-]|p:)(grad|graduate|graduac[_-]?ao|graduacao)(?:$|[_|\s-])/i.test(
      clean
    )
  ) {
    produto = 'Graduacao';
  } else if (/(?:^|[_|\s-]|p:)(tec|tecnico|te[_-]?cnico)(?:$|[_|\s-])/i.test(clean)) {
    produto = 'Tecnico';
  } else if (/(?:^|[_|\s-]|p:)(livres)(?:$|[_|\s-])/i.test(clean)) {
    produto = 'Livres';
  } else if (
    /(?:^|[_|\s-]|p:)(prof|profissionalizante)(?:$|[_|\s-])/i.test(clean)
  ) {
    produto = 'Prof';
  }

  // Se o PDF for uma NFS-e isolada de marcas regionais de Graduação da Editora (Uniderp, Pitagoras, Unic, Unopar, Unime, Fama) e não tiver outro produto explícito:
  if (
    !produto &&
    marca &&
    ['Uniderp', 'Pitagoras', 'Pitágoras', 'Unic', 'Unopar', 'Unime', 'Fama', 'Consideracao', 'Consideração'].includes(marca)
  ) {
    produto = 'Graduacao';
  } else if (
    !produto &&
    marca &&
    ['Mackenzie', 'UMC', 'UPF', 'UTP'].includes(marca)
  ) {
    produto = 'PosGrad';
  }

  if (
    /\bdv\s*360\s*fee\b/i.test(clean) ||
    (/577201594/.test(clean) && /\b(plataform|platform|fee)\b/i.test(clean))
  ) {
    plataforma = 'DV360 Fee';
  } else if (
    /(?:display\s*(?:and|&|e)\s*video\s*360|\bdv\s*360\b)/i.test(clean)
  ) {
    plataforma = 'DV360';
  } else if (
    /(?:^|[_|\s-])(bytedance|byte\s*dance|tiktok|tik\s*tok|tt)(?:$|[_|\s-])/i.test(
      clean
    )
  ) {
    plataforma = 'TikTok';
  } else if (/(?:^|[_|\s-])(meta|facebook|fb)(?:$|[_|\s-])/i.test(clean)) {
    plataforma = 'Meta';
  } else if (/(?:^|[_|\s-])(google|ga)(?:$|[_|\s-])/i.test(clean)) {
    plataforma = 'Google';
  }

  return {marca, produto, plataforma};
}

/**
 * Normaliza o nome da Plataforma / Fornecedor:
 * - "577201594 Plataform" / "DV360 Fee" -> "DV360 Fee"
 * - "Display and Video 360" / "Display & Video 360" / "DV360" -> "DV360" (prioridade sobre Google)
 * - "BYTEDANCE" / "BYTEDANCE BRASIL TECNOLOGIA LTDA" / "ByteDance" -> "TikTok"
 * - "FACEBOOK" / "FACEBOOK SERVICOS ONLINE" / "Meta" -> "Meta"
 * - "GOOGLE" / "GOOGLE BRASIL INTERNET LTDA" -> "Google"
 */
export function normalizePlataformaField(
  rawPlataforma: string | undefined,
  extraContext = ''
): string {
  const cleanRaw = (rawPlataforma || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  const cleanCombined = `${rawPlataforma || ''} ${extraContext}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  // Prioridade 1: DV360 Fee ("577201594 Plataform" ou "DV360 Fee")
  if (
    /\bdv\s*360\s*fee\b/i.test(cleanRaw) ||
    /\bdv\s*360\s*fee\b/i.test(cleanCombined) ||
    (/577201594/.test(cleanCombined) &&
      /\b(plataform|platform|fee)\b/i.test(cleanCombined))
  ) {
    return 'DV360 Fee';
  }

  // Prioridade 2: se constar "Display and Video 360", "Display & Video 360" ou "DV360" na plataforma ou no contexto da NF/Fatura
  if (
    /(?:display\s*(?:and|&|e)\s*video\s*360|\bdv\s*360\b)/i.test(cleanRaw) ||
    /(?:display\s*(?:and|&|e)\s*video\s*360|\bdv\s*360\b)/i.test(cleanCombined)
  ) {
    return 'DV360';
  }

  if (
    cleanRaw.includes('bytedance') ||
    cleanRaw.includes('byte dance') ||
    cleanRaw.includes('tiktok') ||
    cleanRaw.includes('tik tok')
  ) {
    return 'TikTok';
  }
  if (cleanRaw.includes('facebook') || cleanRaw === 'meta' || cleanRaw === 'fb') {
    return 'Meta';
  }
  if (cleanRaw.includes('google') || cleanRaw === 'ga') {
    return 'Google';
  }

  if (
    cleanCombined.includes('bytedance') ||
    cleanCombined.includes('byte dance')
  ) {
    return 'TikTok';
  }

  return rawPlataforma?.trim() || '';
}

export interface ExtractedPdfMetadata {
  tipoDocumento: string;
  plataforma: string;
  numero: string;
  numeroNfseVinculada?: string;
  numeroRpsOuFatura?: string;
  contaAnuncios?: string;
  adAccountName?: string;
  dataEmissao?: string;
  dataVencimento?: string;
  mesVeiculacao: string;
  valor: string;
  bu: string;
  produto: string;
  marca: string;
  resumoCurto: string;
  sugestaoNome: string;
  crossLinkedFrom?: string;
}

export interface DocumentTypeNamingRule {
  docType: string;
  label: string;
  description: string;
  patternTemplate: string;
  requiredFields: MandatoryFieldKey[];
}

export const DEFAULT_DOC_TYPE_RULES: DocumentTypeNamingRule[] = [
  {
    docType: 'NF',
    label: 'Nota Fiscal Eletrônica (NFS-e Prefeitura)',
    description:
      'Padrão NFS-e Municipal (ex: Prefeitura SP): extrai Nº da Nota (146202369), RPS (529929), Prestador (Meta/Google), Tomador (Platos) e cruza Produto/Marca com a Fatura do lote',
    patternTemplate:
      '{tipo}-{plataforma}-{numero}-{mes_veiculacao}-{valor}-{bu}-{produto}-{marca}',
    requiredFields: [
      'tipoDocumento',
      'plataforma',
      'numero',
      'mesVeiculacao',
      'valor',
      'bu',
      'produto',
      'marca',
    ],
  },
  {
    docType: 'Fatura',
    label: 'Fatura / Invoice de Plataforma (ex: Fatura Meta)',
    description:
      'Padrão Fatura Detalhada: lê o Período de Veiculação (Setembro), Nº Fatura/RPS (529929), NFS-e vinculada e decodifica Produto (p:Graduate → Graduação) e Marca (b:Mackenzie)',
    patternTemplate:
      '{tipo}-{plataforma}-{numero}-{mes_veiculacao}-{valor}-{bu}-{produto}-{marca}',
    requiredFields: [
      'tipoDocumento',
      'plataforma',
      'numero',
      'mesVeiculacao',
      'valor',
      'bu',
      'produto',
      'marca',
    ],
  },
  {
    docType: 'Boleto',
    label: 'Boleto Bancário (ex: Itaú Google / BofA Meta)',
    description:
      'Padrão Boleto: identifica Cedente (Google/Meta), Sacado (Platos), Valor e extrai Nº da Fatura e Nº da Nota citados no quadro de Instruções do boleto',
    patternTemplate:
      '{tipo}-{plataforma}-{numero}-{mes_veiculacao}-{valor}-{bu}-{produto}-{marca}',
    requiredFields: [
      'tipoDocumento',
      'plataforma',
      'numero',
      'valor',
      'bu',
    ],
  },
  {
    docType: 'PI',
    label: 'Pedido de Inserção (PI)',
    description:
      'Padrão de mídia para Pedidos de Inserção vinculando BU, Marca, Produto, Plataforma, Mês de Veiculação, Nº PI e Valor',
    patternTemplate:
      '{tipo}-{plataforma}-{numero}-{mes_veiculacao}-{valor}-{bu}-{produto}-{marca}',
    requiredFields: [
      'tipoDocumento',
      'plataforma',
      'numero',
      'mesVeiculacao',
      'valor',
      'bu',
      'produto',
      'marca',
    ],
  },
  {
    docType: 'Contrato',
    label: 'Contrato / Aditivo Comercial',
    description:
      'Padrão jurídico-comercial identificando BU, Marca, Plataforma/Fornecedor, Número e Valor',
    patternTemplate:
      '{tipo}-{bu}-{marca}-{produto}-{plataforma}-{numero}-{mes_veiculacao}-{valor}',
    requiredFields: [
      'tipoDocumento',
      'plataforma',
      'numero',
      'bu',
      'marca',
    ],
  },
];

export interface PdfBatchItem {
  id: string;
  file: File;
  originalName: string;
  originalBaseName: string;
  sizeBytes: number;
  lastModified: number;
  previewUrl: string;
  extractedData?: ExtractedPdfMetadata;
  customName?: string;
  status: 'idle' | 'analyzing' | 'ready' | 'error';
  errorMessage?: string;
  downloadedCount: number;
}

export type RenameMode = 'ai' | 'regex' | 'hybrid';

export type CaseTransform =
  | 'preserve'
  | 'lowercase'
  | 'uppercase'
  | 'titlecase'
  | 'kebab'
  | 'snake';

export interface RenameConfig {
  mode: RenameMode;
  usePerDocTypeRules: boolean;
  enableCrossLinking: boolean; // Cross-links NF, Fatura & Boleto in the same batch by RPS/NF/AdAccount/Valor
  docTypeRules: DocumentTypeNamingRule[];
  aiTemplate: string;
  aiCustomInstruction: string;
  aiSeparator: '_' | '-' | ' ';
  defaultBu: string;
  defaultMarca: string;
  defaultProduto: string;
  defaultMesVeiculacao: string;
  findPattern: string;
  replaceWith: string;
  useRegex: boolean;
  caseSensitive: boolean;
  prefix: string;
  suffix: string;
  sequenceMode: 'none' | 'prefix' | 'suffix';
  sequenceStart: number;
  sequencePadding: number;
  caseTransform: CaseTransform;
  removeAccents: boolean;
}

export interface SavedRulePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  config: Partial<RenameConfig>;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  originalName: string;
  finalName: string;
  modeUsed: RenameMode;
  sizeBytes: number;
}

export const DEFAULT_RENAME_CONFIG: RenameConfig = {
  mode: 'ai',
  usePerDocTypeRules: true,
  enableCrossLinking: true,
  docTypeRules: DEFAULT_DOC_TYPE_RULES,
  aiTemplate:
    '{tipo}-{plataforma}-{numero}-{mes_veiculacao}-{valor}-{bu}-{produto}-{marca}',
  aiCustomInstruction:
    'Reconheça automaticamente os 3 layouts: NFS-e Prefeitura (NF), Fatura de Plataforma com taxonomia c:|p:|b: (Fatura) e Boleto Bancário com instruções de Fatura/Nota (Boleto).',
  aiSeparator: '-',
  defaultBu: '',
  defaultMarca: '',
  defaultProduto: '',
  defaultMesVeiculacao: '',
  findPattern: '',
  replaceWith: '',
  useRegex: true,
  caseSensitive: false,
  prefix: '',
  suffix: '',
  sequenceMode: 'none',
  sequenceStart: 1,
  sequencePadding: 3,
  caseTransform: 'preserve',
  removeAccents: true,
};

export const BUILTIN_PRESETS: SavedRulePreset[] = [
  {
    id: 'preset-midia-completo',
    name: 'Padrão Corporativo 8 Campos (NF / Fatura / Boleto)',
    category: 'Mídia & Controladoria',
    description:
      'Tipo-Plataforma-Numero-MesVeiculacao-Valor-BU-Produto-Marca.pdf com cruzamento inteligente entre Fatura e NFS-e',
    config: {
      mode: 'ai',
      usePerDocTypeRules: true,
      enableCrossLinking: true,
      aiTemplate:
        '{tipo}-{plataforma}-{numero}-{mes_veiculacao}-{valor}-{bu}-{produto}-{marca}',
      aiSeparator: '-',
      removeAccents: true,
    },
  },
  {
    id: 'preset-conciliacao-nf-rps',
    name: 'Conciliação Fiscal (Inclui Nº NFS-e + Nº Fatura/RPS)',
    category: 'Fiscal & Tributário',
    description:
      'Ideal para cruzar NFS-e da Prefeitura e Fatura Meta: Tipo-Plataforma-NF-RPS-MesVeiculacao-Valor-BU-Marca',
    config: {
      mode: 'ai',
      usePerDocTypeRules: false,
      enableCrossLinking: true,
      aiTemplate:
        '{tipo}-{plataforma}-NF{nf_vinculada}-FAT{rps_fatura}-{mes_veiculacao}-{valor}-{bu}-{produto}-{marca}',
      aiSeparator: '-',
      removeAccents: true,
    },
  },
  {
    id: 'preset-bu-primeiro',
    name: 'Agrupado por BU, Marca e Produto (Platos / Editora)',
    category: 'Estrutura de Pastas',
    description:
      'Inicia pela estrutura organizacional: BU-Marca-Produto-Tipo-Plataforma-MesVeiculacao-Numero-Valor',
    config: {
      mode: 'ai',
      usePerDocTypeRules: false,
      enableCrossLinking: true,
      aiTemplate:
        '{bu}-{marca}-{produto}-{tipo}-{plataforma}-{mes_veiculacao}-{numero}-{valor}',
      aiSeparator: '-',
      removeAccents: true,
    },
  },
];

export function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function sanitizeFilenameBase(
  name: string,
  removeAccentsFlag = true
): string {
  let cleaned = name.replace(/\.pdf$/i, '').trim();
  if (removeAccentsFlag) {
    cleaned = stripAccents(cleaned);
  }
  cleaned = stripAccents(cleaned);
  cleaned = cleaned.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned || 'documento_renomeado';
}

export function applyCaseTransform(
  input: string,
  transform: CaseTransform
): string {
  switch (transform) {
    case 'lowercase':
      return input.toLowerCase();
    case 'uppercase':
      return input.toUpperCase();
    case 'titlecase':
      return input
        .toLowerCase()
        .replace(/(?:^|\s|_|-)(\S)/g, (match) => match.toUpperCase());
    case 'kebab':
      return stripAccents(input)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    case 'snake':
      return stripAccents(input)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    case 'preserve':
    default:
      return input;
  }
}

export function normalizeCanonicalDocType(
  rawTipo: string | undefined,
  fallbackText = ''
): string {
  const cleanTipo = stripAccents(rawTipo || '').trim().toLowerCase();
  const cleanFallback = stripAccents(fallbackText).toLowerCase();

  if (
    cleanTipo === 'boleto' ||
    cleanTipo.startsWith('bol') ||
    /\b(boleto|linha digitavel|ficha de compensacao)\b/i.test(cleanTipo)
  ) {
    return 'Boleto';
  }

  if (
    cleanTipo === 'fatura' ||
    cleanTipo.startsWith('fat') ||
    /\b(fatura|invoice)\b/i.test(cleanTipo)
  ) {
    return 'Fatura';
  }

  if (
    cleanTipo === 'nf' ||
    cleanTipo === 'nfs-e' ||
    cleanTipo === 'nfse' ||
    cleanTipo.includes('nota fiscal')
  ) {
    return 'NF';
  }

  if (cleanTipo === 'pi' || cleanTipo.includes('insercao')) {
    return 'PI';
  }
  if (cleanTipo.includes('contrato') || cleanTipo.includes('aditivo')) {
    return 'Contrato';
  }

  if (/\b(boleto)\b/i.test(cleanFallback)) return 'Boleto';
  if (/\b(fatura|invoice)\b/i.test(cleanFallback)) return 'Fatura';

  return rawTipo?.trim() || '';
}

export function findMatchingDocTypeRule(
  tipoDocumento: string | undefined,
  rules: DocumentTypeNamingRule[]
): DocumentTypeNamingRule | undefined {
  if (!tipoDocumento) return rules[0];
  const canonical = normalizeCanonicalDocType(tipoDocumento);
  const normalized = stripAccents(canonical).toLowerCase().trim();

  const exact = rules.find(
    (r) => stripAccents(r.docType).toLowerCase() === normalized
  );
  if (exact) return exact;

  if (normalized.includes('boleto') || normalized.includes('comprovante')) {
    return rules.find((r) => r.docType === 'Boleto') || rules[0];
  }
  if (normalized.includes('fatura') || normalized.includes('invoice')) {
    return rules.find((r) => r.docType === 'Fatura') || rules[0];
  }
  if (normalized.includes('nota') || normalized.includes('nf')) {
    return rules.find((r) => r.docType === 'NF') || rules[0];
  }
  if (normalized.includes('pi') || normalized.includes('insercao')) {
    return rules.find((r) => r.docType === 'PI') || rules[0];
  }
  if (normalized.includes('contrato') || normalized.includes('aditivo')) {
    return rules.find((r) => r.docType === 'Contrato') || rules[0];
  }

  return rules[0];
}

/**
/**
 * Limpa valores genéricos que a IA eventualmente retorna quando não encontra um campo
 * (ex: "Não identificado", "Nao identificado", "N/A", "Não informado", "Desconhecido", "---")
 * para que fiquem vazios ("") e acionem o vínculo automático com a Fatura do lote.
 */
export function cleanMissingOrUnidentifiedField(
  raw: string | undefined
): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const norm = stripAccents(trimmed)
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    !norm ||
    norm === 'nao identificado' ||
    norm === 'nao identificada' ||
    norm === 'nao informado' ||
    norm === 'nao informada' ||
    norm === 'nao encontrado' ||
    norm === 'nao consta' ||
    norm === 'sem identificacao' ||
    norm === 'sem marca' ||
    norm === 'sem produto' ||
    norm === 'sem bu' ||
    norm === 'sem plataforma' ||
    norm === 'desconhecido' ||
    norm === 'indefinido' ||
    norm === 'n/a' ||
    norm === 'na' ||
    norm === 'null' ||
    norm === 'undefined' ||
    norm === 'none' ||
    /^[-.]+$/.test(norm)
  ) {
    return '';
  }

  return trimmed;
}

function preEnrichSingleMetadata(
  item: PdfBatchItem
): ExtractedPdfMetadata | undefined {
  if (!item.extractedData) return undefined;
  const ext: ExtractedPdfMetadata = {
    ...item.extractedData,
    tipoDocumento: cleanMissingOrUnidentifiedField(
      item.extractedData.tipoDocumento
    ),
    plataforma: cleanMissingOrUnidentifiedField(item.extractedData.plataforma),
    numero: cleanMissingOrUnidentifiedField(item.extractedData.numero),
    numeroNfseVinculada: cleanMissingOrUnidentifiedField(
      item.extractedData.numeroNfseVinculada
    ),
    numeroRpsOuFatura: cleanMissingOrUnidentifiedField(
      item.extractedData.numeroRpsOuFatura
    ),
    contaAnuncios: cleanMissingOrUnidentifiedField(
      item.extractedData.contaAnuncios
    ),
    mesVeiculacao: cleanMissingOrUnidentifiedField(
      item.extractedData.mesVeiculacao
    ),
    valor: cleanMissingOrUnidentifiedField(item.extractedData.valor),
    bu: cleanMissingOrUnidentifiedField(item.extractedData.bu),
    produto: cleanMissingOrUnidentifiedField(item.extractedData.produto),
    marca: cleanMissingOrUnidentifiedField(item.extractedData.marca),
  };

  // 1. Consulta a Tabela de Contas de Anúncio (AdAccount) na memória
  const matchedAccount = lookupAdAccountInDirectory(
    ext.contaAnuncios,
    `${ext.resumoCurto || ''} ${item.originalName}`
  );
  if (matchedAccount) {
    ext.adAccountName = matchedAccount.accountName;
    if (!ext.contaAnuncios) {
      ext.contaAnuncios = matchedAccount.id;
    }
    if (!ext.marca) {
      ext.marca = matchedAccount.marca;
    }
    if (!ext.produto) {
      ext.produto = matchedAccount.produto;
    }
    if (!ext.plataforma || matchedAccount.plataforma.startsWith('DV360')) {
      ext.plataforma = matchedAccount.plataforma;
    }
    if (!ext.bu && matchedAccount.bu) {
      ext.bu = matchedAccount.bu;
    }
  }

  // 1.5. Decodifica dicas da taxonomia de campanha (_grad_unid_, b:Mackenzie, etc.) ou do nome do arquivo original
  const hints = decodeCampaignAndFilenameHints(
    `${ext.resumoCurto || ''} ${ext.sugestaoNome || ''} ${item.originalName}`
  );
  if (!ext.marca && hints.marca) {
    ext.marca = hints.marca;
  }
  if (!ext.produto && hints.produto) {
    ext.produto = hints.produto;
  }
  if (!ext.plataforma && hints.plataforma) {
    ext.plataforma = hints.plataforma;
  }

  ext.plataforma = normalizePlataformaField(
    ext.plataforma,
    `${ext.resumoCurto || ''} ${ext.sugestaoNome || ''} ${item.originalName}`
  );

  ext.bu = normalizeBuField(
    ext.bu,
    ext.marca,
    `${ext.resumoCurto || ''} ${item.originalName}`
  );

  return ext;
}

/**
 * Faz o cruzamento inteligente (Cross-Linking) entre documentos do mesmo lote:
 * Especialmente para Boletos (ou NFs) que ficaram com algum campo não identificado,
 * procura automaticamente Faturas (e NFs) no lote para vincular todos os dados faltantes.
 */
export function enrichItemFromBatchSiblings(
  item: PdfBatchItem,
  allItems: PdfBatchItem[],
  enableCrossLinking: boolean
): ExtractedPdfMetadata | undefined {
  const ext = preEnrichSingleMetadata(item);
  if (!ext) return undefined;

  if (!enableCrossLinking) return ext;

  const canonicalMyTipo = normalizeCanonicalDocType(
    ext.tipoDocumento,
    `${ext.resumoCurto || ''} ${item.originalName}`
  );
  const isBoleto = canonicalMyTipo === 'Boleto';

  const hasAllFields =
    Boolean(ext.plataforma) &&
    Boolean(ext.numero) &&
    Boolean(ext.mesVeiculacao) &&
    Boolean(ext.valor) &&
    Boolean(ext.bu) &&
    Boolean(ext.produto) &&
    Boolean(ext.marca);

  if (hasAllFields && (!isBoleto || Boolean(ext.numeroNfseVinculada))) {
    return ext;
  }

  const normalizeToken = (s: string | undefined) =>
    stripAccents(cleanMissingOrUnidentifiedField(s))
      .replace(/^0+/, '')
      .trim()
      .toLowerCase();

  const myIdTokens = new Set(
    [
      ext.numero,
      ext.numeroNfseVinculada,
      ext.numeroRpsOuFatura,
      ext.contaAnuncios,
    ]
      .map(normalizeToken)
      .filter((s) => s.length >= 3)
  );

  const myNumericValor = parseBrazilianCurrencyToNumber(ext.valor);
  const mySearchableText = stripAccents(
    `${ext.resumoCurto || ''} ${ext.sugestaoNome || ''} ${item.originalName}`
  ).toLowerCase();

  // Pré-enriquece os candidatos do lote e prioriza Faturas primeiro (especialmente quando o item atual é um Boleto)
  const candidates = allItems
    .filter((other) => other.id !== item.id && Boolean(other.extractedData))
    .map((other) => {
      const oExt = preEnrichSingleMetadata(other)!;
      const oTipo = normalizeCanonicalDocType(
        oExt.tipoDocumento,
        `${oExt.resumoCurto || ''} ${other.originalName}`
      );
      return {other, oExt, oTipo};
    })
    .sort((a, b) => {
      const rank = (t: string) => (t === 'Fatura' ? 0 : t === 'NF' ? 1 : 2);
      return rank(a.oTipo) - rank(b.oTipo);
    });

  const applyEnrichmentFromCandidate = (
    oExt: ExtractedPdfMetadata,
    sourceName: string
  ) => {
    let enriched = false;
    if (!ext.plataforma && oExt.plataforma) {
      ext.plataforma = oExt.plataforma;
      enriched = true;
    }
    if (!ext.numero && (oExt.numeroRpsOuFatura || oExt.numero)) {
      ext.numero = oExt.numeroRpsOuFatura || oExt.numero;
      enriched = true;
    }
    if (!ext.produto && oExt.produto) {
      ext.produto = oExt.produto;
      enriched = true;
    }
    if (!ext.marca && oExt.marca) {
      ext.marca = oExt.marca;
      enriched = true;
    }
    if (!ext.mesVeiculacao && oExt.mesVeiculacao) {
      ext.mesVeiculacao = oExt.mesVeiculacao;
      enriched = true;
    }
    if (!ext.bu && oExt.bu) {
      ext.bu = oExt.bu;
      enriched = true;
    }
    if (!ext.valor && oExt.valor) {
      ext.valor = oExt.valor;
      enriched = true;
    }
    if (!ext.numeroNfseVinculada && (oExt.numeroNfseVinculada || oExt.numero)) {
      ext.numeroNfseVinculada =
        oExt.numeroNfseVinculada ||
        (normalizeCanonicalDocType(oExt.tipoDocumento) === 'NF'
          ? oExt.numero
          : '');
      if (ext.numeroNfseVinculada) enriched = true;
    }
    if (!ext.numeroRpsOuFatura && (oExt.numeroRpsOuFatura || oExt.numero)) {
      ext.numeroRpsOuFatura = oExt.numeroRpsOuFatura || oExt.numero;
      enriched = true;
    }
    if (!ext.contaAnuncios && oExt.contaAnuncios) {
      ext.contaAnuncios = oExt.contaAnuncios;
      if (oExt.adAccountName) ext.adAccountName = oExt.adAccountName;
      enriched = true;
    }
    if (enriched && !ext.crossLinkedFrom) {
      ext.crossLinkedFrom = sourceName;
    }
  };

  // Passada 1: Vínculo forte por Número da Fatura/RPS, Nº da NF, Conta de Anúncio ou Valor Exato
  for (const {other, oExt} of candidates) {
    const otherIdTokens = [
      oExt.numero,
      oExt.numeroNfseVinculada,
      oExt.numeroRpsOuFatura,
      oExt.contaAnuncios,
    ]
      .map(normalizeToken)
      .filter((s) => s.length >= 3);

    const hasDirectTokenMatch = otherIdTokens.some((t) => myIdTokens.has(t));

    const otherText = stripAccents(
      `${oExt.resumoCurto || ''} ${oExt.sugestaoNome || ''} ${other.originalName}`
    ).toLowerCase();

    const hasSubstringTokenMatch =
      otherIdTokens.some((t) => t.length >= 4 && mySearchableText.includes(t)) ||
      Array.from(myIdTokens).some(
        (t) => t.length >= 4 && otherText.includes(t)
      );

    const otherNumericValor = parseBrazilianCurrencyToNumber(oExt.valor);
    const hasExactValueMatch =
      myNumericValor > 0 &&
      otherNumericValor > 0 &&
      Math.abs(myNumericValor - otherNumericValor) < 0.01;

    if (hasDirectTokenMatch || hasSubstringTokenMatch || hasExactValueMatch) {
      applyEnrichmentFromCandidate(oExt, other.originalName);
    }
  }

  // Passada 2 (Específica para Boleto com campos ainda não identificados):
  // Procura Faturas no lote com mesmo vencimento, mesma plataforma ou única Fatura disponível no lote
  if (
    isBoleto &&
    (!ext.marca || !ext.produto || !ext.bu || !ext.plataforma || !ext.numero)
  ) {
    const faturasInBatch = candidates.filter((c) => c.oTipo === 'Fatura');

    for (const {other, oExt} of faturasInBatch) {
      const sameVencimento =
        Boolean(ext.dataVencimento) &&
        Boolean(oExt.dataVencimento) &&
        ext.dataVencimento?.trim() === oExt.dataVencimento?.trim();

      const samePlataforma =
        Boolean(ext.plataforma) &&
        Boolean(oExt.plataforma) &&
        ext.plataforma.toLowerCase() === oExt.plataforma.toLowerCase();

      if (sameVencimento || samePlataforma || faturasInBatch.length === 1) {
        applyEnrichmentFromCandidate(oExt, other.originalName);
      }
    }

    // Se ainda faltar marca/produto no Boleto e houver uma NF da mesma plataforma/valor no lote
    if (!ext.marca || !ext.produto || !ext.bu) {
      const nfsInBatch = candidates.filter((c) => c.oTipo === 'NF');
      for (const {other, oExt} of nfsInBatch) {
        const samePlataforma =
          Boolean(ext.plataforma) &&
          Boolean(oExt.plataforma) &&
          ext.plataforma.toLowerCase() === oExt.plataforma.toLowerCase();
        if (samePlataforma || nfsInBatch.length === 1) {
          applyEnrichmentFromCandidate(oExt, other.originalName);
        }
      }
    }
  }

  // Re-normaliza BU caso a Marca tenha acabado de ser herdada de uma Fatura
  if (ext.marca && !ext.bu) {
    ext.bu = normalizeBuField(
      ext.bu,
      ext.marca,
      `${ext.resumoCurto || ''} ${item.originalName}`
    );
  }

  return ext;
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

export function getCurrentMonthPtBr(): string {
  const monthIdx = new Date().getMonth();
  return PT_MONTHS_FULL[monthIdx] || 'Novembro';
}

export function formatMonthFullNamePtBr(raw: string | undefined): string {
  if (!raw) return '';
  const clean = stripAccents(raw).trim().toLowerCase();
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

  return raw.trim();
}

export function extractMonthFromDateStringPtBr(
  dateStr: string | undefined,
  monthOffset = 0
): string {
  if (!dateStr) return '';
  const clean = stripAccents(dateStr).trim();

  const applyOffset = (oneBasedMonth: number): string => {
    const zeroBased = (((oneBasedMonth - 1 + monthOffset) % 12) + 12) % 12;
    return PT_MONTHS_FULL[zeroBased];
  };

  // DD/MM/YYYY ou DD-MM-YYYY
  const dmy = clean.match(/\b(\d{1,2})[/-](\d{1,2})[/-](?:20\d{2}|\d{2})\b/);
  if (dmy) {
    const m = parseInt(dmy[2], 10);
    if (m >= 1 && m <= 12) return applyOffset(m);
  }
  // YYYY-MM-DD
  const ymd = clean.match(/\b(?:20\d{2})[/-](\d{1,2})[/-](\d{1,2})\b/);
  if (ymd) {
    const m = parseInt(ymd[1], 10);
    if (m >= 1 && m <= 12) return applyOffset(m);
  }
  const formatted = formatMonthFullNamePtBr(clean);
  if (monthOffset !== 0 && formatted) {
    const idx = PT_MONTHS_FULL.findIndex(
      (m) => m.toLowerCase() === stripAccents(formatted).toLowerCase()
    );
    if (idx !== -1) {
      const shiftedIdx = (((idx + monthOffset) % 12) + 12) % 12;
      return PT_MONTHS_FULL[shiftedIdx];
    }
  }
  return formatted;
}

export function normalizeProdutoField(raw: string | undefined): string {
  const cleaned = cleanMissingOrUnidentifiedField(raw);
  if (!cleaned) return '';
  return stripAccents(cleaned.replace(/\bgraduate\b/gi, 'Graduacao'));
}

export function getEffectiveFieldValues(
  extracted: ExtractedPdfMetadata | undefined,
  config: RenameConfig
): Record<MandatoryFieldKey, string> {
  const matchedAccount = lookupAdAccountInDirectory(
    cleanMissingOrUnidentifiedField(extracted?.contaAnuncios),
    `${extracted?.resumoCurto || ''} ${extracted?.sugestaoNome || ''}`
  );

  const hints = decodeCampaignAndFilenameHints(
    `${extracted?.resumoCurto || ''} ${extracted?.sugestaoNome || ''}`
  );

  const canonicalTipo = normalizeCanonicalDocType(
    cleanMissingOrUnidentifiedField(extracted?.tipoDocumento),
    `${extracted?.resumoCurto || ''} ${extracted?.sugestaoNome || ''}`
  );
  const cleanedPlataforma = cleanMissingOrUnidentifiedField(
    extracted?.plataforma
  );
  const rawPlataforma = normalizePlataformaField(
    matchedAccount?.plataforma.startsWith('DV360')
      ? matchedAccount.plataforma
      : cleanedPlataforma ||
          matchedAccount?.plataforma ||
          hints.plataforma ||
          '',
    `${extracted?.resumoCurto || ''} ${extracted?.sugestaoNome || ''}`
  );

  // Para Nota Fiscal (NF) de Google ou DV360, prioriza o mês lido da data "Emitido em" (dataEmissao)
  const isGoogleOrDvNf =
    canonicalTipo === 'NF' &&
    (rawPlataforma === 'Google' || rawPlataforma.startsWith('DV360'));

  // Para Boleto, o mês de veiculação é sempre 1 mês antes da Data do Documento (dataEmissao): ex. mês 11 -> mês 10 (Outubro)
  const isBoleto = canonicalTipo === 'Boleto';
  const unshiftedDocMonth = extractMonthFromDateStringPtBr(
    extracted?.dataEmissao,
    0
  );
  const previousDocMonth = extractMonthFromDateStringPtBr(
    extracted?.dataEmissao,
    -1
  );
  const cleanedMesVeic = cleanMissingOrUnidentifiedField(
    extracted?.mesVeiculacao
  );
  const currentMesFormatted = stripAccents(
    formatMonthFullNamePtBr(cleanedMesVeic)
  );

  const monthFromEmissao = isGoogleOrDvNf
    ? unshiftedDocMonth
    : isBoleto &&
        previousDocMonth &&
        (!currentMesFormatted ||
          currentMesFormatted.toLowerCase() === unshiftedDocMonth.toLowerCase())
      ? previousDocMonth
      : '';

  const rawMes =
    monthFromEmissao ||
    cleanedMesVeic ||
    config.defaultMesVeiculacao.trim() ||
    '';
  const rawProduto =
    cleanMissingOrUnidentifiedField(extracted?.produto) ||
    matchedAccount?.produto ||
    hints.produto ||
    config.defaultProduto.trim() ||
    '';
  const rawMarca =
    cleanMissingOrUnidentifiedField(extracted?.marca) ||
    matchedAccount?.marca ||
    hints.marca ||
    config.defaultMarca.trim() ||
    '';
  const rawBu = normalizeBuField(
    cleanMissingOrUnidentifiedField(extracted?.bu) ||
      matchedAccount?.bu ||
      config.defaultBu.trim() ||
      '',
    rawMarca,
    `${extracted?.resumoCurto || ''} ${extracted?.sugestaoNome || ''}`
  );

  return {
    tipoDocumento: stripAccents(canonicalTipo),
    plataforma: stripAccents(rawPlataforma),
    numero: stripAccents(cleanMissingOrUnidentifiedField(extracted?.numero)),
    mesVeiculacao: stripAccents(formatMonthFullNamePtBr(rawMes)),
    valor: cleanMissingOrUnidentifiedField(extracted?.valor),
    bu: stripAccents(rawBu),
    produto: normalizeProdutoField(rawProduto),
    marca: stripAccents(rawMarca),
  };
}

export function getMissingRequiredFields(
  extracted: ExtractedPdfMetadata | undefined,
  config: RenameConfig
): MandatoryFieldKey[] {
  if (!extracted) {
    return MANDATORY_FIELD_DEFINITIONS.map((d) => d.key);
  }
  const values = getEffectiveFieldValues(extracted, config);
  const matchedRule = findMatchingDocTypeRule(
    values.tipoDocumento,
    config.docTypeRules
  );
  const requiredList = matchedRule
    ? matchedRule.requiredFields
    : MANDATORY_FIELD_DEFINITIONS.map((d) => d.key);

  return requiredList.filter((key) => !values[key] || values[key].trim() === '');
}

export function buildAiBaseName(
  item: PdfBatchItem,
  enrichedExtracted: ExtractedPdfMetadata | undefined,
  config: RenameConfig
): string {
  if (!enrichedExtracted) {
    return item.originalBaseName;
  }

  const values = getEffectiveFieldValues(enrichedExtracted, config);
  const matchedRule = findMatchingDocTypeRule(
    values.tipoDocumento,
    config.docTypeRules
  );

  const activeTemplate =
    config.usePerDocTypeRules && matchedRule
      ? matchedRule.patternTemplate.trim()
      : config.aiTemplate.trim();

  if (!activeTemplate) {
    return sanitizeFilenameBase(
      enrichedExtracted.sugestaoNome,
      config.removeAccents
    );
  }

  // Substitui tokens; se algum campo opcional (como produto/marca num boleto sem vínculo) estiver vazio, remove de forma limpa sem deixar "PRODUTO" ou "MARCA" genérico
  let built = activeTemplate
    .replace(/\{tipo\}/gi, values.tipoDocumento || 'DOC')
    .replace(/\{plataforma\}/gi, values.plataforma || '')
    .replace(/\{numero\}/gi, values.numero || '')
    .replace(/\{mes_veiculacao\}/gi, values.mesVeiculacao || '')
    .replace(/\{valor\}/gi, values.valor || '')
    .replace(/\{bu\}/gi, values.bu || '')
    .replace(/\{produto\}/gi, values.produto || '')
    .replace(/\{marca\}/gi, values.marca || '')
    .replace(
      /\{nf_vinculada\}/gi,
      enrichedExtracted.numeroNfseVinculada || values.numero || ''
    )
    .replace(
      /\{rps_fatura\}/gi,
      enrichedExtracted.numeroRpsOuFatura || values.numero || ''
    )
    .replace(/\{conta\}/gi, enrichedExtracted.contaAnuncios || '')
    .replace(/\{vencimento\}/gi, enrichedExtracted.dataVencimento || '')
    .replace(/\{original\}/gi, item.originalBaseName);

  const sep = config.aiSeparator || '-';
  // Converte sublinhados ou separadores repetidos para o separador escolhido (padrão '-')
  built = built
    .replace(/_/g, sep)
    .replace(/[_-\s]{2,}/g, sep)
    .replace(/^[_-\s]+|[_-\s]+$/g, '');

  return sanitizeFilenameBase(
    built || enrichedExtracted.sugestaoNome.replace(/_/g, sep),
    config.removeAccents
  );
}

export function computeProposedBaseName(
  item: PdfBatchItem,
  enrichedExtracted: ExtractedPdfMetadata | undefined,
  index: number,
  config: RenameConfig
): {baseName: string; regexError?: string} {
  if (item.customName !== undefined && item.customName.trim() !== '') {
    return {
      baseName: sanitizeFilenameBase(item.customName, false),
    };
  }

  let working =
    config.mode === 'ai' || config.mode === 'hybrid'
      ? buildAiBaseName(item, enrichedExtracted, config)
      : item.originalBaseName;

  let regexError: string | undefined;

  if (
    (config.mode === 'regex' || config.mode === 'hybrid') &&
    config.findPattern !== ''
  ) {
    if (config.useRegex) {
      try {
        const flags = config.caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(config.findPattern, flags);
        working = working.replace(regex, config.replaceWith);
      } catch (err: unknown) {
        regexError =
          err instanceof Error ? err.message : 'Expressão Regular inválida';
      }
    } else {
      const escaped = config.findPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const flags = config.caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(escaped, flags);
      working = working.replace(regex, config.replaceWith);
    }
  }

  if (config.prefix) {
    working = `${config.prefix}${working}`;
  }
  if (config.suffix) {
    working = `${working}${config.suffix}`;
  }

  if (config.sequenceMode !== 'none') {
    const numStr = String(config.sequenceStart + index).padStart(
      config.sequencePadding,
      '0'
    );
    const sep = config.aiSeparator || '-';
    if (config.sequenceMode === 'prefix') {
      working = `${numStr}${sep}${working}`;
    } else if (config.sequenceMode === 'suffix') {
      working = `${working}${sep}${numStr}`;
    }
  }

  working = applyCaseTransform(working, config.caseTransform);
  working = sanitizeFilenameBase(working, config.removeAccents);

  return {baseName: working, regexError};
}

export interface ComputedBatchRow {
  item: PdfBatchItem;
  enrichedExtracted?: ExtractedPdfMetadata;
  proposedBaseName: string;
  finalFileName: string;
  hasCollision: boolean;
  isChanged: boolean;
  missingFields: MandatoryFieldKey[];
  matchedRule?: DocumentTypeNamingRule;
  regexError?: string;
}

export function resolveBatchFileNames(
  items: PdfBatchItem[],
  config: RenameConfig
): ComputedBatchRow[] {
  const rawList = items.map((item, idx) => {
    const enrichedExtracted = enrichItemFromBatchSiblings(
      item,
      items,
      config.enableCrossLinking
    );
    const {baseName, regexError} = computeProposedBaseName(
      item,
      enrichedExtracted,
      idx,
      config
    );
    const missingFields = getMissingRequiredFields(enrichedExtracted, config);
    const matchedRule = findMatchingDocTypeRule(
      enrichedExtracted?.tipoDocumento,
      config.docTypeRules
    );
    return {
      item,
      enrichedExtracted,
      baseName,
      regexError,
      missingFields,
      matchedRule,
    };
  });

  const counts = new Map<string, number>();
  for (const r of rawList) {
    const key = r.baseName.toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const seen = new Map<string, number>();
  return rawList.map(
    ({
      item,
      enrichedExtracted,
      baseName,
      regexError,
      missingFields,
      matchedRule,
    }) => {
      const key = baseName.toLowerCase();
      const totalForKey = counts.get(key) || 1;
      const hasCollision = totalForKey > 1;

      let resolvedBase = baseName;
      if (hasCollision) {
        const currentIdx = (seen.get(key) || 0) + 1;
        seen.set(key, currentIdx);
        if (currentIdx > 1) {
          resolvedBase = `${baseName}-${currentIdx}`;
        }
      }

      const finalFileName = `${resolvedBase}.pdf`;
      const isChanged = finalFileName !== item.originalName;

      return {
        item,
        enrichedExtracted,
        proposedBaseName: baseName,
        finalFileName,
        hasCollision,
        isChanged,
        missingFields,
        matchedRule,
        regexError,
      };
    }
  );
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function createValidSamplePdfFile(
  fileName: string,
  title: string,
  lines: string[]
): File {
  const escapePdfText = (txt: string) =>
    stripAccents(txt)
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');

  const textOps: string[] = [
    'BT',
    '/F1 14 Tf',
    '45 760 Td',
    `(${escapePdfText(title)}) Tj`,
    '/F1 10 Tf',
    '0 -24 Td',
  ];

  for (const line of lines) {
    textOps.push(`(${escapePdfText(line)}) Tj`);
    textOps.push('0 -16 Td');
  }
  textOps.push('ET');

  const contentStream = textOps.join('\n');
  const streamLength = contentStream.length;

  const pdfParts = [
    '%PDF-1.4\n',
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ];

  let offset = 0;
  const offsets: number[] = [];
  for (const part of pdfParts) {
    offsets.push(offset);
    offset += part.length;
  }

  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
  const fullPdfString = pdfParts.join('') + xref + trailer;

  const encoder = new TextEncoder();
  const bytes = encoder.encode(fullPdfString);
  return new File([bytes], fileName, {
    type: 'application/pdf',
    lastModified: Date.now() - Math.floor(Math.random() * 86400000 * 3),
  });
}

/**
 * Gera exatamente os 3 padrões reais enviados pelo usuário para demonstração imediata:
 * 1. NFS-e Prefeitura de São Paulo (Meta / Platos - Nota 146202369 / RPS 529929)
 * 2. Fatura Meta (Fatura 529929 / AdAccount 394854253002344 / p:Graduate | b:Mackenzie)
 * 3. Boleto Banco Itaú (Google Brasil / Platos - Fatura 5705566190 / Nota 39171427)
 */
export function generateDemoPdfFiles(): {
  file: File;
  preExtracted: ExtractedPdfMetadata;
}[] {
  return [
    {
      file: createValidSamplePdfFile(
        'nfse_prefeitura_sp_20261002u13347016000117.pdf',
        'PREFEITURA DO MUNICIPIO DE SAO PAULO - NFS-e 146202369',
        [
          'NOTA FISCAL ELETRONICA DE SERVICOS - NFS-e',
          'Numero da Nota: 146202369 | Data e Hora de Emissao: 01/10/2026 21:08:25',
          'RPS No 529929 Serie E, emitido em 30/09/2026 | Codigo Verificacao: LREU-WXPI',
          'PRESTADOR DE SERVICOS: FACEBOOK SERVICOS ONLINE DO BRASIL LTDA (13.347.016/0001-17)',
          'TOMADOR DE SERVICOS: PLATOS SOLUCOES EDUCACIONAIS S.A. (35.310.421/0001-01)',
          'E-mail: TRIBUTARIO@KROTON.COM.BR',
          'DISCRIMINACAO DE SERVICOS:',
          'Conjunto de pedidos de insercao de anuncios na internet durante o mes Setembro',
          'Referente a conta de anuncios: 394854253002344',
          'VALOR TOTAL DO SERVICO = R$ 83.484,20',
          'Data de vencimento do ISS desta NFS-e: 10/10/2026',
        ]
      ),
      preExtracted: {
        tipoDocumento: 'NF',
        plataforma: 'Meta',
        numero: '146202369',
        numeroNfseVinculada: '146202369',
        numeroRpsOuFatura: '529929',
        contaAnuncios: '394854253002344',
        dataEmissao: '01/10/2026',
        dataVencimento: '10/10/2026',
        mesVeiculacao: 'Setembro',
        valor: '83.484,20',
        bu: 'Platos',
        produto: '', // Será enriquecido automaticamente pelo Cross-Linking com a Fatura Meta 529929!
        marca: '', // Será enriquecido automaticamente pelo Cross-Linking com a Fatura Meta 529929!
        resumoCurto:
          'NFS-e Prefeitura SP Nº 146202369 (RPS 529929) emitida por Facebook/Meta para Platos (Setembro).',
        sugestaoNome:
          'NF-Meta-146202369-Setembro-83.484,20-Platos-Graduação-Mackenzie',
      },
    },
    {
      file: createValidSamplePdfFile(
        'fatura_meta_rps_529929_sep26.pdf',
        'Meta - FACEBOOK SERVICOS ONLINE DO BRASIL LTDA - FATURA',
        [
          'Numero de Fatura (RPS): 529929 | Data de Emissao: 01-Oct-2026',
          'Periodo de Veiculacao: Sep-26 | Condicao de Pagamento: NET 30',
          'Identificacao de Conta (AdAccount): 394854253002344',
          'TOMADOR: PLATOS SOLUCOES EDUCACIONAIS SA (CNPJ: 35.310.421/0001-01)',
          'AOS CUIDADOS DE: OGILVY & MATHER BRASIL COMUNICACAO LTDA',
          'Descricao Detalhada (Taxonomia de Campanhas):',
          '1 c:Facebook|p:Graduate|b:Mackenzie|t:Mackenzie_ASC_Cauda_Longa|aud:MA 867.21',
          '11 Instagram - c:Facebook|p:Graduate|b:Mackenzie|t:Mackenzie_ASC|aud:MA 13,035.00',
          '20 Instagram - c:Facebook|p:Graduate|b:Mackenzie|t:Mackenzie_Videos 22,164.53',
          'Informacoes Adicionais: Acompanha boleto bancario Bank of America (Venc: 31/10/2026)',
          'Numero da NFS-e = 146202369 | Codigo de verificacao = LREUWXPI',
          'Valor de campanha: 73,340.88 | Valor Total: 83,484.20 BRL',
        ]
      ),
      preExtracted: {
        tipoDocumento: 'Fatura',
        plataforma: 'Meta',
        numero: '529929',
        numeroNfseVinculada: '146202369',
        numeroRpsOuFatura: '529929',
        contaAnuncios: '394854253002344',
        dataEmissao: '01/10/2026',
        dataVencimento: '31/10/2026',
        mesVeiculacao: 'Setembro',
        valor: '83.484,20',
        bu: 'Platos',
        produto: 'Graduação',
        marca: 'Mackenzie',
        resumoCurto:
          'Fatura Meta Nº 529929 (NFS-e 146202369) com taxonomia p:Graduate → Graduação e b:Mackenzie (R$ 83.484,20).',
        sugestaoNome:
          'Fatura-Meta-529929-Setembro-83.484,20-Platos-Graduação-Mackenzie',
      },
    },
    {
      file: createValidSamplePdfFile(
        'boleto_itau_google_341_out2026.pdf',
        'Banco Itau S.A. 341-7 - Recibo do Sacado / Ficha de Compensacao',
        [
          'Linha Digitavel: 34191.09040 30134.412938 80606.190009 1 16300019209990',
          'Cedente: Google Brasil Internet Ltda (CNPJ: 06.990.590/0001-23)',
          'Sacado: PLATOS SOLUCOES EDUCACIONAIS S.A. (CNPJ: 35.310.421/0001-01)',
          'Data Documento: 01/10/2026 | Vencimento: 14/11/2026',
          'Nosso Numero: 109/04301344-1 | Carteira: 109',
          '(=) Valor do Documento: R$ 192.099,90',
          'Instrucoes:',
          'Apos efetuado o pagamento, o valor sera reconhecido pelo Google em ate 3 dias.',
          'Numero da fatura: 5705566190',
          'Numero da Nota: 39171427 | Codigo de Verificacao: TXYPEZAG',
        ]
      ),
      preExtracted: {
        tipoDocumento: 'Boleto',
        plataforma: 'Google',
        numero: '5705566190',
        numeroNfseVinculada: '39171427',
        numeroRpsOuFatura: '5705566190',
        contaAnuncios: '',
        dataEmissao: '01/10/2026',
        dataVencimento: '14/11/2026',
        mesVeiculacao: 'Setembro',
        valor: '192.099,90',
        bu: 'Platos',
        produto: 'Graduação',
        marca: 'Mackenzie',
        resumoCurto:
          'Boleto Itaú 341-7 emitido por Google Brasil (Fatura 5705566190 / NF 39171427) para Platos (R$ 192.099,90).',
        sugestaoNome:
          'Boleto-Google-5705566190-Setembro-192.099,90-Platos-Graduação-Mackenzie',
      },
    },
  ];
}

export interface BillingSpreadsheetRow {
  id: string;
  sourceItemId?: string;
  sourceFileName?: string;
  sourceDocType?: string;
  mesVeiculacao: string;
  mesEmpenho: string;
  marca: string;
  frenteMidia: string;
  estrategia: string;
  veiculo: string;
  valorFaturamento: string;
  numeroNfVeiculo: string;
}

export type SpreadsheetRowFilterMode = 'consolidated' | 'only-nf' | 'all-files';

export const SPREADSHEET_MONTH_OPTIONS = [
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

export const SPREADSHEET_MARCA_OPTIONS = [
  'Anhanguera',
  'Mackenzie',
  'Pitagoras',
  'Unic',
  'Uniderp',
  'UMC',
  'UPF',
  'UTP',
  'Consideracao',
  'Unopar',
  'Unime',
  'Fama',
  'Editora',
  'Platos',
];

export const SPREADSHEET_FRENTE_MIDIA_OPTIONS = [
  'Graduacao',
  'PosGrad',
  'Tecnico',
  'Livres',
  'Prof',
  'Vestibular',
  'Institucional',
  'Performance',
  'Branding',
];

export const SPREADSHEET_ESTRATEGIA_OPTIONS = [
  'Performance',
  'Consideracao',
  'Branding',
  'Conversao',
  'AON',
  'Institucional',
  'Vestibular',
  'Topo de Funil',
  'Meio de Funil',
  'Fundo de Funil',
  'Graduacao',
  'PosGrad',
  'Tecnico',
  'Livres',
  'Prof',
];

export const SPREADSHEET_VEICULO_OPTIONS = [
  'Google',
  'Meta',
  'TikTok',
  'DV360',
  'DV360 Fee',
  'LinkedIn',
  'YouTube',
  'Pinterest',
  'Spotify',
  'UOL',
  'Globo',
  'Outbrain',
  'Bing',
];

export function parseBrazilianCurrencyToNumber(val: string): number {
  if (!val) return 0;
  const cleaned = val
    .replace(/[R$\s]/gi, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNumberToBrazilianCurrency(num: number): string {
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function buildSpreadsheetRowsFromBatch(
  computedRows: ComputedBatchRow[],
  filterMode: SpreadsheetRowFilterMode,
  defaultMesEmpenho: string,
  overrides: Record<string, Partial<BillingSpreadsheetRow>>,
  manualRows: BillingSpreadsheetRow[],
  defaultEstrategia = ''
): BillingSpreadsheetRow[] {
  let targetRows = computedRows;

  if (filterMode === 'only-nf') {
    targetRows = computedRows.filter((r) => {
      const ext = r.enrichedExtracted || r.item.extractedData;
      const canonical = normalizeCanonicalDocType(
        ext?.tipoDocumento,
        r.item.originalName
      );
      return canonical === 'NF';
    });
  } else if (filterMode === 'consolidated') {
    const seenKeys = new Set<string>();
    const consolidated: ComputedBatchRow[] = [];

    // Prioritize NF rows first so their NF number and metadata take precedence when deduplicating with Fatura/Boleto
    const sorted = [...computedRows].sort((a, b) => {
      const tipoA = normalizeCanonicalDocType(
        (a.enrichedExtracted || a.item.extractedData)?.tipoDocumento,
        a.item.originalName
      );
      const tipoB = normalizeCanonicalDocType(
        (b.enrichedExtracted || b.item.extractedData)?.tipoDocumento,
        b.item.originalName
      );
      const score = (t: string) => (t === 'NF' ? 0 : t === 'Fatura' ? 1 : 2);
      return score(tipoA) - score(tipoB);
    });

    for (const r of sorted) {
      const ext = r.enrichedExtracted || r.item.extractedData;
      const tipo = normalizeCanonicalDocType(
        ext?.tipoDocumento,
        r.item.originalName
      );
      const nfKey = stripAccents(
        ext?.numeroNfseVinculada || (tipo === 'NF' ? ext?.numero : '') || ''
      )
        .replace(/^0+/, '')
        .trim();
      const rpsKey = stripAccents(ext?.numeroRpsOuFatura || '')
        .replace(/^0+/, '')
        .trim();

      const dedupeKey = nfKey
        ? `nf:${nfKey}`
        : rpsKey
          ? `rps:${rpsKey}`
          : `item:${r.item.id}`;

      if (!seenKeys.has(dedupeKey)) {
        seenKeys.add(dedupeKey);
        consolidated.push(r);
      }
    }

    targetRows = consolidated;
  }

  const currentMonthName = getCurrentMonthPtBr();

  const autoRows: BillingSpreadsheetRow[] = targetRows.map((row) => {
    const ext = row.enrichedExtracted || row.item.extractedData;
    const effective = getEffectiveFieldValues(ext, DEFAULT_RENAME_CONFIG);
    const canonicalTipo = normalizeCanonicalDocType(
      effective.tipoDocumento || ext?.tipoDocumento,
      row.item.originalName
    );
    const nfNumber =
      canonicalTipo === 'NF'
        ? effective.numero || ext?.numeroNfseVinculada || ''
        : ext?.numeroNfseVinculada || effective.numero || '';

    const mesVeic = stripAccents(
      effective.mesVeiculacao || ext?.mesVeiculacao || ''
    );
    const marcaVal = stripAccents(effective.marca || ext?.marca || '');
    const veiculoVal = stripAccents(
      effective.plataforma || ext?.plataforma || ''
    );
    const inferredEstrategia =
      defaultEstrategia ||
      (marcaVal.toLowerCase() === 'consideracao' ||
      veiculoVal.toLowerCase().startsWith('dv360')
        ? 'Consideracao'
        : 'Performance');

    const baseRow: BillingSpreadsheetRow = {
      id: `sheet-${row.item.id}`,
      sourceItemId: row.item.id,
      sourceFileName: row.finalFileName,
      sourceDocType: canonicalTipo || ext?.tipoDocumento || 'NF',
      mesVeiculacao: mesVeic,
      mesEmpenho: defaultMesEmpenho || currentMonthName,
      marca: marcaVal,
      frenteMidia: stripAccents(effective.produto || ext?.produto || ''),
      estrategia: inferredEstrategia,
      veiculo: veiculoVal,
      valorFaturamento: effective.valor || ext?.valor || '',
      numeroNfVeiculo: stripAccents(nfNumber),
    };

    const rowOverride = overrides[baseRow.id];
    if (!rowOverride) return baseRow;
    return {
      ...baseRow,
      ...rowOverride,
    };
  });

  const resolvedManualRows = manualRows.map((mRow) => {
    const rowOverride = overrides[mRow.id];
    return rowOverride ? {...mRow, ...rowOverride} : mRow;
  });

  return [...autoRows, ...resolvedManualRows];
}

