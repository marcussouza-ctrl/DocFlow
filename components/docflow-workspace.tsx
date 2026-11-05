'use client';

import React, {useState, useRef, useMemo, useEffect} from 'react';
import {
  Upload,
  Sparkles,
  Download,
  FileText,
  Trash2,
  Eye,
  Check,
  AlertTriangle,
  RefreshCw,
  Edit3,
  X,
  Search,
  Sliders,
  Bookmark,
  History,
  BookOpen,
  ArrowRight,
  Plus,
  RotateCcw,
  CheckCircle2,
  FilePlus2,
  Layers,
  Link2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  PdfBatchItem,
  RenameConfig,
  DEFAULT_RENAME_CONFIG,
  BUILTIN_PRESETS,
  SavedRulePreset,
  HistoryRecord,
  resolveBatchFileNames,
  formatBytes,
  generateDemoPdfFiles,
  CaseTransform,
  MANDATORY_FIELD_DEFINITIONS,
  EXTRA_TOKEN_DEFINITIONS,
  AD_ACCOUNT_DIRECTORY,
  MandatoryFieldKey,
  ExtractedPdfMetadata,
} from '@/lib/pdf-utils';
import BillingSpreadsheetPanel from '@/components/billing-spreadsheet-panel';

type ActiveSection =
  | 'workbench'
  | 'spreadsheet'
  | 'doc-type-rules'
  | 'ad-accounts'
  | 'presets'
  | 'history';

