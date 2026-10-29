'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, School, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type MembershipView = {
  role: 'director' | 'cashier';
  schools: {
    name: string;
    city: string;
    currency_default: 'USD' | 'CDF';
  } | null;
};

export default function SchoolSpacePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [membership, setMembership] = useState<MembershipView | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    const loadSchool = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setMessage('La connexion à la base de données n’est pas configurée.');
        setStatus('error');
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.replace('/login');
        return;
      }

      const { data, error: membershipError } = await supabase
        .from('memberships')
        .select('role, schools(name, city, currency_default)')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: true })
        .limit(2);

      if (!active) return;

      if (membershipError) {
        setMessage('Impossible de charger votre école. Réessayez ou contactez votre administrateur.');
        setStatus('error');
        return;
      }

      if (!data?.length) {
        setMessage('Votre compte n’est associé à aucune école. Contactez le directeur de votre école.');
        setStatus('error');
        return;
      }

      if (data.length > 1) {
        setMessage('Votre compte appartient à plusieurs écoles. Le choix de l’école sera ajouté dans une prochaine étape.');
        setStatus('error');
        return;
      }

      setEmail(userData.user.email ?? '');
      setMembership(data[0] as MembershipView);
      setStatus('ready');
    };

    void loadSchool();
    return () => {
      active = false;
    };
  }, [router]);

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage('La déconnexion a échoué. Réessayez.');
      return;
    }
    router.replace('/');
  };

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-5 text-slate-600">
        Chargement de votre espace…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between">
          <Link className="text-xl font-black tracking-tight text-slate-950" href="/">
            Scolia
          </Link>
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            onClick={signOut}
            type="button"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            Se déconnecter
          </button>
        </header>

        {status === 'error' ? (
          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <h1 className="text-xl font-black">Espace indisponible</h1>
            <p className="mt-2 text-sm leading-6 text-amber-900" role="alert">
              {message}
            </p>
            <Link className="mt-5 inline-block font-bold text-blue-800 underline" href="/login">
              Retour à la connexion
            </Link>
          </section>
        ) : (
          <>
            <section className="mt-8 rounded-3xl bg-blue-800 p-6 text-white sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <School aria-hidden="true" className="h-6 w-6" />
              </div>
              <p className="mt-6 text-sm font-semibold text-blue-100">Bienvenue dans votre espace</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight">
                {membership?.schools?.name}
              </h1>
              <p className="mt-2 text-sm text-blue-100">
                {membership?.schools?.city} · {membership?.schools?.currency_default}
              </p>
            </section>

            <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-start gap-4">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                  <h2 className="font-extrabold">Compte sécurisé</h2>
                  <p className="mt-1 text-sm text-slate-600">{email}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Rôle : {membership?.role === 'director' ? 'Directeur' : 'Caissier'}
                  </p>
                </div>
              </div>
            </section>

            <p className="mt-6 text-center text-sm leading-6 text-slate-500">
              La connexion et l’espace de l’école sont prêts. Les fonctions de gestion seront
              reliées à votre compte dans les prochaines phases.
            </p>
            <div className="mt-5 text-center">
              <Link className="font-bold text-blue-700 hover:text-blue-900" href="/dashboard">
                Essayer la démo interactive
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
