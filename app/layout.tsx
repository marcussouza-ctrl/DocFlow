import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DocFlow — Renomeador de PDFs em Lote',
  description:
    'Bancada utilitária para renomear arquivos PDF em lote usando extração inteligente de conteúdo via IA e regras de substituição ou Expressões Regulares (Regex).',
  openGraph: {
    title: 'DocFlow — Renomeador de PDFs em Lote',
    description:
      'Bancada utilitária para renomear arquivos PDF em lote usando extração inteligente de conteúdo via IA e regras de substituição ou Expressões Regulares (Regex).',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocFlow — Renomeador de PDFs em Lote',
    description:
      'Bancada utilitária para renomear arquivos PDF em lote usando extração inteligente de conteúdo via IA e regras de substituição ou Expressões Regulares (Regex).',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body
        suppressHydrationWarning
        className="bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-blue-600 selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}

