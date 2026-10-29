'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { School, ShieldCheck, Smartphone, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { currentSchool, loginAs } = useApp();

  const handleEnterAs = (role: 'director' | 'cashier') => {
    loginAs(role);
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white flex flex-col justify-between px-4 py-8 max-w-lg mx-auto">
      {/* En-tête */}
      <div className="space-y-6 pt-4 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-4 py-1.5 rounded-full text-blue-300 text-xs font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Étape 1 : Version MVP Écoles Pilotes RDC
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Scolia
            </span>
          </h1>
          <p className="text-slate-300 text-base leading-relaxed px-2">
            La solution simple pour le suivi et le recouvrement des frais scolaires dans les écoles privées de RDC.
          </p>
        </div>

        {/* 3 piliers simples */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-left">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <Smartphone className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white">100% Mobile</div>
            <div className="text-[10px] text-slate-400">Paiement en &lt; 30s</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white">USD & CDF</div>
            <div className="text-[10px] text-slate-400">Sans calculatrice</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <ShieldCheck className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white">Reçus WhatsApp</div>
            <div className="text-[10px] text-slate-400">Traçabilité totale</div>
          </div>
        </div>
      </div>

      {/* Bloc principal d'actions rapides */}
      <div className="space-y-4 my-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-blue-300">École active</div>
              <div className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                <School className="w-4 h-4 text-blue-400" />
                {currentSchool.name}
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-blue-500/30 text-blue-200 border border-blue-400/40 rounded-lg font-mono">
              {currentSchool.currencyDefault}
            </span>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => handleEnterAs('cashier')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white py-4 px-4 rounded-xl font-bold text-base flex items-center justify-between shadow-lg shadow-emerald-900/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-700/60 flex items-center justify-center">
                  💰
                </div>
                <div className="text-left">
                  <div className="leading-tight">Entrer comme Caissière</div>
                  <div className="text-xs font-normal text-emerald-100">Enregistrer paiements & reçus</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-200" />
            </button>

            <button
              onClick={() => handleEnterAs('director')}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white py-4 px-4 rounded-xl font-bold text-base flex items-center justify-between shadow-lg shadow-blue-900/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-700/60 flex items-center justify-center">
                  👔
                </div>
                <div className="text-left">
                  <div className="leading-tight">Entrer comme Directeur</div>
                  <div className="text-xs font-normal text-blue-100">Tableau de bord, relances, audit</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-200" />
            </button>
          </div>
        </div>

        {/* Bouton pour créer une nouvelle école */}
        <Link
          href="/register"
          className="w-full block text-center bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all"
        >
          ➕ Inscrire une nouvelle école pilote
        </Link>
      </div>

      {/* Pied de page */}
      <footer className="text-center space-y-1 text-slate-500 text-xs">
        <div>Scolia RDC • Conçu pour Kinshasa & les provinces</div>
        <div>Fuseau Africa/Kinshasa • Zéro suppression de paiement</div>
      </footer>
    </main>
  );
}
