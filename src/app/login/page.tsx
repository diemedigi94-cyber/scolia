'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!isSupabaseConfigured || !supabase) {
      setError('La connexion réelle n’est pas encore configurée. Vous pouvez essayer la démo.');
      return;
    }

    setIsSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError('Connexion impossible. Vérifiez votre adresse e-mail et votre mot de passe.');
      setIsSubmitting(false);
      return;
    }

    router.replace('/espace');
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Retour à l’accueil
        </Link>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <KeyRound aria-hidden="true" className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Connexion à Scolia</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Connectez-vous avec l’adresse e-mail et le mot de passe de votre compte.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                {error}
              </p>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="email">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  autoComplete="email"
                  className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  id="email"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="password">
                Mot de passe
              </label>
              <input
                autoComplete="current-password"
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>

            <button
              className="min-h-12 w-full rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Pas encore de compte ?{' '}
            <Link className="font-bold text-blue-700 hover:text-blue-900" href="/register">
              Créer mon école
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-slate-600">
            Vous voulez essayer ?{' '}
            <Link className="font-bold text-blue-700 hover:text-blue-900" href="/dashboard">
              Ouvrir la démo
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
