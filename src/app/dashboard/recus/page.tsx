'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { Payment } from '@/types';
import { formatMoney } from '@/lib/money';
import {
  Receipt,
  Share2,
  Printer,
  XCircle,
  AlertOctagon,
  Search,
  CheckCircle,
  Calendar,
  Eye,
} from 'lucide-react';

export default function ReceiptsPage() {
  const { payments, currentSchool, cancelPayment, currentRole } = useApp();

  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const filteredPayments = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.receiptNumber.toLowerCase().includes(q) ||
      (p.studentName && p.studentName.toLowerCase().includes(q)) ||
      (p.reference && p.reference.toLowerCase().includes(q))
    );
  });

  const handleOpenCancelModal = (p: Payment) => {
    setSelectedPayment(p);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedPayment) return;
    if (!cancelReason.trim()) {
      alert('Veuillez indiquer le motif obligatoire de l’annulation.');
      return;
    }
    cancelPayment(selectedPayment.id, cancelReason.trim());
    setCancelModalOpen(false);
    setSelectedPayment(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-slate-900 flex items-center gap-1.5">
            <Receipt className="w-5 h-5 text-blue-600" />
            Reçus & Traçabilité
          </h1>
          <p className="text-xs text-slate-500">
            Tous les reçus émis sont archivés sans suppression possible.
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Rechercher par n° de reçu ou élève..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-blue-500 shadow-sm"
        />
      </div>

      {/* Liste des reçus */}
      <div className="space-y-2.5">
        {filteredPayments.map((p) => (
          <div
            key={p.id}
            className={`p-3.5 rounded-2xl border shadow-sm transition-all ${
              p.isCancelled
                ? 'bg-red-50/50 border-red-200 opacity-80'
                : 'bg-white border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs text-slate-900">
                    {p.receiptNumber}
                  </span>
                  {p.isCancelled ? (
                    <span className="bg-red-100 text-red-700 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Annulé
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Encaissé
                    </span>
                  )}
                </div>

                <div className="font-bold text-sm text-slate-800 mt-1">
                  {p.studentName}
                </div>
                <div className="text-[11px] text-slate-500">
                  {p.feeItemName || 'Frais'} • Saisi par {p.createdByName}
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`font-black text-sm ${
                    p.isCancelled ? 'line-through text-slate-400' : 'text-emerald-700'
                  }`}
                >
                  {formatMoney(p.amount, p.currency)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-end gap-1">
                  <Calendar className="w-3 h-3" />
                  {p.paymentDate}
                </div>
              </div>
            </div>

            {/* Motif si annulé */}
            {p.isCancelled && p.cancelReason && (
              <div className="mt-2 text-[11px] text-red-700 bg-red-100/60 p-2 rounded-lg border border-red-200">
                <span className="font-bold">Motif d'annulation : </span>
                {p.cancelReason}
              </div>
            )}

            {/* Actions sur le reçu */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedPayment(p)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                Voir reçu
              </button>

              {!p.isCancelled && currentRole === 'director' && (
                <button
                  onClick={() => handleOpenCancelModal(p)}
                  className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Annuler paiement
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DU REÇU OFFICIEL (Format compact vertical adapté mobile & impression) */}
      {selectedPayment && !cancelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Corps du reçu stylé ticket / format mobile compact */}
            <div id="receipt-print-area" className="p-5 overflow-y-auto space-y-4 text-slate-900 font-sans">
              {/* En-tête école */}
              <div className="text-center border-b-2 border-dashed border-slate-300 pb-3">
                <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                  RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
                </div>
                <h3 className="text-base font-black tracking-tight text-slate-900 mt-0.5">
                  {currentSchool.name.toUpperCase()}
                </h3>
                <div className="text-[11px] text-slate-500">
                  {currentSchool.city} • Tél : {currentSchool.phone || '+243...'}
                </div>
                <div className="inline-block mt-2 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                  REÇU OFFICIEL DE PAIEMENT
                </div>
              </div>

              {/* Détails du paiement */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">N° Reçu :</span>
                  <span className="font-mono font-black">{selectedPayment.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date d'encaissement :</span>
                  <span className="font-semibold">{selectedPayment.paymentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Élève :</span>
                  <span className="font-bold">{selectedPayment.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Classe :</span>
                  <span>{selectedPayment.className || 'Non spécifiée'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Motif du versement :</span>
                  <span className="font-medium">{selectedPayment.feeItemName || 'Frais de scolarité'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode de règlement :</span>
                  <span className="font-medium">{selectedPayment.paymentMethod}</span>
                </div>
                {selectedPayment.reference && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Référence :</span>
                    <span className="font-mono">{selectedPayment.reference}</span>
                  </div>
                )}
              </div>

              {/* Montant encaissé bien mis en valeur */}
              <div className="bg-slate-100 p-3.5 rounded-2xl text-center border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-500">Montant net versé</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {formatMoney(selectedPayment.amount, selectedPayment.currency)}
                </div>
              </div>

              {/* Statut annulation si applicable */}
              {selectedPayment.isCancelled && (
                <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-xl text-xs font-bold text-center">
                  ⚠️ PAIEMENT ANNULÉ - REÇU SANS VALEUR<br />
                  <span className="font-normal text-[11px]">Motif : {selectedPayment.cancelReason}</span>
                </div>
              )}

              {/* Bas de ticket */}
              <div className="border-t border-dashed border-slate-300 pt-3 text-[10px] text-center text-slate-400 space-y-1">
                <div>Encaissé par : {selectedPayment.createdByName}</div>
                <div>Logiciel certifié Scolia RDC • Sécurité & Traçabilité</div>
              </div>
            </div>

            {/* Boutons d'actions modal */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer
              </button>
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2.5 rounded-xl font-semibold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL D'ANNULATION AVEC MOTIF OBLIGATOIRE */}
      {cancelModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertOctagon className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-black text-base text-slate-900">Annuler ce paiement</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Conformément aux règles financières de Scolia, aucun paiement n'est supprimé. Il sera marqué comme annulé et déduit du solde.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>Reçu : <span className="font-mono font-bold">{selectedPayment.receiptNumber}</span></div>
              <div>Élève : <span className="font-bold">{selectedPayment.studentName}</span></div>
              <div>Montant : <span className="font-bold text-red-600">{formatMoney(selectedPayment.amount, selectedPayment.currency)}</span></div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                Motif obligatoire de l'annulation *
              </label>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex : Erreur de montant saisi par la caisse, ou chèque rejeté..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:border-red-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmCancel}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
              >
                Confirmer l'annulation
              </button>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2.5 rounded-xl text-xs"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
