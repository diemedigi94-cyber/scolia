'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, School } from 'lucide-react';
import { Currency } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function RegisterSchoolPage() {
  const router = useRouter();
  const [directorName, setDirectorName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [city, setCity] = useState('Kinshasa');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!isSupabaseConfigured || !supabase) {
      setError('La création de compte nécessite la configuration de Supabase. La démo reste disponible.');
      return;
    }

    setIsSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: directorName.trim(),
          school_name: schoolName.trim(),
          city: city.trim() || 'Kinshasa',
          school_phone: schoolPhone.trim(),
          currency_default: currency,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      router.replace('/espace');
      return;
    }

    setNotice(
      'Votre compte et votre école sont créés. Vérifiez votre boîte e-mail pour confirmer l’adresse, puis connectez-vous.',
    );
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Retour à l’accueil
        </Link>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <School aria-hidden="true" className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Créer le compte de mon école</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Le compte créé sera celui du directeur. Un profil et un espace séparé sont créés pour
            cette école.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900" role="status">
                {notice}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold" htmlFor="director-name">
                  Nom du directeur
                </label>
                <input
                  autoComplete="name"
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  id="director-name"
                  onChange={(event) => setDirectorName(event.target.value)}
                  required
                  value={directorName}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold" htmlFor="school-name">
                  Nom de l’école
                </label>
                <input
                  autoComplete="organization"
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  id="school-name"
                  onChange={(event) => setSchoolName(event.target.value)}
                  required
                  value={schoolName}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold" htmlFor="city">
                  Ville
                </label>
                <input
                  autoComplete="address-level2"
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  id="city"
                  onChange={(event) => setCity(event.target.value)}
                  required
                  value={city}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold" htmlFor="school-phone">
                  Téléphone de l’école <span className="font-normal text-slate-500">(facultatif)</span>
                </label>
                <input
                  autoComplete="tel"
                  className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  id="school-phone"
                  onChange={(event) => setSchoolPhone(event.target.value)}
                  type="tel"
                  value={schoolPhone}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="currency">
                Devise principale
              </label>
              <select
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                id="currency"
                onChange={(event) => setCurrency(event.target.value === 'CDF' ? 'CDF' : 'USD')}
                value={currency}
              >
                <option value="USD">Dollar américain (USD)</option>
                <option value="CDF">Franc congolais (CDF)</option>
              </select>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h2 className="font-bold">Accès du directeur</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold" htmlFor="email">
                    Adresse e-mail
                  </label>
                  <input
                    autoComplete="email"
                    className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    id="email"
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    value={email}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold" htmlFor="password">
                    Mot de passe <span className="font-normal text-slate-500">(8 caractères minimum)</span>
                  </label>
                  <input
                    autoComplete="new-password"
                    className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    id="password"
                    minLength={8}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </div>
              </div>
            </div>

            <button
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
              {isSubmitting ? 'Création du compte…' : 'Créer le compte et l’école'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Vous avez déjà un compte ?{' '}
            <Link className="font-bold text-blue-700 hover:text-blue-900" href="/login">
              Se connecter
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