export default function DocFlowWorkspace() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('workbench');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'changed' | 'missing-fields'
  >('all');
  const [isDragging, setIsDragging] = useState(false);

  const [items, setItems] = useState<PdfBatchItem[]>([]);
  const [config, setConfig] = useState<RenameConfig>(DEFAULT_RENAME_CONFIG);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeDocTypeTab, setActiveDocTypeTab] = useState<string>('NF');

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);

  const [isAnalyzingBatch, setIsAnalyzingBatch] = useState(false);
  const [isDownloadingBatch, setIsDownloadingBatch] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [customPresets, setCustomPresets] =
    useState<SavedRulePreset[]>(BUILTIN_PRESETS);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);

  const [newDocTypeCode, setNewDocTypeCode] = useState('');
  const [newDocTypeLabel, setNewDocTypeLabel] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const loadDemoBatch = (silent = false) => {
    const demos = generateDemoPdfFiles();
    const newItems: PdfBatchItem[] = demos.map(({file, preExtracted}, idx) => ({
      id: `demo-${Date.now()}-${idx}`,
      file,
      originalName: file.name,
      originalBaseName: file.name.replace(/\.pdf$/i, ''),
      sizeBytes: file.size,
      lastModified: file.lastModified,
      previewUrl: URL.createObjectURL(file),
      extractedData: preExtracted,
      status: 'ready',
      downloadedCount: 0,
    }));

    setItems(newItems);
    setSelectedIds(new Set(newItems.map((i) => i.id)));
    if (newItems.length > 0) {
      setPreviewItemId(newItems[0].id);
    }
    if (!silent) {
      showToast(
        '3 PDFs reais de referência carregados (NFS-e Prefeitura SP, Fatura Meta e Boleto Itaú Google).'
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDemoBatch(true);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilesAdded = (fileList: FileList | File[]) => {
    const pdfFiles = Array.from(fileList).filter(
      (f) =>
        f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      showToast('Selecione apenas arquivos com extensão .pdf.');
      return;
    }

    const added: PdfBatchItem[] = pdfFiles.map((file, idx) => ({
      id: `pdf-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      originalName: file.name,
      originalBaseName: file.name.replace(/\.pdf$/i, ''),
      sizeBytes: file.size,
      lastModified: file.lastModified,
      previewUrl: URL.createObjectURL(file),
      extractedData: {
        tipoDocumento: 'NF',
        plataforma: '',
        numero: '',
        mesVeiculacao: config.defaultMesVeiculacao || '',
        valor: '',
        bu: config.defaultBu || '',
        produto: config.defaultProduto || '',
        marca: config.defaultMarca || '',
        resumoCurto: 'Extraindo dados do documento via IA...',
        sugestaoNome: file.name.replace(/\.pdf$/i, ''),
      },
      status: 'idle',
      downloadedCount: 0,
    }));

    setItems((prev) => [...prev, ...added]);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      added.forEach((a) => next.add(a.id));
      return next;
    });
    if (!previewItemId && added.length > 0) {
      setPreviewItemId(added[0].id);
    }
    setActiveSection('workbench');
    showToast(
      `${added.length} PDF(s) adicionado(s). Extraindo campos em paralelo...`
    );

    void runParallelAiExtraction(added);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo PDF local.'));
      reader.readAsDataURL(file);
    });
  };

  const analyzeSingleItemWithAi = async (item: PdfBatchItem) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id
          ? {...it, status: 'analyzing', errorMessage: undefined}
          : it
      )
    );

    try {
      const base64Pdf = await fileToBase64(item.file);
      const response = await fetch('/api/extract-pdf-name', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          base64Pdf,
          originalName: item.originalName,
          customInstruction: config.aiCustomInstruction,
          patternTemplate: config.aiTemplate,
          separator: config.aiSeparator,
          fastMode: true,
          defaultContext: {
            bu: config.defaultBu,
            marca: config.defaultMarca,
            produto: config.defaultProduto,
            mesVeiculacao: config.defaultMesVeiculacao,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Falha na extração via IA');
      }

      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                extractedData: data.extracted,
                status: 'ready',
                errorMessage: undefined,
              }
            : it
        )
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar PDF';
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? {...it, status: 'error', errorMessage: msg} : it
        )
      );
      return false;
    }
  };

  const runParallelAiExtraction = async (targets: PdfBatchItem[]) => {
    if (targets.length === 0) return;
    setIsAnalyzingBatch(true);
    const startTime = performance.now();

    const CONCURRENCY_LIMIT = 5;
    let successCount = 0;
    const queue = [...targets];

    const workers = Array.from(
      {length: Math.min(CONCURRENCY_LIMIT, queue.length)},
      async () => {
        while (queue.length > 0) {
          const nextItem = queue.shift();
          if (!nextItem) break;
          const ok = await analyzeSingleItemWithAi(nextItem);
          if (ok) successCount++;
        }
      }
    );

    await Promise.all(workers);

    const elapsedSec = ((performance.now() - startTime) / 1000).toFixed(1);
    setIsAnalyzingBatch(false);
    showToast(
      `Extração concluída em ${elapsedSec}s: ${successCount} de ${targets.length} PDF(s) processados.`
    );
  };

  const handleAnalyzeBatchWithAi = async () => {
    if (items.length === 0) return;
    const targets = items.filter((i) =>
      selectedIds.size > 0 ? selectedIds.has(i.id) : true
    );
    await runParallelAiExtraction(targets);
  };

  const updateItemExtractedField = (
    itemId: string,
    fieldKey:
      | MandatoryFieldKey
      | 'numeroNfseVinculada'
      | 'numeroRpsOuFatura'
      | 'contaAnuncios',
    value: string
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const currentExtracted: ExtractedPdfMetadata = it.extractedData || {
          tipoDocumento: 'NF',
          plataforma: '',
          numero: '',
          mesVeiculacao: '',
          valor: '',
          bu: '',
          produto: '',
          marca: '',
          resumoCurto: 'Editado manualmente na bancada',
          sugestaoNome: it.originalBaseName,
        };
        return {
          ...it,
          extractedData: {
            ...currentExtracted,
            [fieldKey]: value,
          },
        };
      })
    );
  };

  const updateDocTypeRuleTemplate = (docType: string, newTemplate: string) => {
    setConfig((prev) => ({
      ...prev,
      docTypeRules: prev.docTypeRules.map((r) =>
        r.docType === docType ? {...r, patternTemplate: newTemplate} : r
      ),
    }));
  };

  const toggleDocTypeRequiredField = (
    docType: string,
    fieldKey: MandatoryFieldKey
  ) => {
    setConfig((prev) => ({
      ...prev,
      docTypeRules: prev.docTypeRules.map((r) => {
        if (r.docType !== docType) return r;
        const exists = r.requiredFields.includes(fieldKey);
        const nextFields = exists
          ? r.requiredFields.filter((f) => f !== fieldKey)
          : [...r.requiredFields, fieldKey];
        return {...r, requiredFields: nextFields};
      }),
    }));
  };

  const handleAddCustomDocType = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newDocTypeCode.trim();
    if (!code) return;
    if (
      config.docTypeRules.some(
        (r) => r.docType.toLowerCase() === code.toLowerCase()
      )
    ) {
      showToast(`O tipo de documento "${code}" já existe.`);
      return;
    }

    const newRule = {
      docType: code,
      label: newDocTypeLabel.trim() || `Documento (${code})`,
      description: `Padrão personalizado para documentos do tipo ${code}`,
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
      ] as MandatoryFieldKey[],
    };

    setConfig((prev) => ({
      ...prev,
      docTypeRules: [...prev.docTypeRules, newRule],
    }));
    setActiveDocTypeTab(code);
    setNewDocTypeCode('');
    setNewDocTypeLabel('');
    showToast(`Padrão para o tipo "${code}" criado.`);
  };

  const computedRows = useMemo(
    () => resolveBatchFileNames(items, config),
    [items, config]
  );

  const filteredRows = useMemo(() => {
    return computedRows.filter((row) => {
      if (statusFilter === 'changed' && !row.isChanged) return false;
      if (
        statusFilter === 'missing-fields' &&
        row.missingFields.length === 0
      ) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const ext = row.enrichedExtracted || row.item.extractedData;
      return (
        row.item.originalName.toLowerCase().includes(q) ||
        row.finalFileName.toLowerCase().includes(q) ||
        (ext?.plataforma || '').toLowerCase().includes(q) ||
        (ext?.bu || '').toLowerCase().includes(q) ||
        (ext?.marca || '').toLowerCase().includes(q) ||
        (ext?.produto || '').toLowerCase().includes(q) ||
        (ext?.numero || '').toLowerCase().includes(q)
      );
    });
  }, [computedRows, statusFilter, searchQuery]);

  const previewRow = useMemo(
    () => computedRows.find((r) => r.item.id === previewItemId) || null,
    [computedRows, previewItemId]
  );

  const triggerIndividualDownload = (
    item: PdfBatchItem,
    finalFileName: string
  ) => {
    const link = document.createElement('a');
    link.href = item.previewUrl;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id
          ? {...it, downloadedCount: it.downloadedCount + 1}
          : it
      )
    );

    setHistoryRecords((prev) => [
      {
        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        originalName: item.originalName,
        finalName: finalFileName,
        modeUsed: config.mode,
        sizeBytes: item.sizeBytes,
      },
      ...prev,
    ]);
  };

  const handleSequentialBatchDownload = async () => {
    const targetRows = computedRows.filter((r) =>
      selectedIds.size > 0 ? selectedIds.has(r.item.id) : true
    );

    if (targetRows.length === 0) {
      showToast('Selecione ao menos um arquivo PDF na tabela para baixar.');
      return;
    }

    setIsDownloadingBatch(true);
    for (let i = 0; i < targetRows.length; i++) {
      const row = targetRows[i];
      triggerIndividualDownload(row.item, row.finalFileName);
      if (i < targetRows.length - 1) {
        await new Promise((res) => setTimeout(res, 280));
      }
    }
    setIsDownloadingBatch(false);
    showToast(
      `${targetRows.length} PDF(s) baixado(s)! Prosseguindo para a Etapa 2: Preenchimento da Planilha.`
    );
    const sheetEl = document.getElementById('etapa-planilha-faturamento');
    if (sheetEl) {
      sheetEl.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  };

  const startInlineEdit = (item: PdfBatchItem, currentBaseName: string) => {
    setEditingRowId(item.id);
    setEditingValue(item.customName ?? currentBaseName);
  };

  const commitInlineEdit = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              customName: editingValue.trim() ? editingValue.trim() : undefined,
            }
          : it
      )
    );
    setEditingRowId(null);
  };

  const clearCustomOverride = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? {...it, customName: undefined} : it))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (previewItemId === id) setPreviewItemId(null);
  };

  const clearAllItems = () => {
    items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setItems([]);
    setSelectedIds(new Set());
    setPreviewItemId(null);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRows.length && filteredRows.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRows.map((r) => r.item.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const insertTokenIntoRule = (token: string, targetDocType?: string) => {
    const sep = config.aiSeparator === ' ' ? ' ' : config.aiSeparator;
    if (targetDocType) {
      const rule = config.docTypeRules.find((r) => r.docType === targetDocType);
      if (!rule) return;
      const current = rule.patternTemplate.trim();
      const nextTpl = current ? `${current}${sep}${token}` : token;
      updateDocTypeRuleTemplate(targetDocType, nextTpl);
    } else {
      setConfig((prev) => {
        const current = prev.aiTemplate.trim();
        const nextTpl = current ? `${current}${sep}${token}` : token;
        return {...prev, aiTemplate: nextTpl};
      });
    }
  };

  const applySavedPreset = (preset: SavedRulePreset) => {
    setConfig((prev) => ({
      ...prev,
      ...preset.config,
    }));
    setActiveSection('workbench');
    showToast(`Regra "${preset.name}" aplicada ao lote atual.`);
  };

  const handleSaveCurrentPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    const created: SavedRulePreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      category:
        config.mode === 'ai'
          ? 'Extração IA'
          : config.mode === 'regex'
            ? 'Regex'
            : 'Híbrido',
      description:
        newPresetDesc.trim() ||
        (config.mode === 'ai'
          ? `Padrão IA: ${config.aiTemplate}`
          : `Substituir "${config.findPattern || '*'}" por "${config.replaceWith}"`),
      config: {...config},
    };
    setCustomPresets((prev) => [created, ...prev]);
    setNewPresetName('');
    setNewPresetDesc('');
    showToast(`Regra "${created.name}" salva na biblioteca.`);
  };

  const collisionCount = computedRows.filter((r) => r.hasCollision).length;
  const changedCount = computedRows.filter((r) => r.isChanged).length;
  const incompleteRowsCount = computedRows.filter(
    (r) => r.missingFields.length > 0
  ).length;

  const currentDocTypeRule =
    config.docTypeRules.find((r) => r.docType === activeDocTypeTab) ||
    config.docTypeRules[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesAdded(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200">
        <a
          href="#bancada"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('workbench');
          }}
          style={{fontFamily: 'var(--font-display), sans-serif'}}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          DocFlow
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a
            href="#bancada"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('workbench');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'workbench'
                ? 'text-slate-900 border-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:underline'
            }`}
          >
            1. Bancada (Renomear)
          </a>
          <a
            href="#planilha-faturamento"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('spreadsheet');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
              activeSection === 'spreadsheet'
                ? 'text-blue-700 border-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:underline'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            2. Planilha de Faturamento
          </a>
          <a
            href="#padroes-por-tipo"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('doc-type-rules');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'doc-type-rules'
                ? 'text-slate-900 border-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:underline'
            }`}
          >
            Padrões por Tipo
          </a>
          <a
            href="#contas-anuncio"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('ad-accounts');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'ad-accounts'
                ? 'text-slate-900 border-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:underline'
            }`}
          >
            Contas (AdAccount)
          </a>
          <a
            href="#regras-salvas"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('presets');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'presets'
                ? 'text-slate-900 border-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:underline'
            }`}
          >
            Presets
          </a>
          <a
            href="#historico"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('history');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'history'
                ? 'text-slate-900 border-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:underline'
            }`}
          >
            Histórico
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Adicionar PDFs
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden items-center justify-around bg-white border-b border-slate-200 px-2 py-2 text-xs font-medium text-slate-600 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSection('workbench')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeSection === 'workbench'
              ? 'bg-slate-900 text-white'
              : 'hover:text-slate-900'
          }`}
        >
          1. Bancada
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('spreadsheet')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeSection === 'spreadsheet'
              ? 'bg-blue-600 text-white'
              : 'hover:text-slate-900'
          }`}
        >
          2. Planilha
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('doc-type-rules')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeSection === 'doc-type-rules'
              ? 'bg-slate-900 text-white'
              : 'hover:text-slate-900'
          }`}
        >
          Padrões por Tipo
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('presets')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeSection === 'presets'
              ? 'bg-slate-900 text-white'
              : 'hover:text-slate-900'
          }`}
        >
          Presets
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('history')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeSection === 'history'
              ? 'bg-slate-900 text-white'
              : 'hover:text-slate-900'
          }`}
        >
          Histórico
        </button>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-lg border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
            aria-label="Fechar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        {activeSection === 'workbench' && (
          <div className="space-y-6">
            {/* Compact Hero & Batch Context Bar */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200">
              <div className="space-y-1.5 max-w-3xl">
                <p className="text-xs font-medium text-slate-500">
                  Reconhecimento de Layouts: NFS-e Prefeitura · Fatura Meta
                  (Taxonomia c:|p:|b:) · Boleto Itaú/BofA
                </p>
                <h1
                  style={{
                    fontFamily: 'var(--font-display), sans-serif',
                    textWrap: 'balance',
                  }}
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
                >
                  Renomeador inteligente de PDFs com cruzamento automático entre
                  NF, Fatura e Boleto
                </h1>
              </div>

              <div
                style={{fontFamily: 'var(--font-mono), monospace'}}
                className="flex flex-wrap items-center gap-3 text-xs text-slate-600 tabular-nums"
              >
                <span>
                  <strong className="text-slate-900 font-semibold">
                    {items.length}
                  </strong>{' '}
                  arquivos
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <strong className="text-emerald-700 font-semibold">
                    {changedCount}
                  </strong>{' '}
                  prontos
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <strong
                    className={
                      incompleteRowsCount > 0
                        ? 'text-amber-700 font-semibold'
                        : 'text-slate-900 font-semibold'
                    }
                  >
                    {incompleteRowsCount}
                  </strong>{' '}
                  com campos pendentes
                </span>
                {collisionCount > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-700 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {collisionCount} conflito(s)
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT SIDEBAR: Rule Engine Configuration */}
              <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h2
                    style={{fontFamily: 'var(--font-display), sans-serif'}}
                    className="text-base font-bold text-slate-900"
                  >
                    Padrão de Nomenclatura (IA)
                  </h2>
                  <button
                    type="button"
                    onClick={() => setConfig(DEFAULT_RENAME_CONFIG)}
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 whitespace-nowrap cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restaurar
                  </button>
                </div>

                {/* AI & PER-DOCUMENT-TYPE RULES PANEL */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                    {/* Toggle Cross-Linking between NF, Fatura and Boleto */}
                    <div className="flex items-center justify-between gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div>
                        <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-blue-600" />
                          Vincular NF + Fatura + Boleto do Lote
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Preenche Produto (p:Graduate → Graduação) e Marca
                          (b:Mackenzie) na NFS-e cruzando pelo RPS/Fatura
                          (529929) ou Conta
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.enableCrossLinking}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            enableCrossLinking: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Toggle Per-Document-Type Rules vs Global Mask */}
                    <div className="flex items-center justify-between gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          Regra específica por Tipo de Documento
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Máscara e campos obrigatórios para NF, Fatura e Boleto
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.usePerDocTypeRules}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            usePerDocTypeRules: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {config.usePerDocTypeRules ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">
                            Tipo de Documento Ativo
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveSection('doc-type-rules')}
                            className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Layers className="w-3 h-3" />
                            Configurar Todos
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg">
                          {config.docTypeRules.map((r) => (
                            <button
                              key={r.docType}
                              type="button"
                              onClick={() => setActiveDocTypeTab(r.docType)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap cursor-pointer ${
                                activeDocTypeTab === r.docType
                                  ? 'bg-white text-slate-900 shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {r.docType}
                            </button>
                          ))}
                        </div>

                        {currentDocTypeRule && (
                          <div className="space-y-3 pt-1">
                            <div>
                              <label
                                htmlFor="doctype-mask-input"
                                className="block text-[11px] font-semibold text-slate-700 mb-1"
                              >
                                Máscara para {currentDocTypeRule.label}
                              </label>
                              <input
                                id="doctype-mask-input"
                                type="text"
                                value={currentDocTypeRule.patternTemplate}
                                onChange={(e) =>
                                  updateDocTypeRuleTemplate(
                                    currentDocTypeRule.docType,
                                    e.target.value
                                  )
                                }
                                style={{
                                  fontFamily: 'var(--font-mono), monospace',
                                }}
                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                              />
                            </div>

                            <div>
                              <span className="block text-[11px] text-slate-500 mb-1.5">
                                Variáveis de {currentDocTypeRule.docType}:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {MANDATORY_FIELD_DEFINITIONS.map((field) => (
                                  <button
                                    key={field.key}
                                    type="button"
                                    onClick={() =>
                                      insertTokenIntoRule(
                                        field.token,
                                        currentDocTypeRule.docType
                                      )
                                    }
                                    style={{
                                      fontFamily: 'var(--font-mono), monospace',
                                    }}
                                    className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors whitespace-nowrap cursor-pointer"
                                    title={`Inserir ${field.label}`}
                                  >
                                    + {field.token}
                                  </button>
                                ))}
                                {EXTRA_TOKEN_DEFINITIONS.map((extra) => (
                                  <button
                                    key={extra.token}
                                    type="button"
                                    onClick={() =>
                                      insertTokenIntoRule(
                                        extra.token,
                                        currentDocTypeRule.docType
                                      )
                                    }
                                    style={{
                                      fontFamily: 'var(--font-mono), monospace',
                                    }}
                                    className="px-2 py-1 text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-800 rounded transition-colors whitespace-nowrap cursor-pointer"
                                    title={`Inserir ${extra.label}`}
                                  >
                                    + {extra.token}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                              <span className="block text-[11px] font-semibold text-slate-700 mb-2">
                                Campos Obrigatórios para{' '}
                                {currentDocTypeRule.docType}:
                              </span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {MANDATORY_FIELD_DEFINITIONS.map((field) => {
                                  const isReq =
                                    currentDocTypeRule.requiredFields.includes(
                                      field.key
                                    );
                                  return (
                                    <label
                                      key={field.key}
                                      className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isReq}
                                        onChange={() =>
                                          toggleDocTypeRequiredField(
                                            currentDocTypeRule.docType,
                                            field.key
                                          )
                                        }
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="truncate">
                                        {field.shortLabel}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label
                          htmlFor="global-ai-template"
                          className="block text-xs font-semibold text-slate-800 mb-1.5"
                        >
                          Máscara Única Global
                        </label>
                        <input
                          id="global-ai-template"
                          type="text"
                          value={config.aiTemplate}
                          onChange={(e) =>
                            setConfig((c) => ({
                              ...c,
                              aiTemplate: e.target.value,
                            }))
                          }
                          style={{fontFamily: 'var(--font-mono), monospace'}}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {MANDATORY_FIELD_DEFINITIONS.map((field) => (
                            <button
                              key={field.key}
                              type="button"
                              onClick={() => insertTokenIntoRule(field.token)}
                              style={{
                                fontFamily: 'var(--font-mono), monospace',
                              }}
                              className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors whitespace-nowrap cursor-pointer"
                            >
                              + {field.token}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Default Batch Context Fallback Fields */}
                    <div className="pt-3 border-t border-slate-200 space-y-2.5">
                      <p className="text-xs font-semibold text-slate-800">
                        Valores Padrão do Lote (Usados se ausentes no PDF)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label
                            htmlFor="default-bu"
                            className="block text-[11px] text-slate-600 mb-0.5"
                          >
                            BU Padrão
                          </label>
                          <input
                            id="default-bu"
                            type="text"
                            value={config.defaultBu}
                            onChange={(e) =>
                              setConfig((c) => ({
                                ...c,
                                defaultBu: e.target.value,
                              }))
                            }
                            placeholder="Ex: Platos, Kroton"
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="default-marca"
                            className="block text-[11px] text-slate-600 mb-0.5"
                          >
                            Marca Padrão
                          </label>
                          <input
                            id="default-marca"
                            type="text"
                            value={config.defaultMarca}
                            onChange={(e) =>
                              setConfig((c) => ({
                                ...c,
                                defaultMarca: e.target.value,
                              }))
                            }
                            placeholder="Ex: Mackenzie, Anhanguera"
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="default-produto"
                            className="block text-[11px] text-slate-600 mb-0.5"
                          >
                            Produto Padrão
                          </label>
                          <input
                            id="default-produto"
                            type="text"
                            value={config.defaultProduto}
                            onChange={(e) =>
                              setConfig((c) => ({
                                ...c,
                                defaultProduto: e.target.value,
                              }))
                            }
                            placeholder="Ex: Graduação"
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="default-mes"
                            className="block text-[11px] text-slate-600 mb-0.5"
                          >
                            Mês Veiculação
                          </label>
                          <input
                            id="default-mes"
                            type="text"
                            value={config.defaultMesVeiculacao}
                            onChange={(e) =>
                              setConfig((c) => ({
                                ...c,
                                defaultMesVeiculacao: e.target.value,
                              }))
                            }
                            placeholder="Ex: Setembro"
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAnalyzingBatch || items.length === 0}
                      onClick={handleAnalyzeBatchWithAi}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                    >
                      {isAnalyzingBatch ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Extraindo em Paralelo via IA...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Reanalisar Lote com IA ({selectedIds.size || items.length}{' '}
                          PDFs)
                        </>
                      )}
                    </button>
                </div>

                {/* COMMON FORMATTING RULES */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    Formatação & Sequência
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label
                        htmlFor="sequence-select"
                        className="block text-[11px] font-medium text-slate-600 mb-1"
                      >
                        Sequência Numérica
                      </label>
                      <select
                        id="sequence-select"
                        value={config.sequenceMode}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            sequenceMode: e.target.value as
                              | 'none'
                              | 'prefix'
                              | 'suffix',
                          }))
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <option value="none">Sem numeração</option>
                        <option value="prefix">No início (001_...)</option>
                        <option value="suffix">No final (..._001)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="case-select"
                        className="block text-[11px] font-medium text-slate-600 mb-1"
                      >
                        Caixa do Texto
                      </label>
                      <select
                        id="case-select"
                        value={config.caseTransform}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            caseTransform: e.target.value as CaseTransform,
                          }))
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <option value="preserve">Manter original</option>
                        <option value="kebab">kebab-case</option>
                        <option value="snake">snake_case</option>
                        <option value="uppercase">MAIÚSCULAS</option>
                        <option value="lowercase">minúsculas</option>
                      </select>
                    </div>
                  </div>
                </div>
              </aside>

              {/* RIGHT WORKSPACE: Dropzone + Table + Structured 8-Field Editor */}
              <section className="lg:col-span-8 space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFilesAdded(e.dataTransfer.files);
                    }
                  }}
                  className={`bg-white border border-dashed rounded-xl p-4 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    isDragging
                      ? 'border-blue-600 bg-blue-50/40'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      <FilePlus2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        Solte aqui seus PDFs (NFS-e Prefeitura, Faturas Meta,
                        Boletos Itaú/BofA)
                      </p>
                      <p className="text-xs text-slate-500">
                        Extração paralela ultra-rápida + cruzamento automático de
                        Produto (p:) e Marca (b:) entre Fatura e NFS-e
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => loadDemoBatch(false)}
                      className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Recarregar 3 PDFs Reais
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Selecionar PDFs
                    </button>
                  </div>
                </div>

                {/* Table Container */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative flex-1 max-w-xs">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Filtrar por Platos, Mackenzie, Meta, Nº..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        />
                      </div>

                      <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setStatusFilter('all')}
                          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                            statusFilter === 'all'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Todos ({items.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusFilter('missing-fields')}
                          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                            statusFilter === 'missing-fields'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Campos Pendentes ({incompleteRowsCount})
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {items.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAllItems}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const sheetEl = document.getElementById(
                            'etapa-planilha-faturamento'
                          );
                          if (sheetEl) {
                            sheetEl.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                            });
                          } else {
                            setActiveSection('spreadsheet');
                          }
                        }}
                        className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Ir para Etapa 2: Planilha
                      </button>
                      <button
                        type="button"
                        disabled={items.length === 0 || isDownloadingBatch}
                        onClick={handleSequentialBatchDownload}
                        className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {isDownloadingBatch
                          ? 'Baixando arquivos...'
                          : `Baixar Selecionados Individualmente (${
                              selectedIds.size || items.length
                            })`}
                      </button>
                    </div>
                  </div>

                  {/* High-Density Comparison Table */}
                  {filteredRows.length === 0 ? (
                    <div className="py-16 px-6 text-center space-y-3">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          Nenhum arquivo PDF encontrado neste filtro
                        </p>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Adicione arquivos PDF ou recarregue os 3 PDFs reais de
                          referência (NFS-e Prefeitura, Fatura Meta e Boleto Itaú).
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                            <th className="py-2.5 pl-4 pr-2 w-9">
                              <input
                                type="checkbox"
                                checked={
                                  filteredRows.length > 0 &&
                                  selectedIds.size === filteredRows.length
                                }
                                onChange={toggleSelectAll}
                                aria-label="Selecionar todos"
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </th>
                            <th className="py-2.5 px-3">
                              Arquivo Original & Metadados Lidos
                            </th>
                            <th className="py-2.5 px-1 w-6"></th>
                            <th className="py-2.5 px-3">
                              Novo Nome Padronizado (Por Tipo de Doc)
                            </th>
                            <th className="py-2.5 pl-3 pr-4 text-right">
                              Ações Individuais
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-xs">
                          {filteredRows.map((row) => {
                            const {
                              item,
                              enrichedExtracted,
                              finalFileName,
                              proposedBaseName,
                              hasCollision,
                              isChanged,
                              missingFields,
                            } = row;
                            const isEditing = editingRowId === item.id;
                            const isSelected = selectedIds.has(item.id);
                            const ext = enrichedExtracted || item.extractedData;

                            return (
                              <tr
                                key={item.id}
                                onClick={() => setPreviewItemId(item.id)}
                                className={`transition-colors hover:bg-slate-50/90 cursor-pointer ${
                                  previewItemId === item.id ? 'bg-blue-50/50' : ''
                                }`}
                              >
                                <td
                                  className="py-3 pl-4 pr-2 align-top"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectOne(item.id)}
                                    aria-label={`Selecionar ${item.originalName}`}
                                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                </td>

                                {/* Original Filename & Unboxed 8-Field Metadata Summary */}
                                <td className="py-3 px-3 align-top max-w-[260px]">
                                  <div
                                    style={{
                                      fontFamily: 'var(--font-mono), monospace',
                                    }}
                                    className="font-medium text-slate-700 truncate"
                                    title={item.originalName}
                                  >
                                    {item.originalName}
                                  </div>

                                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 leading-relaxed">
                                    {item.status === 'analyzing' ? (
                                      <span className="text-blue-600 font-medium flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                        Extraindo campos via IA...
                                      </span>
                                    ) : ext ? (
                                      <>
                                        <strong className="text-slate-900">
                                          {ext.tipoDocumento || 'Sem Tipo'}
                                        </strong>
                                        <span aria-hidden="true">·</span>
                                        <span>
                                          {ext.plataforma || 'Sem Plataforma'}
                                        </span>
                                        <span aria-hidden="true">·</span>
                                        <span
                                          style={{
                                            fontFamily:
                                              'var(--font-mono), monospace',
                                          }}
                                          className="tabular-nums"
                                        >
                                          Nº {ext.numero || '---'}
                                        </span>
                                        <span aria-hidden="true">·</span>
                                        <span
                                          style={{
                                            fontFamily:
                                              'var(--font-mono), monospace',
                                          }}
                                          className="tabular-nums"
                                        >
                                          {ext.mesVeiculacao || 'Sem Mês'}
                                        </span>
                                        <span aria-hidden="true">·</span>
                                        <span
                                          style={{
                                            fontFamily:
                                              'var(--font-mono), monospace',
                                          }}
                                          className="tabular-nums text-slate-700 font-medium"
                                        >
                                          R$ {ext.valor || '0,00'}
                                        </span>
                                        <span aria-hidden="true">·</span>
                                        <span>
                                          {ext.bu || 'BU?'} /{' '}
                                          {ext.produto || 'Prod?'} /{' '}
                                          {ext.marca || 'Marca?'}
                                        </span>
                                      </>
                                    ) : (
                                      <span>Aguardando leitura IA</span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3 px-1 align-top text-slate-400">
                                  <ArrowRight className="w-3.5 h-3.5 mt-1" />
                                </td>

                                {/* Proposed / Editable New Filename + Required Field Validation */}
                                <td
                                  className="py-3 px-3 align-top max-w-[330px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {isEditing ? (
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        value={editingValue}
                                        onChange={(e) =>
                                          setEditingValue(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            commitInlineEdit(item.id);
                                          } else if (e.key === 'Escape') {
                                            setEditingRowId(null);
                                          }
                                        }}
                                        autoFocus
                                        style={{
                                          fontFamily: 'var(--font-mono), monospace',
                                        }}
                                        className="w-full px-2 py-1 text-xs bg-white border border-blue-600 rounded focus:outline-none"
                                      />
                                      <span
                                        style={{
                                          fontFamily: 'var(--font-mono), monospace',
                                        }}
                                        className="text-xs text-slate-400"
                                      >
                                        .pdf
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => commitInlineEdit(item.id)}
                                        className="p-1 text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingRowId(null)}
                                        className="p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="group flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            startInlineEdit(item, proposedBaseName)
                                          }
                                          style={{
                                            fontFamily:
                                              'var(--font-mono), monospace',
                                          }}
                                          className={`text-left font-semibold break-all hover:underline cursor-pointer ${
                                            isChanged
                                              ? 'text-emerald-700'
                                              : 'text-slate-800'
                                          }`}
                                          title="Clique para editar manualmente o nome final"
                                        >
                                          {finalFileName}
                                        </button>

                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                                          {missingFields.length === 0 ? (
                                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                                              <Check className="w-3 h-3" />
                                              Campos obrigatórios OK
                                            </span>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setPreviewItemId(item.id)
                                              }
                                              className="text-amber-700 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                                            >
                                              <AlertTriangle className="w-3 h-3 shrink-0" />
                                              Falta preencher:{' '}
                                              {missingFields
                                                .map(
                                                  (k) =>
                                                    MANDATORY_FIELD_DEFINITIONS.find(
                                                      (d) => d.key === k
                                                    )?.shortLabel || k
                                                )
                                                .join(', ')}
                                            </button>
                                          )}

                                          {ext?.adAccountName && (
                                            <span
                                              className="text-blue-700 font-medium flex items-center gap-1"
                                              title={`Identificado pela tabela de Contas de Anúncio: ${ext.adAccountName}`}
                                            >
                                              <Link2 className="w-3 h-3" />
                                              {ext.adAccountName}
                                            </span>
                                          )}

                                          {!ext?.adAccountName &&
                                            ext?.crossLinkedFrom && (
                                              <span
                                                className="text-blue-700 font-medium flex items-center gap-1"
                                                title={`Produto e Marca herdados automaticamente de ${ext.crossLinkedFrom} via RPS/NF`}
                                              >
                                                <Link2 className="w-3 h-3" />
                                                Vinculado à Fatura
                                              </span>
                                            )}

                                          {item.customName && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                clearCustomOverride(item.id)
                                              }
                                              className="text-slate-500 underline hover:text-slate-800 cursor-pointer"
                                            >
                                              Reverter edição manual
                                            </button>
                                          )}
                                          {hasCollision && (
                                            <span className="text-amber-700 font-medium">
                                              · Sufixo anti-colisão
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          startInlineEdit(item, proposedBaseName)
                                        }
                                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-opacity shrink-0 cursor-pointer"
                                        title="Editar nome final manualmente"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </td>

                                {/* Individual Row Actions */}
                                <td
                                  className="py-3 pl-3 pr-4 align-top text-right whitespace-nowrap"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => analyzeSingleItemWithAi(item)}
                                      disabled={item.status === 'analyzing'}
                                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                      title="Reanalisar este PDF com IA"
                                    >
                                      <Sparkles className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewItemId((curr) =>
                                          curr === item.id ? null : item.id
                                        )
                                      }
                                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                        previewItemId === item.id
                                          ? 'bg-blue-600 text-white'
                                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                      }`}
                                      title="Editar campos e visualizar PDF"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        triggerIndividualDownload(
                                          item,
                                          finalFileName
                                        )
                                      }
                                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                                      title={`Baixar ${finalFileName}`}
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      Baixar PDF
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeItem(item.id)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                      title="Remover do lote"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Inspector & Live 8-Field Editor Panel */}
                {previewRow && (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
                      <div className="min-w-0">
                        <p
                          style={{fontFamily: 'var(--font-mono), monospace'}}
                          className="text-xs font-semibold text-emerald-700 truncate"
                        >
                          Novo Nome: {previewRow.finalFileName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Original: {previewRow.item.originalName} · Padrão
                          identificado:{' '}
                          <strong>
                            {previewRow.matchedRule?.label || 'Padrão Global'}
                          </strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => analyzeSingleItemWithAi(previewRow.item)}
                          disabled={previewRow.item.status === 'analyzing'}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          Extrair Campos com IA
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            triggerIndividualDownload(
                              previewRow.item,
                              previewRow.finalFileName
                            )
                          }
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Baixar PDF Renomeado
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewItemId(null)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer"
                          title="Fechar inspeção"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12">
                      {/* Editable 8 Corporate Mandatory Fields + Cross-Reference IDs */}
                      <div className="md:col-span-6 p-5 border-b md:border-b-0 md:border-r border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-slate-900">
                            8 Campos Obrigatórios + Vínculos (NF / RPS / Conta)
                          </h3>
                          {previewRow.enrichedExtracted?.crossLinkedFrom && (
                            <span className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              Enriquecido por vínculo de lote
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {MANDATORY_FIELD_DEFINITIONS.map((field) => {
                            const rawVal =
                              previewRow.item.extractedData?.[field.key] || '';
                            const effectiveVal =
                              previewRow.enrichedExtracted?.[field.key] || rawVal;
                            const isMissing = previewRow.missingFields.includes(
                              field.key
                            );

                            return (
                              <div key={field.key}>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-semibold text-slate-700">
                                    {field.label}
                                  </label>
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono), monospace',
                                    }}
                                    className="text-[10px] text-slate-400"
                                  >
                                    {field.token}
                                  </span>
                                </div>
                                {field.key === 'tipoDocumento' ? (
                                  <select
                                    value={effectiveVal || 'NF'}
                                    onChange={(e) =>
                                      updateItemExtractedField(
                                        previewRow.item.id,
                                        'tipoDocumento',
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                                  >
                                    {config.docTypeRules.map((r) => (
                                      <option key={r.docType} value={r.docType}>
                                        {r.docType} — {r.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={effectiveVal}
                                    onChange={(e) =>
                                      updateItemExtractedField(
                                        previewRow.item.id,
                                        field.key,
                                        e.target.value
                                      )
                                    }
                                    placeholder={field.placeholder}
                                    className={`w-full px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white ${
                                      isMissing
                                        ? 'bg-amber-50/70 border border-amber-400 text-slate-900'
                                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                                    }`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Cross-Reference Identifiers & Editable AdAccount Lookup */}
                        <div className="pt-3 border-t border-slate-200 space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label className="text-[11px] font-semibold text-slate-700">
                              Identificação de Conta (AdAccount) — Cruzamento
                              Automático:
                            </label>
                            {previewRow.enrichedExtracted?.adAccountName && (
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono), monospace',
                                }}
                                className="text-[11px] font-semibold text-blue-700"
                              >
                                {previewRow.enrichedExtracted.adAccountName}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={
                                previewRow.item.extractedData?.contaAnuncios ||
                                ''
                              }
                              onChange={(e) =>
                                updateItemExtractedField(
                                  previewRow.item.id,
                                  'contaAnuncios',
                                  e.target.value
                                )
                              }
                              placeholder="Digite ou selecione um ID (ex: 394854253002344 ou 6229390997)"
                              style={{fontFamily: 'var(--font-mono), monospace'}}
                              className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                            />
                            <select
                              value={
                                previewRow.item.extractedData?.contaAnuncios ||
                                ''
                              }
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                const found = AD_ACCOUNT_DIRECTORY.find(
                                  (a) => a.id === selectedId
                                );
                                updateItemExtractedField(
                                  previewRow.item.id,
                                  'contaAnuncios',
                                  selectedId
                                );
                                if (found) {
                                  updateItemExtractedField(
                                    previewRow.item.id,
                                    'plataforma',
                                    found.plataforma
                                  );
                                  updateItemExtractedField(
                                    previewRow.item.id,
                                    'marca',
                                    found.marca
                                  );
                                  updateItemExtractedField(
                                    previewRow.item.id,
                                    'produto',
                                    found.produto
                                  );
                                }
                              }}
                              className="max-w-[210px] px-2 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-800"
                            >
                              <option value="">Selecionar Conta...</option>
                              {AD_ACCOUNT_DIRECTORY.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                  {acc.id} — {acc.marca} ({acc.produto})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div
                            style={{fontFamily: 'var(--font-mono), monospace'}}
                            className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 tabular-nums pt-1"
                          >
                            <span>
                              NFS-e Vinculada:{' '}
                              <strong className="text-slate-900">
                                {previewRow.item.extractedData
                                  ?.numeroNfseVinculada || '---'}
                              </strong>
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              RPS / Fatura:{' '}
                              <strong className="text-slate-900">
                                {previewRow.item.extractedData
                                  ?.numeroRpsOuFatura || '---'}
                              </strong>
                            </span>
                            {previewRow.item.extractedData?.dataVencimento && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>
                                  Vencimento:{' '}
                                  <strong className="text-slate-900">
                                    {
                                      previewRow.item.extractedData
                                        .dataVencimento
                                    }
                                  </strong>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Embedded PDF Viewer */}
                      <div className="md:col-span-6 bg-slate-100 h-[440px]">
                        <iframe
                          src={previewRow.item.previewUrl}
                          title={`Visualização de ${previewRow.item.originalName}`}
                          className="w-full h-full border-0"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* ETAPA 2: POST-RENAMING BILLING SPREADSHEET */}
            <BillingSpreadsheetPanel
              computedRows={computedRows}
              onNotify={showToast}
            />
          </div>
        )}

        {/* DEDICATED FULL-SCREEN BILLING SPREADSHEET VIEW (ETAPA 2) */}
        {activeSection === 'spreadsheet' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Etapa 2 (Pós-Renomeação) · Consolidação para Faturamento de
                  Mídia
                </p>
                <h1
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                  className="text-2xl font-bold text-slate-900 mt-1"
                >
                  Planilha de Faturamento (7 Colunas Padronizadas)
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('workbench')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg whitespace-nowrap cursor-pointer"
              >
                Voltar para a Etapa 1: Bancada ({items.length} PDFs)
              </button>
            </div>

            <BillingSpreadsheetPanel
              computedRows={computedRows}
              onNotify={showToast}
            />
          </div>
        )}

        {/* PER-DOCUMENT-TYPE NAMING RULES MANAGER VIEW */}
        {activeSection === 'doc-type-rules' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Governança de Nomenclatura · Regras e Campos Obrigatórios por
                  Tipo de Documento
                </p>
                <h1
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                  className="text-2xl font-bold text-slate-900 mt-1"
                >
                  Padrões de Nomenclatura por Tipo de Documento
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('workbench')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap cursor-pointer"
              >
                Voltar para a Bancada ({items.length} PDFs)
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <form
                onSubmit={handleAddCustomDocType}
                className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4"
              >
                <h2
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                  className="text-base font-bold text-slate-900 flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-blue-600" />
                  Adicionar Novo Tipo de Documento
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cadastre um novo tipo documental com sua própria ordem de
                  campos e validação de obrigatoriedade.
                </p>

                <div>
                  <label
                    htmlFor="new-doctype-code"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Nome / Sigla no Arquivo
                  </label>
                  <input
                    id="new-doctype-code"
                    type="text"
                    required
                    value={newDocTypeCode}
                    onChange={(e) => setNewDocTypeCode(e.target.value)}
                    placeholder="Ex: Relatorio, Comprovante, Nota-Debito"
                    style={{fontFamily: 'var(--font-mono), monospace'}}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new-doctype-label"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Título Descritivo
                  </label>
                  <input
                    id="new-doctype-label"
                    type="text"
                    value={newDocTypeLabel}
                    onChange={(e) => setNewDocTypeLabel(e.target.value)}
                    placeholder="Ex: Relatório de Veiculação"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Criar Tipo de Documento
                </button>
              </form>

              <div className="lg:col-span-8 space-y-4">
                {config.docTypeRules.map((rule) => (
                  <div
                    key={rule.docType}
                    className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          style={{fontFamily: 'var(--font-mono), monospace'}}
                          className="text-xs font-bold text-blue-700"
                        >
                          [{rule.docType}]
                        </span>
                        <h3
                          style={{fontFamily: 'var(--font-display), sans-serif'}}
                          className="text-base font-bold text-slate-900"
                        >
                          {rule.label}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {rule.description}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Padrão de Nomenclatura ({rule.docType})
                      </label>
                      <input
                        type="text"
                        value={rule.patternTemplate}
                        onChange={(e) =>
                          updateDocTypeRuleTemplate(rule.docType, e.target.value)
                        }
                        style={{fontFamily: 'var(--font-mono), monospace'}}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {MANDATORY_FIELD_DEFINITIONS.map((field) => (
                          <button
                            key={field.key}
                            type="button"
                            onClick={() =>
                              insertTokenIntoRule(field.token, rule.docType)
                            }
                            style={{fontFamily: 'var(--font-mono), monospace'}}
                            className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors cursor-pointer"
                          >
                            + {field.token}
                          </button>
                        ))}
                        {EXTRA_TOKEN_DEFINITIONS.map((extra) => (
                          <button
                            key={extra.token}
                            type="button"
                            onClick={() =>
                              insertTokenIntoRule(extra.token, rule.docType)
                            }
                            style={{fontFamily: 'var(--font-mono), monospace'}}
                            className="px-2 py-1 text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-800 rounded transition-colors cursor-pointer"
                          >
                            + {extra.token}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="block text-xs font-semibold text-slate-800 mb-2">
                        Campos Obrigatórios exigidos para {rule.label}:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {MANDATORY_FIELD_DEFINITIONS.map((field) => {
                          const checked = rule.requiredFields.includes(field.key);
                          return (
                            <label
                              key={field.key}
                              className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  toggleDocTypeRequiredField(
                                    rule.docType,
                                    field.key
                                  )
                                }
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span>{field.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AD ACCOUNTS LOOKUP DIRECTORY VIEW */}
        {activeSection === 'ad-accounts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Memória de Consulta Automática · 16 Contas de Anúncio (Google & Meta)
                </p>
                <h1
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                  className="text-2xl font-bold text-slate-900 mt-1"
                >
                  Base de Contas de Anúncio (AdAccount → Marca e Produto)
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('workbench')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg whitespace-nowrap cursor-pointer"
              >
                Voltar para a Bancada
              </button>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Como funciona o cruzamento automático:</strong>{' '}
              Sempre que um PDF não informar explicitamente a <strong>Marca</strong>, o{' '}
              <strong>Produto</strong> ou a <strong>Plataforma</strong> (por exemplo, uma{' '}
              <strong>NFS-e da Prefeitura de SP</strong> que traz apenas{' '}
              <code className="px-1.5 py-0.5 bg-white rounded border border-blue-200">
                Referente a conta de anuncios: 394854253002344
              </code>{' '}
              ou uma Fatura com{' '}
              <code className="px-1.5 py-0.5 bg-white rounded border border-blue-200">
                Identificação de Conta (AdAccount)
              </code>
              ), o DocFlow consulta automaticamente esta tabela na memória e preenche{' '}
              <strong>Plataforma</strong>, <strong>Marca</strong> e <strong>Produto</strong>.
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                      <th className="py-3 px-4">ID da Conta (AdAccount)</th>
                      <th className="py-3 px-4">Nome da Conta de Anúncio</th>
                      <th className="py-3 px-4">Plataforma</th>
                      <th className="py-3 px-4">Marca Preenchida</th>
                      <th className="py-3 px-4">Produto Preenchido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {AD_ACCOUNT_DIRECTORY.map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-50">
                        <td
                          style={{fontFamily: 'var(--font-mono), monospace'}}
                          className="py-3 px-4 font-semibold text-blue-700 tabular-nums whitespace-nowrap"
                        >
                          {acc.id}
                        </td>
                        <td
                          style={{fontFamily: 'var(--font-mono), monospace'}}
                          className="py-3 px-4 text-slate-800"
                        >
                          {acc.accountName}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {acc.plataforma}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {acc.marca}
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">
                          {acc.produto}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SAVED PRESETS VIEW */}
        {activeSection === 'presets' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Biblioteca de Padrões · Reutilização Rápida
                </p>
                <h1
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                  className="text-2xl font-bold text-slate-900 mt-1"
                >
                  Presets de Nomenclatura Salvos
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('workbench')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg whitespace-nowrap cursor-pointer"
              >
                Voltar para a Bancada
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <form
                onSubmit={handleSaveCurrentPreset}
                className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4"
              >
                <h2
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                  className="text-base font-bold text-slate-900 flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4 text-blue-600" />
                  Salvar Configuração Atual
                </h2>
                <div>
                  <label
                    htmlFor="preset-name"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Nome do Preset
                  </label>
                  <input
                    id="preset-name"
                    type="text"
                    required
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Ex: Fechamento Mídia Platos / Mackenzie"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="preset-desc"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Descrição curta
                  </label>
                  <input
                    id="preset-desc"
                    type="text"
                    value={newPresetDesc}
                    onChange={(e) => setNewPresetDesc(e.target.value)}
                    placeholder="Ex: NFs, Faturas e Boletos com vínculo automático"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Salvar na Biblioteca
                </button>
              </form>

              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {customPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{preset.category}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          style={{fontFamily: 'var(--font-mono), monospace'}}
                        >
                          Modo: {preset.config.mode?.toUpperCase() || 'IA'}
                        </span>
                      </div>
                      <h3
                        style={{fontFamily: 'var(--font-display), sans-serif'}}
                        className="text-base font-bold text-slate-900"
                      >
                        {preset.name}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {preset.description}
                      </p>
                      {preset.config.aiTemplate && (
                        <p
                          style={{fontFamily: 'var(--font-mono), monospace'}}
                          className="text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 truncate"
                        >
                          {preset.config.aiTemplate}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => applySavedPreset(preset)}
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Aplicar Preset ao Lote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SESSION HISTORY VIEW */}
        {activeSection === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Rastreabilidade de Arquivos · Registro De → Para
                </p>
                <h1
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                  className="text-2xl font-bold text-slate-900 mt-1"
                >
                  Histórico de Renomeações da Sessão
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('workbench')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg whitespace-nowrap cursor-pointer"
              >
                Voltar para a Bancada
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {historyRecords.length === 0 ? (
                <div className="py-16 px-6 text-center space-y-2">
                  <History className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-900">
                    Nenhum arquivo baixado ainda nesta sessão
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Assim que você baixar arquivos PDF renomeados na bancada, o
                    registro completo de &ldquo;Nome Antigo → Nome Novo&rdquo;
                    aparecerá aqui.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                        <th className="py-3 px-4">Horário</th>
                        <th className="py-3 px-4">Nome Original</th>
                        <th className="py-3 px-4">Novo Nome Baixado</th>
                        <th className="py-3 px-4">Modo</th>
                        <th className="py-3 px-4 text-right">Tamanho</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {historyRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td
                            style={{fontFamily: 'var(--font-mono), monospace'}}
                            className="py-3 px-4 text-slate-500 tabular-nums whitespace-nowrap"
                          >
                            {rec.timestamp}
                          </td>
                          <td
                            style={{fontFamily: 'var(--font-mono), monospace'}}
                            className="py-3 px-4 text-slate-600"
                          >
                            {rec.originalName}
                          </td>
                          <td
                            style={{fontFamily: 'var(--font-mono), monospace'}}
                            className="py-3 px-4 font-semibold text-emerald-700"
                          >
                            {rec.finalName}
                          </td>
                          <td className="py-3 px-4 text-slate-600 uppercase">
                            {rec.modeUsed}
                          </td>
                          <td
                            style={{fontFamily: 'var(--font-mono), monospace'}}
                            className="py-3 px-4 text-right text-slate-500 tabular-nums"
                          >
                            {formatBytes(rec.sizeBytes)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
