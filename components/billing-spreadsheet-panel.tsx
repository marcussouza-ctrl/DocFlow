'use client';

import React, {useState, useMemo} from 'react';
import {
  Copy,
  Download,
  Plus,
  RotateCcw,
  Trash2,
  Check,
  Table2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ComputedBatchRow,
  BillingSpreadsheetRow,
  SpreadsheetRowFilterMode,
  SPREADSHEET_MONTH_OPTIONS,
  SPREADSHEET_MARCA_OPTIONS,
  SPREADSHEET_FRENTE_MIDIA_OPTIONS,
  SPREADSHEET_ESTRATEGIA_OPTIONS,
  SPREADSHEET_VEICULO_OPTIONS,
  buildSpreadsheetRowsFromBatch,
  parseBrazilianCurrencyToNumber,
  formatNumberToBrazilianCurrency,
  getCurrentMonthPtBr,
} from '@/lib/pdf-utils';

interface BillingSpreadsheetPanelProps {
  computedRows: ComputedBatchRow[];
  onNotify: (msg: string) => void;
}

const OFFICIAL_HEADERS = [
  'MÊS VEICUL.',
  'MÊS EMPENHO',
  'MARCA',
  'FRENTE MIDIA',
  'ESTRATÉGIA',
  'VEÍCULO',
  'VALOR PARA FATURAMENTO',
  'N° NF VEICULO',
];

