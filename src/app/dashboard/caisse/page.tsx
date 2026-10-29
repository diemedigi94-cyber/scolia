'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { Currency, PaymentMethod, Payment } from '@/types';
import { parseInputToAmount, formatMoney } from '@/lib/money';
import {
  CreditCard,
  CheckCircle,
  Search,
  User,
  Share2,
  Receipt,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

export default function CashierPaymentPage() {
  const router = useRouter();
  const { students, classes, feeItems, recordPayment, currentSchool, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedFeeId, setSelectedFeeId] = useState('');
  const [currency, setCurrency] = useState<Currency>(currentSchool.currencyDefault);
  const [amountStr, setAmountStr] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [reference, setReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const [createdPayment, setCreatedPayment] = useState<Payment | null>(null);
  const [error, setError] = useState('');

  // Filtrer les élèves par recherche (nom ou matricule)
  const filteredStudents = search.trim()
    ? students.filter(
        (s) =>
          s.firstName.toLowerCase().includes(search.toLowerCase()) ||
          s.lastName.toLowerCase().includes(search.toLowerCase()) ||
          (s.matricule && s.matricule.toLowerCase().includes(search.toLowerCase()))
      )
    : students.slice(0, 10);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Frais disponibles pour la classe de l'élève
  const availableFees = selectedStudent
    ? feeItems.filter((f) => f.classId === selectedStudent.classId)
    : [];

  const handleSelectFee = (feeId: string) => {
    setSelectedFeeId(feeId);
    const fee = feeItems.find((f) => f.id === feeId);
    if (fee) {
      setCurrency(fee.currency);
      // Préremplir avec le montant prévu
      if (fee.currency === 'USD') {
        setAmountStr((fee.amount / 100).toString());
      } else {
        setAmountStr(fee.amount.toString());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedStudentId) {
      setError('Veuillez sélectionner un élève.');
      return;
    }

    const amount = parseInputToAmount(amountStr, currency);
    if (amount <= 0) {
      setError('Veuillez entrer un montant valide supérieur à 0.');
      return;
    }

    const payment = recordPayment({
      studentId: selectedStudentId,
      feeItemId: selectedFeeId || undefined,
      amount,
      currency,
      paymentMethod,
      reference: reference.trim() || undefined,
      paymentDate,
    });

    setCreatedPayment(payment);
  };

  const handleReset = () => {
    setCreatedPayment(null);
    setSelectedStudentId('');
    setSelectedFeeId('');
    setAmountStr('');
    setReference('');
    setSearch('');
  };

  // Génération du message WhatsApp pour le reçu
  const generateWhatsAppReceiptMessage = (pay: Payment) => {
    const parentPhone = selectedStudent?.parentPhone.replace(/[^0-9]/g, '') || '';
    const text = encodeURIComponent(
      `*REÇU DE PAIEMENT - ${currentSchool.name.toUpperCase()}*\n` +
      `Numéro de reçu : *${pay.receiptNumber}*\n` +
      `Date : ${pay.paymentDate}\n` +
      `Élève : ${pay.studentName} (${pay.className || 'Classe'})\n` +
      `Parent : ${selectedStudent?.parentName || 'Parent'}\n` +
      `Frais : ${pay.feeItemName || 'Frais de scolarité'}\n` +
      `Montant réglé : *${formatMoney(pay.amount, pay.currency)}*\n` +
      `Mode : ${pay.paymentMethod === 'CASH' ? 'Espèces à la caisse' : pay.paymentMethod}\n` +
      `Saisi par : ${currentUser?.fullName || 'La caisse'}\n\n` +
      `Merci pour votre confiance. Conservez ce reçu numérique Scolia.`
    );
    return `https://wa.me/${parentPhone}?text=${text}`;
  };

  return (
    <div className="space-y-4">
      {/* Si un paiement vient d'être enregistré : Écran de Confirmation & Reçu Immédiat */}
      {createdPayment ? (
        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-xl space-y-4 animate-in fade-in">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Paiement enregistré !</h2>
            <p className="text-xs text-slate-500">
              Reçu officiel n° <span className="font-bold text-slate-900">{createdPayment.receiptNumber}</span>
            </p>
          </div>

          {/* Fiche reçu compacte */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Élève :</span>
              <span className="font-bold text-slate-900">{createdPayment.studentName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Montant :</span>
              <span className="font-black text-emerald-700 text-sm">
                {formatMoney(createdPayment.amount, createdPayment.currency)}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Mode :</span>
              <span className="font-semibold text-slate-800">
                {createdPayment.paymentMethod === 'CASH' ? 'Espèces' : createdPayment.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Parent (WhatsApp) :</span>
              <span className="font-mono font-medium text-slate-800">{selectedStudent?.parentPhone}</span>
            </div>
          </div>

          {/* Boutons d'actions rapides */}
          <div className="space-y-2 pt-2">
            <a
              href={generateWhatsAppReceiptMessage(createdPayment)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/30 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Envoyer le reçu par WhatsApp
            </a>

            <button
              onClick={() => router.push('/dashboard/recus')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Receipt className="w-4 h-4" />
              Voir le reçu PDF officiel
            </button>

            <button
              onClick={handleReset}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Nouveau paiement (&lt; 30s)
            </button>
          </div>
        </div>
      ) : (
        /* Formulaire de saisie rapide pour la caissière */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Encaisser un paiement
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Caisse active
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Sélection de l'élève */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                1. Trouver l’élève *
              </label>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Tapez le nom ou prénom de l'élève..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Liste de sélection rapide */}
              <div className="max-h-36 overflow-y-auto space-y-1 rounded-xl border border-slate-100 p-1 bg-slate-50/50">
                {filteredStudents.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(st.id);
                      setSelectedFeeId('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                      selectedStudentId === st.id
                        ? 'bg-blue-600 text-white font-bold'
                        : 'hover:bg-slate-200/70 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{st.firstName} {st.lastName}</div>
                      <div className={`text-[10px] ${selectedStudentId === st.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        {st.className} • Parent: {st.parentName}
                      </div>
                    </div>
                    {selectedStudentId === st.id && <CheckCircle className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Choix du motif de paiement / Frais */}
            {selectedStudent && (
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  2. Frais concerné
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {availableFees.map((fee) => (
                    <button
                      key={fee.id}
                      type="button"
                      onClick={() => handleSelectFee(fee.id)}
                      className={`px-3 py-2 rounded-xl text-left border text-xs flex items-center justify-between transition-all ${
                        selectedFeeId === fee.id
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{fee.name}</span>
                      <span className="font-mono text-slate-600">
                        {formatMoney(fee.amount, fee.currency)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Choix de la Devise (Franc ou Dollar en 1 clic) */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                3. Devise reçue
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`py-3 px-3 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    currency === 'USD'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>💵</span>
                  <span>Dollar (USD)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('CDF')}
                  className={`py-3 px-3 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    currency === 'CDF'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>🏦</span>
                  <span>Franc (CDF)</span>
                </button>
              </div>
            </div>

            {/* 4. Montant payé */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                4. Montant versé ({currency}) *
              </label>
              <input
                type="number"
                step={currency === 'USD' ? '0.01' : '100'}
                placeholder={currency === 'USD' ? 'Ex: 50.00' : 'Ex: 125000'}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-emerald-500 rounded-xl px-4 py-3 text-lg font-black text-slate-900 outline-none"
              />
              <p className="text-[11px] text-slate-500">
                Les paiements partiels sont autorisés. Le solde sera automatiquement calculé.
              </p>
            </div>

            {/* 5. Mode de paiement */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                5. Mode de paiement
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'CASH', label: 'Espèces', icon: '💵' },
                  { id: 'MOBILE_MONEY', label: 'Mobile Money', icon: '📱' },
                  { id: 'BANK_TRANSFER', label: 'Virement', icon: '🏦' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                    className={`py-2 px-1 rounded-xl border text-center font-semibold text-[11px] transition-all ${
                      paymentMethod === item.id
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-sm">{item.icon}</div>
                    <div>{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Référence facultative (ex: ID transaction M-Pesa) */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-500">
                Référence ou N° transaction (facultatif)
              </label>
              <input
                type="text"
                placeholder="Ex: MP2609001, Bordereau n° 1245..."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Gros bouton d'encaissement immédiat */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-emerald-700/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Encaisser et Générer le reçu</span>
            <span>⚡</span>
          </button>
        </form>
      )}
    </div>
  );
}
