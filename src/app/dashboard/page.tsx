'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/app-context';
import { calculateDashboardTotals, formatMoney } from '@/lib/money';
import { Currency } from '@/types';
import {
  TrendingUp,
  CreditCard,
  AlertCircle,
  Users,
  ArrowRight,
  ShieldAlert,
  Wallet,
  Smartphone,
  Building,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentRole, feeItems, students, payments, classes, currentSchool } = useApp();
  const [activeCurrency, setActiveCurrency] = useState<Currency>(currentSchool.currencyDefault);

  const totals = calculateDashboardTotals(feeItems, students, payments);

  const isUSD = activeCurrency === 'USD';
  const expected = isUSD ? totals.expectedUSD : totals.expectedCDF;
  const collected = isUSD ? totals.collectedUSD : totals.collectedCDF;
  const remaining = isUSD ? totals.remainingUSD : totals.remainingCDF;
  const rate = isUSD ? totals.rateUSD : totals.rateCDF;
  const methods = isUSD ? totals.paymentMethodsUSD : totals.paymentMethodsCDF;

  // Calcul des impayés par classe
  const classBreakdown = classes.map((c) => {
    const classStudents = students.filter((s) => s.classId === c.id);
    const classFees = feeItems.filter((f) => f.classId === c.id && f.currency === activeCurrency);
    const totalDue = classStudents.length * classFees.reduce((sum, f) => sum + f.amount, 0);

    const classPayments = payments.filter(
      (p) => !p.isCancelled && p.currency === activeCurrency && classStudents.some((s) => s.id === p.studentId)
    );
    const totalPaid = classPayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingClass = Math.max(0, totalDue - totalPaid);

    return {
      class: c,
      studentCount: classStudents.length,
      totalDue,
      totalPaid,
      remaining: remainingClass,
    };
  });

  return (
    <div className="space-y-5">
      {/* Sélecteur de Devise USD / CDF (Gros boutons en un clic) */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
          Vue monnaie :
        </span>
        <div className="flex gap-1.5 flex-1 max-w-[240px]">
          <button
            onClick={() => setActiveCurrency('USD')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeCurrency === 'USD'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>💵</span>
            <span>Dollars (USD)</span>
          </button>
          <button
            onClick={() => setActiveCurrency('CDF')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeCurrency === 'CDF'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>🏦</span>
            <span>Francs (CDF)</span>
          </button>
        </div>
      </div>

      {/* Reste à recouvrer - Carte d'urgence principale */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Reste à recouvrer ({activeCurrency})
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Taux : {rate}%
          </span>
        </div>

        <div className="text-3xl font-black tracking-tight text-white">
          {formatMoney(remaining, activeCurrency)}
        </div>

        {/* Barre de progression visuelle */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-700/60 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${rate}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Encaissé : {formatMoney(collected, activeCurrency)}</span>
            <span>Attendu : {formatMoney(expected, activeCurrency)}</span>
          </div>
        </div>
      </div>

      {/* Action rapide Caissier / Relances */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/dashboard/caisse"
          className="bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white p-4 rounded-2xl shadow-md flex flex-col justify-between transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-700/60 flex items-center justify-center mb-2">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold">Encaisser</div>
            <div className="text-[11px] text-emerald-100">&lt; 30 secondes</div>
          </div>
        </Link>

        <Link
          href="/dashboard/soldes"
          className="bg-amber-600 hover:bg-amber-500 active:scale-[0.98] text-white p-4 rounded-2xl shadow-md flex flex-col justify-between transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-700/60 flex items-center justify-center mb-2">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold">Relancer retards</div>
            <div className="text-[11px] text-amber-100">WhatsApp 1 clic</div>
          </div>
        </Link>
      </div>

      {/* Répartition par mode de paiement */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Encaissements par mode ({activeCurrency})
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <Wallet className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <div className="text-[10px] text-slate-500 font-medium">Espèces</div>
            <div className="text-xs font-black text-slate-800 mt-0.5">
              {formatMoney(methods.CASH || 0, activeCurrency)}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <Smartphone className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <div className="text-[10px] text-slate-500 font-medium">Mobile Money</div>
            <div className="text-xs font-black text-slate-800 mt-0.5">
              {formatMoney(methods.MOBILE_MONEY || 0, activeCurrency)}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <Building className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
            <div className="text-[10px] text-slate-500 font-medium">Virement</div>
            <div className="text-xs font-black text-slate-800 mt-0.5">
              {formatMoney(methods.BANK_TRANSFER || 0, activeCurrency)}
            </div>
          </div>
        </div>
      </div>

      {/* Impayés par classe */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-700" />
            Situation par classe ({activeCurrency})
          </div>
          <Link href="/dashboard/soldes" className="text-xs font-bold text-blue-600 flex items-center gap-0.5">
            Détails <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {classBreakdown.map((item) => (
            <div key={item.class.id} className="py-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">{item.class.name}</div>
                <div className="text-[11px] text-slate-400">{item.studentCount} élèves</div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-black ${item.remaining > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {item.remaining > 0 ? `Reste : ${formatMoney(item.remaining, activeCurrency)}` : 'Soldé 🎉'}
                </div>
                <div className="text-[10px] text-slate-400">
                  Payé : {formatMoney(item.totalPaid, activeCurrency)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