export default function BillingSpreadsheetPanel({
  computedRows,
  onNotify,
}: BillingSpreadsheetPanelProps) {
  const [filterMode, setFilterMode] =
    useState<SpreadsheetRowFilterMode>('consolidated');
  const [defaultMesEmpenho, setDefaultMesEmpenho] = useState<string>(() =>
    getCurrentMonthPtBr()
  );
  const [bulkMesVeiculacao, setBulkMesVeiculacao] = useState<string>('');
  const [bulkEstrategia, setBulkEstrategia] = useState<string>('');
  const [includeCurrencyPrefix, setIncludeCurrencyPrefix] =
    useState<boolean>(true);

  const [overrides, setOverrides] = useState<
    Record<string, Partial<BillingSpreadsheetRow>>
  >({});
  const [hiddenRowIds, setHiddenRowIds] = useState<Set<string>>(new Set());
  const [manualRows, setManualRows] = useState<BillingSpreadsheetRow[]>([]);

  const [customMarcas, setCustomMarcas] = useState<string[]>([]);
  const [customFrentes, setCustomFrentes] = useState<string[]>([]);
  const [customEstrategias, setCustomEstrategias] = useState<string[]>([]);
  const [customVeiculos, setCustomVeiculos] = useState<string[]>([]);

  const [newOptionCategory, setNewOptionCategory] = useState<
    'marca' | 'frenteMidia' | 'estrategia' | 'veiculo'
  >('marca');
  const [newOptionValue, setNewOptionValue] = useState('');
  const [copiedMode, setCopiedMode] = useState<'rows' | 'full' | null>(null);

  const allBuiltRows = useMemo(
    () =>
      buildSpreadsheetRowsFromBatch(
        computedRows,
        filterMode,
        defaultMesEmpenho,
        overrides,
        manualRows,
        bulkEstrategia
      ),
    [
      computedRows,
      filterMode,
      defaultMesEmpenho,
      overrides,
      manualRows,
      bulkEstrategia,
    ]
  );

  const visibleRows = useMemo(
    () => allBuiltRows.filter((r) => !hiddenRowIds.has(r.id)),
    [allBuiltRows, hiddenRowIds]
  );

  const marcaOptions = useMemo(() => {
    const set = new Set<string>([
      ...SPREADSHEET_MARCA_OPTIONS,
      ...customMarcas,
    ]);
    visibleRows.forEach((r) => {
      if (r.marca && r.marca.trim()) set.add(r.marca.trim());
    });
    return Array.from(set);
  }, [customMarcas, visibleRows]);

  const frenteOptions = useMemo(() => {
    const set = new Set<string>([
      ...SPREADSHEET_FRENTE_MIDIA_OPTIONS,
      ...customFrentes,
    ]);
    visibleRows.forEach((r) => {
      if (r.frenteMidia && r.frenteMidia.trim()) set.add(r.frenteMidia.trim());
    });
    return Array.from(set);
  }, [customFrentes, visibleRows]);

  const estrategiaOptions = useMemo(() => {
    const set = new Set<string>([
      ...SPREADSHEET_ESTRATEGIA_OPTIONS,
      ...customEstrategias,
    ]);
    visibleRows.forEach((r) => {
      if (r.estrategia && r.estrategia.trim()) set.add(r.estrategia.trim());
    });
    return Array.from(set);
  }, [customEstrategias, visibleRows]);

  const veiculoOptions = useMemo(() => {
    const set = new Set<string>([
      ...SPREADSHEET_VEICULO_OPTIONS,
      ...customVeiculos,
    ]);
    visibleRows.forEach((r) => {
      if (r.veiculo && r.veiculo.trim()) set.add(r.veiculo.trim());
    });
    return Array.from(set);
  }, [customVeiculos, visibleRows]);

  const updateRowField = (
    rowId: string,
    field: keyof BillingSpreadsheetRow,
    value: string
  ) => {
    setOverrides((prev) => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || {}),
        [field]: value,
      },
    }));
  };

  const handleApplyBulkMesEmpenho = (val: string) => {
    const resolved = val || getCurrentMonthPtBr();
    setDefaultMesEmpenho(resolved);
    setOverrides((prev) => {
      const next = {...prev};
      visibleRows.forEach((r) => {
        next[r.id] = {
          ...(next[r.id] || {}),
          mesEmpenho: resolved,
        };
      });
      return next;
    });
    onNotify(`Mês Empenho "${resolved}" aplicado a todas as linhas.`);
  };

  const handleApplyBulkMesVeiculacao = (val: string) => {
    setBulkMesVeiculacao(val);
    if (!val) return;
    setOverrides((prev) => {
      const next = {...prev};
      visibleRows.forEach((r) => {
        next[r.id] = {
          ...(next[r.id] || {}),
          mesVeiculacao: val,
        };
      });
      return next;
    });
    onNotify(`Mês Veiculação "${val}" aplicado a todas as linhas.`);
  };

  const handleApplyBulkEstrategia = (val: string) => {
    setBulkEstrategia(val);
    if (!val) return;
    setOverrides((prev) => {
      const next = {...prev};
      visibleRows.forEach((r) => {
        next[r.id] = {
          ...(next[r.id] || {}),
          estrategia: val,
        };
      });
      return next;
    });
    onNotify(`Estratégia "${val}" aplicada a todas as linhas.`);
  };

  const handleAddManualRow = () => {
    const defaultMonth =
      visibleRows[0]?.mesVeiculacao || bulkMesVeiculacao || 'Setembro';
    const currentEmpenho = defaultMesEmpenho || getCurrentMonthPtBr();
    const newRow: BillingSpreadsheetRow = {
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sourceFileName: 'Linha adicionada manualmente',
      sourceDocType: 'Manual',
      mesVeiculacao: defaultMonth,
      mesEmpenho: currentEmpenho,
      marca: '',
      frenteMidia: '',
      estrategia: bulkEstrategia || 'Performance',
      veiculo: '',
      valorFaturamento: '',
      numeroNfVeiculo: '',
    };
    setManualRows((prev) => [...prev, newRow]);
    onNotify('Nova linha manual adicionada à planilha.');
  };

  const handleRemoveRow = (rowId: string) => {
    if (rowId.startsWith('manual-')) {
      setManualRows((prev) => prev.filter((r) => r.id !== rowId));
    } else {
      setHiddenRowIds((prev) => {
        const next = new Set(prev);
        next.add(rowId);
        return next;
      });
    }
  };

  const handleResetSpreadsheet = () => {
    setOverrides({});
    setHiddenRowIds(new Set());
    setManualRows([]);
    setDefaultMesEmpenho(getCurrentMonthPtBr());
    setBulkMesVeiculacao('');
    setBulkEstrategia('');
    onNotify('Planilha ressincronizada com os arquivos PDF renomeados.');
  };

  const handleAddCustomOption = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newOptionValue.trim();
    if (!val) return;
    if (newOptionCategory === 'marca') {
      setCustomMarcas((prev) => (prev.includes(val) ? prev : [...prev, val]));
      onNotify(`Marca "${val}" adicionada à lista.`);
    } else if (newOptionCategory === 'frenteMidia') {
      setCustomFrentes((prev) => (prev.includes(val) ? prev : [...prev, val]));
      onNotify(`Frente Mídia "${val}" adicionada à lista.`);
    } else if (newOptionCategory === 'estrategia') {
      setCustomEstrategias((prev) =>
        prev.includes(val) ? prev : [...prev, val]
      );
      onNotify(`Estratégia "${val}" adicionada à lista.`);
    } else {
      setCustomVeiculos((prev) => (prev.includes(val) ? prev : [...prev, val]));
      onNotify(`Veículo "${val}" adicionado à lista.`);
    }
    setNewOptionValue('');
  };

  const formatValorCell = (rawVal: string): string => {
    const trimmed = rawVal.trim();
    if (!trimmed) return '';
    const cleanNumber = trimmed.replace(/^R\$\s*/i, '');
    return includeCurrencyPrefix ? `R$ ${cleanNumber}` : cleanNumber;
  };

  const buildRowCells = (row: BillingSpreadsheetRow): string[] => [
    row.mesVeiculacao || '',
    row.mesEmpenho || '',
    row.marca || '',
    row.frenteMidia || '',
    row.estrategia || '',
    row.veiculo || '',
    formatValorCell(row.valorFaturamento),
    row.numeroNfVeiculo || '',
  ];

  const handleCopyTsv = async (includeHeader: boolean) => {
    if (visibleRows.length === 0) {
      onNotify('Não há linhas na planilha para copiar.');
      return;
    }

    const lines: string[] = [];
    if (includeHeader) {
      lines.push(OFFICIAL_HEADERS.join('\t'));
    }
    for (const r of visibleRows) {
      lines.push(buildRowCells(r).join('\t'));
    }

    const tsvContent = lines.join('\n');
    try {
      await navigator.clipboard.writeText(tsvContent);
      setCopiedMode(includeHeader ? 'full' : 'rows');
      setTimeout(() => setCopiedMode(null), 2500);
      onNotify(
        includeHeader
          ? `${visibleRows.length} linha(s) + cabeçalho copiados! Cole (Ctrl+V) no Excel ou Google Sheets.`
          : `${visibleRows.length} linha(s) copiadas! Cole (Ctrl+V) diretamente na sua planilha.`
      );
    } catch {
      onNotify('Não foi possível acessar a área de transferência.');
    }
  };

  const handleDownloadCsv = () => {
    if (visibleRows.length === 0) {
      onNotify('Não há linhas na planilha para exportar.');
      return;
    }

    const escapeCsvCell = (val: string) => {
      const cleaned = val.replace(/"/g, '""');
      return /[;"\n\r]/.test(cleaned) ? `"${cleaned}"` : cleaned;
    };

    const csvLines: string[] = [
      OFFICIAL_HEADERS.map(escapeCsvCell).join(';'),
      ...visibleRows.map((r) => buildRowCells(r).map(escapeCsvCell).join(';')),
    ];

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvLines.join('\r\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.download = `Planilha-Faturamento-Midia-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onNotify(
      `Planilha exportada com sucesso (${visibleRows.length} linha(s)).`
    );
  };

  const totalFaturamento = useMemo(() => {
    return visibleRows.reduce(
      (acc, r) => acc + parseBrazilianCurrencyToNumber(r.valorFaturamento),
      0
    );
  }, [visibleRows]);

  const missingSelectionCount = useMemo(() => {
    return visibleRows.filter(
      (r) =>
        !r.mesVeiculacao ||
        !r.mesEmpenho ||
        !r.marca ||
        !r.frenteMidia ||
        !r.estrategia ||
        !r.veiculo ||
        !r.valorFaturamento ||
        !r.numeroNfVeiculo
    ).length;
  }, [visibleRows]);

  return (
    <div
      id="etapa-planilha-faturamento"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
    >
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
            <FileSpreadsheet className="w-4 h-4" />
            <span>ETAPA 2 (PÓS-RENOMEAÇÃO) · PLANILHA DE FATURAMENTO</span>
          </div>
          <h2
            style={{fontFamily: 'var(--font-display), sans-serif'}}
            className="text-lg font-bold text-slate-900"
          >
            Preenchimento e Exportação da Planilha de Mídia (8 Colunas)
          </h2>
          <p className="text-xs text-slate-500">
            Os dados extraídos dos PDFs renomeados preenchem automaticamente as
            8 colunas abaixo (com Mês Empenho no mês atual). Ajuste e copie
            direto para o Excel ou Google Sheets.
          </p>
        </div>

        {/* Copy & Export Primary Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleCopyTsv(false)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="Copia apenas as linhas de dados separadas por TAB para colar diretamente abaixo do cabeçalho na sua planilha"
          >
            {copiedMode === 'rows' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-blue-600" />
            )}
            Copiar Linhas (Sem Cabeçalho)
          </button>

          <button
            type="button"
            onClick={() => handleCopyTsv(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="Copia o cabeçalho das 8 colunas + todas as linhas para colar no Excel ou Google Sheets"
          >
            {copiedMode === 'full' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Table2 className="w-3.5 h-3.5 text-slate-700" />
            )}
            Copiar Tabela Completa
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar Planilha (.CSV / Excel)
          </button>
        </div>
      </div>

      {/* Controls Bar: Row Filter, Bulk Fill & Custom Dropdown Adder */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Source Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 whitespace-nowrap">
              Origem das Linhas:
            </span>
            <select
              value={filterMode}
              onChange={(e) =>
                setFilterMode(e.target.value as SpreadsheetRowFilterMode)
              }
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="consolidated">
                Consolidado por NF (Evita duplicar NF + Fatura)
              </option>
              <option value="only-nf">Apenas Notas Fiscais (NF)</option>
              <option value="all-files">
                Todos os PDFs do Lote (1 linha por arquivo)
              </option>
            </select>
          </div>

          {/* Bulk Mês Veiculação */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 whitespace-nowrap">
              Mês Veicul. (Lote):
            </span>
            <select
              value={bulkMesVeiculacao}
              onChange={(e) => handleApplyBulkMesVeiculacao(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="">Do documento...</option>
              {SPREADSHEET_MONTH_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  Aplicar {m}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Mês Empenho */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 whitespace-nowrap">
              Mês Empenho (Atual):
            </span>
            <select
              value={defaultMesEmpenho}
              onChange={(e) => handleApplyBulkMesEmpenho(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-blue-700"
            >
              {SPREADSHEET_MONTH_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m} {m === getCurrentMonthPtBr() ? '(Mês Atual)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Estratégia */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 whitespace-nowrap">
              Estratégia (Lote):
            </span>
            <select
              value={bulkEstrategia}
              onChange={(e) => handleApplyBulkEstrategia(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="">Automática...</option>
              {estrategiaOptions.map((est) => (
                <option key={est} value={est}>
                  Aplicar {est}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle R$ prefix */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeCurrencyPrefix}
              onChange={(e) => setIncludeCurrencyPrefix(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Prefixo R$ ao copiar</span>
          </label>
        </div>

        {/* Add Custom Option to Dropdowns + Row Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <form
            onSubmit={handleAddCustomOption}
            className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200"
          >
            <select
              value={newOptionCategory}
              onChange={(e) =>
                setNewOptionCategory(
                  e.target.value as
                    | 'marca'
                    | 'frenteMidia'
                    | 'estrategia'
                    | 'veiculo'
                )
              }
              className="text-[11px] bg-transparent font-medium text-slate-700 focus:outline-none"
            >
              <option value="marca">+ Marca</option>
              <option value="frenteMidia">+ Frente Mídia</option>
              <option value="estrategia">+ Estratégia</option>
              <option value="veiculo">+ Veículo</option>
            </select>
            <input
              type="text"
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
              placeholder="Nova opção..."
              className="w-28 px-2 py-0.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              className="px-2 py-0.5 text-[11px] font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded cursor-pointer"
            >
              Incluir
            </button>
          </form>

          <button
            type="button"
            onClick={handleAddManualRow}
            className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Linha Manual
          </button>

          <button
            type="button"
            onClick={handleResetSpreadsheet}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
            title="Restaurar dados originais extraídos dos PDFs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Sincronizar
          </button>
        </div>
      </div>

      {/* Interactive 8-Column Spreadsheet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-100/90 text-[11px] font-bold text-slate-800 uppercase tracking-tight">
              <th className="py-2.5 pl-4 pr-2 w-8 text-center text-slate-400">
                #
              </th>
              <th className="py-2.5 px-2 min-w-[130px]">MÊS VEICUL.</th>
              <th className="py-2.5 px-2 min-w-[130px]">MÊS EMPENHO</th>
              <th className="py-2.5 px-2 min-w-[155px]">MARCA</th>
              <th className="py-2.5 px-2 min-w-[155px]">FRENTE MIDIA</th>
              <th className="py-2.5 px-2 min-w-[155px]">ESTRATÉGIA</th>
              <th className="py-2.5 px-2 min-w-[150px]">VEÍCULO</th>
              <th className="py-2.5 px-2 min-w-[160px]">
                VALOR PARA FATURAMENTO
              </th>
              <th className="py-2.5 px-2 min-w-[140px]">N° NF VEICULO</th>
              <th className="py-2.5 px-2 min-w-[180px] text-slate-500 font-semibold">
                Arquivo PDF Vinculado
              </th>
              <th className="py-2.5 pl-2 pr-4 w-10 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="py-10 px-6 text-center text-slate-500"
                >
                  Nenhum documento disponível para preencher a planilha.
                  Adicione PDFs na bancada ou clique em{' '}
                  <button
                    type="button"
                    onClick={handleAddManualRow}
                    className="text-blue-600 font-semibold underline cursor-pointer"
                  >
                    + Linha Manual
                  </button>
                  .
                </td>
              </tr>
            ) : (
              visibleRows.map((row, index) => (
                <tr
                  key={row.id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td
                    style={{fontFamily: 'var(--font-mono), monospace'}}
                    className="py-2.5 pl-4 pr-2 text-center text-[11px] text-slate-400 tabular-nums"
                  >
                    {index + 1}
                  </td>

                  {/* 1. MÊS VEICUL. */}
                  <td className="py-2 px-2">
                    <select
                      value={row.mesVeiculacao}
                      onChange={(e) =>
                        updateRowField(row.id, 'mesVeiculacao', e.target.value)
                      }
                      aria-label="Mês de Veiculação"
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        !row.mesVeiculacao
                          ? 'bg-amber-50/70 border-amber-300 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="">Selecione...</option>
                      {SPREADSHEET_MONTH_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                      {row.mesVeiculacao &&
                        !SPREADSHEET_MONTH_OPTIONS.includes(
                          row.mesVeiculacao
                        ) && (
                          <option value={row.mesVeiculacao}>
                            {row.mesVeiculacao}
                          </option>
                        )}
                    </select>
                  </td>

                  {/* 2. MÊS EMPENHO */}
                  <td className="py-2 px-2">
                    <select
                      value={row.mesEmpenho}
                      onChange={(e) =>
                        updateRowField(row.id, 'mesEmpenho', e.target.value)
                      }
                      aria-label="Mês de Empenho"
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        !row.mesEmpenho
                          ? 'bg-amber-50/70 border-amber-300 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="">Selecione...</option>
                      {SPREADSHEET_MONTH_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                      {row.mesEmpenho &&
                        !SPREADSHEET_MONTH_OPTIONS.includes(row.mesEmpenho) && (
                          <option value={row.mesEmpenho}>
                            {row.mesEmpenho}
                          </option>
                        )}
                    </select>
                  </td>

                  {/* 3. MARCA */}
                  <td className="py-2 px-2">
                    <select
                      value={row.marca}
                      onChange={(e) =>
                        updateRowField(row.id, 'marca', e.target.value)
                      }
                      aria-label="Marca"
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        !row.marca
                          ? 'bg-amber-50/70 border-amber-300 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="">Selecione...</option>
                      {marcaOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* 4. FRENTE MIDIA */}
                  <td className="py-2 px-2">
                    <select
                      value={row.frenteMidia}
                      onChange={(e) =>
                        updateRowField(row.id, 'frenteMidia', e.target.value)
                      }
                      aria-label="Frente Mídia"
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        !row.frenteMidia
                          ? 'bg-amber-50/70 border-amber-300 text-slate-900'
                          : 'bg-white border-slate-200 text-emerald-800'
                      }`}
                    >
                      <option value="">Selecione...</option>
                      {frenteOptions.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* 5. ESTRATÉGIA */}
                  <td className="py-2 px-2">
                    <select
                      value={row.estrategia}
                      onChange={(e) =>
                        updateRowField(row.id, 'estrategia', e.target.value)
                      }
                      aria-label="Estratégia"
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        !row.estrategia
                          ? 'bg-amber-50/70 border-amber-300 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="">Selecione...</option>
                      {estrategiaOptions.map((est) => (
                        <option key={est} value={est}>
                          {est}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* 6. VEÍCULO */}
                  <td className="py-2 px-2">
                    <select
                      value={row.veiculo}
                      onChange={(e) =>
                        updateRowField(row.id, 'veiculo', e.target.value)
                      }
                      aria-label="Veículo"
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        !row.veiculo
                          ? 'bg-amber-50/70 border-amber-300 text-slate-900'
                          : 'bg-white border-slate-200 text-blue-800'
                      }`}
                    >
                      <option value="">Selecione...</option>
                      {veiculoOptions.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* 7. VALOR PARA FATURAMENTO */}
                  <td className="py-2 px-2">
                    <div className="relative flex items-center">
                      <span
                        style={{fontFamily: 'var(--font-mono), monospace'}}
                        className="absolute left-2.5 text-[11px] text-slate-400 pointer-events-none"
                      >
                        R$
                      </span>
                      <input
                        type="text"
                        value={row.valorFaturamento}
                        onChange={(e) =>
                          updateRowField(
                            row.id,
                            'valorFaturamento',
                            e.target.value
                          )
                        }
                        placeholder="0,00"
                        style={{fontFamily: 'var(--font-mono), monospace'}}
                        className={`w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                          !row.valorFaturamento
                            ? 'bg-amber-50/70 border-amber-300 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </td>

                  {/* 8. N° NF VEICULO */}
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.numeroNfVeiculo}
                      onChange={(e) =>
                        updateRowField(
                          row.id,
                          'numeroNfVeiculo',
                          e.target.value
                        )
                      }
                      placeholder="Nº da NF"
                      style={{fontFamily: 'var(--font-mono), monospace'}}
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        !row.numeroNfVeiculo
                          ? 'bg-amber-50/70 border-amber-300 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </td>

                  {/* Reference Renamed PDF File */}
                  <td className="py-2 px-2 max-w-[200px]">
                    <div
                      style={{fontFamily: 'var(--font-mono), monospace'}}
                      className="text-[11px] text-slate-600 truncate"
                      title={row.sourceFileName}
                    >
                      {row.sourceFileName || '---'}
                    </div>
                  </td>

                  {/* Delete Row Action */}
                  <td className="py-2 pl-2 pr-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      title="Remover linha da planilha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Summary Footer */}
          {visibleRows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800">
                <td colSpan={7} className="py-3 pl-4 pr-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>
                      Total:{' '}
                      <strong className="text-slate-900">
                        {visibleRows.length}
                      </strong>{' '}
                      linha(s) na planilha
                    </span>
                    <span aria-hidden="true">·</span>
                    {missingSelectionCount === 0 ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Todas as 8 colunas preenchidas
                      </span>
                    ) : (
                      <span className="text-amber-700">
                        {missingSelectionCount} linha(s) com campos em aberto
                      </span>
                    )}
                  </div>
                </td>
                <td
                  style={{fontFamily: 'var(--font-mono), monospace'}}
                  className="py-3 px-2 text-emerald-700 font-bold tabular-nums whitespace-nowrap"
                >
                  R$ {formatNumberToBrazilianCurrency(totalFaturamento)}
                </td>
                <td colSpan={3} className="py-3 px-4 text-right text-slate-500">
                  Pronto para colar no Excel / Google Sheets
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
