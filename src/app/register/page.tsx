'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/app-context';
import { Currency } from '@/types';
import { ArrowLeft, School, MapPin, Phone, CheckCircle2 } from 'lucide-react';

export default function RegisterSchoolPage() {
  const router = useRouter();
  const { createSchool } = useApp();

  const [name, setName] = useState('');
  const [city, setCity] = useState('Kinshasa');
  const [phone, setPhone] = useState('+243');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Veuillez entrer le nom de l’école.');
      return;
    }

    createSchool({
      name: name.trim(),
      city: city.trim() || 'Kinshasa',
      phone: phone.trim(),
      currencyDefault: currency,
    });

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-6 max-w-lg mx-auto">
      {/* Bouton retour */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l’accueil
      </Link>

      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-black text-white">Inscrire mon école</h1>
        <p className="text-slate-400 text-sm">
          Créez votre école pilote en 1 minute. Vous aurez immédiatement accès au tableau de bord directeur.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Nom de l'école */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <School className="w-4 h-4 text-blue-400" />
            Nom de l’école *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Complexe Scolaire Mgr Bokeleale"
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3.5 text-white text-base outline-none transition-colors"
          />
        </div>

        {/* Ville / Commune */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Ville ou Commune
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex : Kinshasa (Gombe, Limete, Lemba...)"
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3.5 text-white text-base outline-none transition-colors"
          />
        </div>

        {/* Numéro WhatsApp */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-green-400" />
            Numéro WhatsApp du Directeur
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+243..."
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3.5 text-white text-base outline-none transition-colors font-mono"
          />
        </div>

        {/* Choix de la devise avec gros boutons */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Devise principale de facturation
          </label>
          <p className="text-xs text-slate-400">
            Choisissez la monnaie principale. Vous pourrez aussi enregistrer des paiements dans l’autre monnaie.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`p-4 rounded-xl border text-center font-bold text-sm flex flex-col items-center gap-1 transition-all ${
                currency === 'USD'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/50'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-2xl">💵</span>
              <span>Dollar (USD)</span>
              {currency === 'USD' && <CheckCircle2 className="w-4 h-4 text-white mt-1" />}
            </button>

            <button
              type="button"
              onClick={() => setCurrency('CDF')}
              className={`p-4 rounded-xl border text-center font-bold text-sm flex flex-col items-center gap-1 transition-all ${
                currency === 'CDF'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/50'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-2xl">🏦</span>
              <span>Franc (CDF)</span>
              {currency === 'CDF' && <CheckCircle2 className="w-4 h-4 text-white mt-1" />}
            </button>
          </div>
        </div>

        {/* Bouton de validation */}
        <button
          type="submit"
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white py-4 rounded-xl font-bold text-base shadow-xl transition-all"
        >
          Valider et ouvrir l’école ✨
        </button>
      </form>
    </div>
  );
}
