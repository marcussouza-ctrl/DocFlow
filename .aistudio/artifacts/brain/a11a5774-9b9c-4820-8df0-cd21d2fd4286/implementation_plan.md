# DocFlow — Renomeador Inteligente de PDFs em Lote

Uma bancada de trabalho utilitária de alta precisão para organizar e renomear dezenas de arquivos PDF simultaneamente, combinando extração semântica do conteúdo via Inteligência Artificial e regras determinísticas de substituição/Expressões Regulares (Regex), com pré-visualização em tempo real e download individual ágil.

## Revisão do Usuário & Decisões Confirmadas

> [!IMPORTANT]
> As escolhas abaixo refletem suas preferências confirmadas na etapa anterior, juntamente com padrões recomendados para garantir um fluxo de trabalho rápido e confiável.

- **Regras de Renomeação (Confirmado)**: Combinação de **Extração Inteligente via IA** (lendo o conteúdo do próprio PDF para extrair dados como data de emissão, cliente, número de nota/contrato ou título) e **Substituição de Termos / Regex** (localizar e substituir padrões de texto, prefixos/sufixos e limpeza de caracteres).
- **Formato de Exportação (Confirmado)**: **Download Individual** direto para cada arquivo PDF com o novo nome aplicado, além de um botão de conveniência para disparar o download sequencial de todos os itens selecionados sem precisar compactar em ZIP.
- **Extras de Produtividade (Padrão Recomendado)**: Edição manual direta na tabela (inline) para ajustes finos por arquivo, pré-visualização rápida do documento PDF em painel lateral e templates pré-configurados (ex.: Notas Fiscais, Contratos, Boletos, Artigos Acadêmicos).

---

## 1. Visão Geral & Conceito Central

- **O Que Faz**: Permite arrastar e soltar múltiplos arquivos PDF, definir uma instrução de nomeação inteligente (ex.: `[Data] - [Cliente] - [Tipo de Documento]`) ou uma regra de Regex/Substituição, visualizar instantaneamente como cada nome ficará ("De → Para"), ajustar qualquer nome manualmente se desejar e baixar os arquivos já renomeados.
- **Público-Alvo**: Profissionais administrativos, jurídicos, contábeis, acadêmicos e analistas que lidam diariamente com lotes de PDFs com nomes genéricos (como `scan_001.pdf` ou `whatsapp_doc_293.pdf`).
- **Valor Principal**: Elimina o trabalho manual repetitivo de abrir cada PDF para descobrir do que se trata antes de renomeá-lo.

---

## 2. Experiência do Usuário & Design Visual

### Fluxo Principal do Usuário
1. **Importação de Arquivos**: O usuário arrasta múltiplos PDFs para a zona de upload (ou carrega arquivos de exemplo reais gerados na hora para testar imediatamente).
2. **Escolha do Modo de Renomeação**:
   - **Modo IA (Extração de Conteúdo)**: O usuário escolhe um padrão de máscara com variáveis extraídas do documento (ex.: `{data}_{empresa}_{tipo}_{valor}`) ou escreve uma instrução personalizada em português (ex.: *"Extraia o nome do aluno, a disciplina e o semestre em formato YYYY-MM"*).
   - **Modo Regex & Texto**: O usuário define regras de Localizar/Substituir (com suporte a Expressões Regulares e grupos de captura `$1`, `$2`), adição de prefixo/sufixo, numeração sequencial (`001, 002...`) e padronização de caixa (MAIÚSCULAS, minúsculas, `snake_case`, `kebab-case`).
3. **Inspeção & Comparação (Grade "De → Para")**: Uma tabela de alta densidade exibe o nome original, os metadados extraídos pela IA (com indicador de status), o novo nome proposto (editável com um clique) e um botão para pré-visualizar o PDF ao lado.
4. **Download Individual**: Cada linha possui seu botão de download imediato com o novo nome sanitizado, além de uma ação no topo da tabela para baixar todos os arquivos aprovados individualmente em sequência.

### Identidade Visual & Tema (SaaS Utilitário de Alta Precisão)
- **Direção Estética**: *Precision Editorial Utility* — superfícies claras, bordas sutis de `1px`, contraste nítido e foco absoluto na legibilidade da tabela de comparação de nomes.
- **Paleta de Cores (Regra 60-30-10)**:
  - **60% Canvas Dominante**: Branco puro (`#FFFFFF`) e cinza-gelo estrutural (`#F8FAFC`) para áreas de trabalho.
  - **30% Superfícies & Estrutura**: Cinza ardósia profundo (`#0F172A`) para tipografia primária, `#475569` para metadados e bordas sutis em `#E2E8F0`.
  - **10% Acento & Semântica**: Índigo executivo (`#2563EB`) para ações primárias; Verde Esmeralda (`#16A34A`) para novos nomes validados/extraídos; Âmbar (`#D97706`) para alertas de colisão de nomes duplicados; Carmesim (`#DC2626`) para erros de leitura.
- **Tipografia & Hierarquia (Regra 2+1 Fontes)**:
  - *Display & Cabeçalhos*: `Plus Jakarta Sans` (SemiBold/Bold, tracking ajustado).
  - *Corpo & Controles*: `Public Sans` para leitura limpa em controles densos.
  - *Nomes de Arquivos, Regex & Métricas*: `JetBrains Mono` com numerais tabulares (`tabular-nums`) para alinhar extensões `.pdf`, tamanhos de arquivo e destacar diferenças entre o nome antigo e o novo.
