import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/app-context';

export const metadata: Metadata = {
  title: 'Scolia - Gestion des Frais Scolaires RDC',
  description: 'Suivi et recouvrement des frais scolaires pour les écoles privées en RDC',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased bg-slate-50 text-slate-900 pb-20 md:pb-0">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
