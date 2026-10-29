'use client';

import React from 'react';
import { useApp } from '@/lib/app-context';
import { ShieldCheck, Clock, User, FileText, CheckCircle2 } from 'lucide-react';

export default function AuditLogPage() {
  const { auditLogs, currentRole } = useApp();

  if (currentRole !== 'director') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          🔒
        </div>
        <h2 className="text-base font-bold text-slate-800">Accès restreint</h2>
        <p className="text-xs text-slate-500">
          Seul le Directeur de l'école est autorisé à consulter le journal d'audit de sécurité.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Journal d’Audit & Sécurité
          </h1>
          <p className="text-xs text-slate-500">
            Traçabilité complète des actions : qui a fait quoi et quand.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {auditLogs.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Aucun événement enregistré pour le moment.
          </div>
        ) : (
          auditLogs.map((log) => {
            const date = new Date(log.createdAt);
            const formattedDate = date.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Africa/Kinshasa',
            });

            return (
              <div key={log.id} className="p-3.5 space-y-1.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {log.action}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formattedDate} (Kinshasa)
                  </span>
                </div>

                <div className="text-xs text-slate-800 font-medium leading-relaxed">
                  {log.details}
                </div>

                <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Auteur : </span>
                  <span className="font-bold text-slate-700">{log.userName}</span>
                  <span className="text-slate-400">({log.userRole === 'director' ? 'Directeur' : 'Caissière'})</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
