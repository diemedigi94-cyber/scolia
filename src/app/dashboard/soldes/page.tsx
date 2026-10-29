'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { calculateStudentBalances, formatMoney } from '@/lib/money';
import { Currency } from '@/types';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Share2,
  Filter,
  MessageCircle,
  ArrowUpDown,
} from 'lucide-react';

export default function BalancesAndRemindersPage() {
  const { students, classes, feeItems, payments, currentSchool } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'EN_RETARD' | 'PARTIEL' | 'SOLDE'>('EN_RETARD');
  const [activeCurrency, setActiveCurrency] = useState<Currency>(currentSchool.currencyDefault);

  // Calculer la situation financière de chaque élève
  const studentBalances = students.map((st) => {
    const cls = classes.find((c) => c.id === st.classId);
    const classFees = feeItems.filter((f) => f.classId === st.classId);
    return calculateStudentBalances(st, cls?.name || 'Classe', classFees, payments);
  });

  // Filtrer selon la classe et le statut sélectionné
  const filteredList = studentBalances.filter((item) => {
    if (selectedClassId !== 'ALL' && item.student.classId !== selectedClassId) return false;
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    return true;
  });

  // Génération du lien wa.me prérempli
  const createWhatsAppReminderLink = (item: typeof studentBalances[0]) => {
    const phone = item.student.parentPhone.replace(/[^0-9]/g, '');
    const remainingText =
      item.balanceUSD > 0 && item.balanceCDF > 0
        ? `${formatMoney(item.balanceUSD, 'USD')} et ${formatMoney(item.balanceCDF, 'CDF')}`
        : item.balanceUSD > 0
        ? formatMoney(item.balanceUSD, 'USD')
        : formatMoney(item.balanceCDF, 'CDF');

    const message = encodeURIComponent(
      `Bonjour ${item.student.parentName},\n\n` +
      `La direction de *${currentSchool.name}* vous contacte au sujet des frais scolaires de votre enfant *${item.student.firstName} ${item.student.lastName}* (${item.className}).\n\n` +
      `Sauf erreur de notre part, le solde restant à régler s'élève à : *${remainingText}*.\n\n` +
      `Nous vous prions de bien vouloir passer à la caisse de l'école ou effectuer le versement afin de régulariser sa situation.\n\n` +
      `Merci pour votre bonne collaboration.\n*La Direction*`
    );

    return `https://wa.me/${phone}?text=${message}`;
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-slate-900 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Soldes & Relances WhatsApp
          </h1>
          <p className="text-xs text-slate-500">
            Relancez les parents en retard en 1 clic sans surcoût.
          </p>
        </div>

        {/* Sélecteur de monnaie */}
        <button
          onClick={() => setActiveCurrency(activeCurrency === 'USD' ? 'CDF' : 'USD')}
          className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-700"
        >
          {activeCurrency === 'USD' ? '💵 Vue USD' : '🏦 Vue CDF'}
        </button>
      </div>

      {/* Filtres rapides de statut (Gros boutons) */}
      <div className="grid grid-cols-4 gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-center">
        {[
          { id: 'EN_RETARD', label: 'En retard', color: 'text-red-600' },
          { id: 'PARTIEL', label: 'Partiels', color: 'text-amber-600' },
          { id: 'SOLDE', label: 'Soldés', color: 'text-emerald-600' },
          { id: 'ALL', label: 'Tous', color: 'text-slate-700' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilterStatus(btn.id as any)}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
              filterStatus === btn.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Filtre par classe */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setSelectedClassId('ALL')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
            selectedClassId === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Toutes classes
        </button>
        {classes.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedClassId(c.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
              selectedClassId === c.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Liste des fiches élèves avec solde et bouton WhatsApp direct */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Aucun élève trouvé pour ce filtre.
          </div>
        ) : (
          filteredList.map((item) => {
            const hasOverdue = item.status === 'EN_RETARD';
            const isSettled = item.status === 'SOLDE';

            return (
              <div
                key={item.student.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-black text-sm text-slate-900">
                      {item.student.firstName} {item.student.lastName}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.className} • Parent : <span className="font-semibold text-slate-700">{item.student.parentName}</span>
                    </div>
                  </div>

                  {/* Badge de statut */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isSettled
                        ? 'bg-emerald-100 text-emerald-800'
                        : hasOverdue
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isSettled ? 'Soldé' : hasOverdue ? `En retard (+${item.daysOverdue}j)` : 'Partiel'}
                  </span>
                </div>

                {/* Détail financier */}
                <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Reste à payer :</div>
                    <div className="font-black text-sm text-red-600">
                      {item.balanceUSD > 0 && formatMoney(item.balanceUSD, 'USD')}
                      {item.balanceUSD > 0 && item.balanceCDF > 0 && ' + '}
                      {item.balanceCDF > 0 && formatMoney(item.balanceCDF, 'CDF')}
                      {item.balanceUSD === 0 && item.balanceCDF === 0 && '0 $ (En ordre)'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Total payé :</div>
                    <div className="font-bold text-slate-700">
                      {item.totalPaidUSD > 0 && formatMoney(item.totalPaidUSD, 'USD')}
                      {item.totalPaidCDF > 0 && ` ${formatMoney(item.totalPaidCDF, 'CDF')}`}
                      {item.totalPaidUSD === 0 && item.totalPaidCDF === 0 && '0'}
                    </div>
                  </div>
                </div>

                {/* Bouton de relance WhatsApp en 1 clic */}
                {!isSettled && (
                  <a
                    href={createWhatsAppReminderLink(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Envoyer un rappel WhatsApp</span>
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
