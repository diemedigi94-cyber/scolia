'use client';

import React, { useState } from 'react';
import { runMoneyTests } from '@/lib/__tests__/money.test';
import { CheckCircle2, XCircle, Play, ShieldAlert } from 'lucide-react';

export default function TestsRunnerPage() {
  const [results, setResults] = useState<{ total: number; passed: number; failures: string[] } | null>(null);

  const handleRunTests = () => {
    const res = runMoneyTests();
    setResults(res);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Vérification des Calculs Financiers
          </h1>
          <p className="text-xs text-slate-500">
            Tests automatisés : soldes, paiements partiels, annulations, devises USD/CDF.
          </p>
        </div>
      </div>

      <button
        onClick={handleRunTests}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
      >
        <Play className="w-4 h-4 fill-current" />
        Exécuter la suite de tests unitaires
      </button>

      {results && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="text-sm font-bold text-slate-800">Résultat d'exécution</div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-emerald-600 font-bold">{results.passed} réussis</span>
              <span>/</span>
              <span className="text-slate-600">{results.total} tests</span>
            </div>
          </div>

          {results.failures.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-1">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm text-emerald-800">
                100% des tests financiers sont validés !
              </div>
              <div className="text-xs text-emerald-600">
                Aucun décalage de centimes en USD, unités CDF exactes, annulations strictement déduites.
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
              <div className="font-bold text-xs text-red-700 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                {results.failures.length} anomalie(s) détectée(s) :
              </div>
              <ul className="text-xs text-red-600 list-disc list-inside">
                {results.failures.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2 text-xs text-slate-600">
            <div className="font-bold text-slate-800">Scénarios couverts :</div>
            <div className="grid grid-cols-1 gap-1.5 text-[11px]">
              <div className="p-2 bg-slate-50 rounded-lg">✅ Stockage d'argent en entiers (cents pour USD, unités pour CDF)</div>
              <div className="p-2 bg-slate-50 rounded-lg">✅ Paiement partiel et calcul dynamique du solde restant</div>
              <div className="p-2 bg-slate-50 rounded-lg">✅ Déduction stricte et immédiate des paiements annulés avec motif</div>
              <div className="p-2 bg-slate-50 rounded-lg">✅ Calcul des retards selon la date d'échéance des tranches</div>
              <div className="p-2 bg-slate-50 rounded-lg">✅ Séparation absolue des totaux USD et CDF</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
