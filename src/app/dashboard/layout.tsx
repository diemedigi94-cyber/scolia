'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  RefreshCw,
  School as SchoolIcon,
  UserCheck,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentSchool, currentRole, currentUser, loginAs, resetDemoData } = useApp();

  const toggleRole = () => {
    loginAs(currentRole === 'director' ? 'cashier' : 'director');
  };

  const navItems = [
    {
      label: 'Bord',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['director'],
    },
    {
      label: 'Encaisser',
      href: '/dashboard/caisse',
      icon: CreditCard,
      roles: ['director', 'cashier'],
      highlight: true,
    },
    {
      label: 'Soldes',
      href: '/dashboard/soldes',
      icon: AlertTriangle,
      roles: ['director', 'cashier'],
    },
    {
      label: 'Élèves',
      href: '/dashboard/eleves',
      icon: Users,
      roles: ['director', 'cashier'],
    },
    {
      label: 'Reçus',
      href: '/dashboard/recus',
      icon: Receipt,
      roles: ['director', 'cashier'],
    },
    {
      label: 'Audit',
      href: '/dashboard/audit',
      icon: ShieldCheck,
      roles: ['director'],
    },
  ];

  const allowedNav = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between max-w-lg mx-auto shadow-2xl relative border-x border-slate-200">
      {/* En-tête supérieur */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 px-4 py-3 shadow-md">
        <div className="flex items-center justify-between gap-2">
          {/* Nom de l'école */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
              <SchoolIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{currentSchool.name}</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {currentSchool.city} • Monnaie : {currentSchool.currencyDefault}
            </div>
          </div>

          {/* Sélecteur rapide de rôle (Directeur / Caissier) pour tester facilement */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleRole}
              title="Cliquez pour changer de rôle de test"
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                currentRole === 'director'
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>{currentRole === 'director' ? 'Directeur' : 'Caissière'}</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Voulez-vous réinitialiser les données de démo ?')) {
                  resetDemoData();
                  window.location.reload();
                }
              }}
              title="Réinitialiser les données de démo"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal de la page */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {children}
      </main>

      {/* Barre de navigation mobile inférieure (Gros boutons tactiles) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around z-40 shadow-lg">
        {allowedNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-700/40 hover:bg-emerald-500 active:scale-95 transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
