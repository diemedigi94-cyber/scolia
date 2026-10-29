import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/app-context';

export const metadata: Metadata = {
  title: 'Scolia — Suivi des frais scolaires en RDC',
  description:
    'Suivez les frais, retrouvez les paiements et relancez les retards simplement avec Scolia.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased bg-slate-50 text-slate-900">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