- **Estrutura de Layout**:
  - **Barra Superior (Top Bar Contract)**: Marca à esquerda (`DocFlow`), navegação enxuta no centro (Bancada, Regras Salvas, Histórico da Sessão, Guia Regex) e botão de ação primária à direita (`Adicionar PDFs`).
  - **Área de Trabalho Dividida**: Painel de configuração de regras à esquerda (340px), grade de comparação de alta densidade no centro/direita e gaveta de inspeção rápida do documento PDF quando selecionado.

---

## 3. Decisões de Produto & Trade-Offs

- **Decisão 1: Envio Multimodal Direto do PDF para o Gemini no Servidor**
  - *Abordagem Escolhida*: Converter o PDF em Base64 no cliente e enviá-lo para uma rota de servidor que utiliza o modelo `gemini-3.8-flash` com suporte nativo a documentos (`application/pdf`) e schema JSON estruturado (`responseSchema`).
  - *Por quê*: Garante que tanto PDFs digitais quanto PDFs escaneados (imagens dentro de PDF) sejam compreendidos com precisão, sem falhar em documentos sem camada de texto, mantendo a chave de API protegida no servidor.
- **Decisão 2: Download Individual com Prevenção Automática de Colisões**
  - *Abordagem Escolhida*: Disponibilizar download individual por linha via `Blob` URL nativo do navegador com o atributo `download="novo_nome.pdf"`, além de um disparador sequencial inteligente com pequeno intervalo para baixar múltiplos arquivos individualmente sem bloqueio do navegador. Se dois PDFs gerarem o mesmo nome, o sistema anexa automaticamente um sufixo numérico (`_1`, `_2`) e avisa visualmente.
  - *Por quê*: Atende diretamente à preferência de baixar arquivos individualmente e evita que arquivos com nomes idênticos se sobrescrevam na pasta de Downloads do usuário.

---

## 4. Arquitetura Técnica & Estratégia de Dados

### Diagrama de Arquitetura e Componentes

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Top Bar (Navegação & Ação Global)                    │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
       ┌───────────────────────────────┼───────────────────────────────┐
       ▼                               ▼                               ▼
┌──────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
│  Painel de Regras    │   │ Grade de Lote (De/Para)│  │ Inspetor de Documento │
│  • Modo IA (Prompt & │   │ • Upload Drag & Drop  │   │ • Visualizador nativo │
│    Tags Semânticas)  │──▶│ • Comparação Monospace│──▶│   do PDF selecionado  │
│  • Modo Regex & Subst│   │ • Edição Inline Nome  │   │ • Metadados extraídos │
│  • Presets Rápidos   │   │ • Download Individual │   │   pela IA             │
└──────────┬───────────┘   └───────────┬───────────┘   └───────────────────────┘
           │                           │
           │ (Solicita Extração IA)    │ (Gera PDF Exemplo / Download Blob)
           ▼                           ▼
┌──────────────────────────────────────────────────┐
│     Rota de Servidor (/api/extract-pdf-name)     │
│  • SDK @google/genai (gemini-3.8-flash)          │
│  • Entrada multimodal (application/pdf inline)   │
│  • Saída JSON estruturada (nome + campos lidos)  │
└──────────────────────────────────────────────────┘
```

### Modelo de Dados & Estado
- **Item de Arquivo PDF (`PdfBatchItem`)**:
  - Identificador único, objeto `File` original, tamanho em bytes, data de modificação e URL de pré-visualização local (`URL.createObjectURL`).
  - `originalName`: Nome original do arquivo (sem e com extensão `.pdf`).
  - `extractedData`: Campos extraídos pela IA (ex.: `dataDocumento`, `entidade`, `tipoDocumento`, `identificador`, `resumoCurto`, `sugestaoNome`).
  - `proposedName`: Nome calculado pelas regras ativas (IA ou Regex/Substituição).
  - `customName`: Sobrescrita manual caso o usuário edite diretamente a célula da tabela.
  - `status`: `'idle' | 'analyzing' | 'ready' | 'error' | 'downloaded'`.

### Mapeamento de Interações
- **Regras de Regex & Substituição em Tempo Real**: Qualquer alteração nos campos de Localizar, Substituir, Prefixo, Sufixo ou Padronização de Caixa recalcula instantaneamente a coluna "Novo Nome" para todos os arquivos da tabela, destacando em tempo real os trechos alterados.
- **Processamento em Lote via IA**: Ao clicar em "Analisar Lote com IA", os arquivos pendentes são processados com feedback de progresso individual por linha, preenchendo os metadados extraídos e aplicando o template de nome escolhido.
- **Gerador de PDFs de Demonstração Integrado**: Para permitir teste imediato mesmo sem arquivos locais em mãos, um botão "Carregar Lote de Exemplo" gera no próprio navegador 4 arquivos PDF reais (uma Nota Fiscal, um Contrato de Prestação de Serviços, um Comprovante Bancário e um Relatório Técnico) com nomes genéricos (`scan_0042.pdf`, `doc_final_v2.pdf`, etc.) prontos para serem lidos pela IA, pré-visualizados e baixados.
