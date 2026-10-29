import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Check,
  CircleDollarSign,
  Clock3,
  MessageCircle,
  Smartphone,
  Users,
} from 'lucide-react';

const whatsappUrl = `https://wa.me/243999189832?text=${encodeURIComponent(
  'Bonjour, je souhaite demander une démonstration de Scolia.',
)}`;

const features = [
  {
    icon: Banknote,
    title: 'Les paiements bien suivis',
    description:
      'Notez les paiements en espèces, par mobile money ou par virement, au même endroit.',
  },
  {
    icon: CircleDollarSign,
    title: 'USD et CDF, sans mélange',
    description:
      'Suivez les montants dans leur devise. Aucun taux de conversion n’est appliqué automatiquement.',
  },
  {
    icon: Clock3,
    title: 'Les retards plus visibles',
    description:
      'Repérez les soldes à recouvrer et préparez un rappel WhatsApp quand c’est nécessaire.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9fc] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="Scolia, accueil" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-lg font-black text-white shadow-lg shadow-blue-900/15">
            S
          </span>
          <span>
            <span className="block text-xl font-extrabold tracking-tight">Scolia</span>
            <span className="hidden text-xs font-medium text-slate-500 sm:block">
              La gestion scolaire, simplement
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
          <a className="transition hover:text-blue-700" href="#fonctionnalites">
            Fonctionnalités
          </a>
          <a className="transition hover:text-blue-700" href="#pour-qui">
            Pour les écoles
          </a>
          <Link className="transition hover:text-blue-700" href="/dashboard">
            Voir la démo
          </Link>
          <Link className="transition hover:text-blue-700" href="/login">
            Connexion
          </Link>
        </nav>

        <a
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-900/10 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle aria-hidden="true" className="h-4 w-4" />
          <span className="hidden sm:inline">Demander une démo</span>
          <span className="sm:hidden">Démo WhatsApp</span>
        </a>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12 lg:pb-28 lg:pt-16">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-2 text-xs font-bold text-blue-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Pour les écoles privées de RDC
          </div>
          <h1 className="max-w-2xl text-4xl font-black leading-[1.1] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Les frais scolaires,
            <span className="mt-1 block text-blue-700">plus simples à suivre.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Suivez les frais, retrouvez les paiements et relancez les retards simplement.
            Scolia aide votre équipe à garder une trace claire des encaissements et des soldes.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle aria-hidden="true" className="h-5 w-5" />
              Demander une démo sur WhatsApp
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
            <Link
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100"
              href="/dashboard"
            >
              Découvrir la démo
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Déjà un compte ?{' '}
            <Link className="font-bold text-blue-700 hover:text-blue-900" href="/login">
              Se connecter
            </Link>
            <span className="mx-2">·</span>
            <Link className="font-bold text-blue-700 hover:text-blue-900" href="/register">
              Créer mon école
            </Link>
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
            <span className="inline-flex items-center gap-2">
              <Check aria-hidden="true" className="h-4 w-4 text-emerald-600" />
              Espèces et mobile money
            </span>
            <span className="inline-flex items-center gap-2">
              <Check aria-hidden="true" className="h-4 w-4 text-emerald-600" />
              USD et CDF
            </span>
            <span className="inline-flex items-center gap-2">
              <Check aria-hidden="true" className="h-4 w-4 text-emerald-600" />
              Pensé pour téléphone
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:mx-0">
          <div className="absolute -left-8 top-12 h-36 w-36 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="absolute -bottom-8 -right-4 h-40 w-40 rounded-full bg-emerald-200/60 blur-3xl" />
          <div className="relative rounded-[2rem] border border-slate-200/80 bg-white p-4 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.35)] sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-sm font-bold text-slate-900">Aperçu du suivi</p>
                <p className="mt-1 text-xs text-slate-500">Exemple illustratif · montants fictifs</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                Année scolaire
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">À recouvrer</p>
                <p className="mt-2 text-xl font-black tracking-tight text-slate-900">USD · CDF</p>
                <p className="mt-1 text-xs text-slate-500">Soldes séparés par devise</p>
              </div>
              <div className="rounded-2xl bg-blue-700 p-4 text-white">
                <p className="text-xs font-semibold text-blue-100">Encaissements</p>
                <p className="mt-2 text-xl font-black tracking-tight">Suivis</p>
                <p className="mt-1 text-xs text-blue-100">Avec leur mode de paiement</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800">Moyens de paiement</p>
                <Smartphone aria-hidden="true" className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {['Espèces', 'Mobile money', 'Virement'].map((method) => (
                  <div
                    className="rounded-xl bg-slate-50 px-2 py-3 text-center text-xs font-semibold text-slate-600"
                    key={method}
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <MessageCircle aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">Relance à préparer</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-600">
                  Un message WhatsApp s’ouvre, prêt à être envoyé.
                </p>
              </div>
              <ArrowUpRight aria-hidden="true" className="ml-auto h-4 w-4 shrink-0 text-emerald-700" />
            </div>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="border-y border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
              Plus de clarté au quotidien
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Tout commence par un suivi simple.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Les informations utiles à l’équipe de l’école, sans ajouter de démarches compliquées
              pour les parents.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                className="rounded-3xl border border-slate-200 bg-[#fbfcfe] p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5"
                key={title}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-slate-900">{title}</h3>
                <p className="mt-2 leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pour-qui" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="flex flex-col gap-8 rounded-[2rem] bg-slate-950 px-6 py-9 text-white sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-300">
              <Users aria-hidden="true" className="h-4 w-4" />
              Pour les équipes des écoles privées
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Moins de cahiers à vérifier. Plus de visibilité sur les frais.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-300">
              Le directeur suit les soldes ; le caissier enregistre les paiements et retrouve
              l’historique. Les parents n’ont pas besoin de créer un compte.
            </p>
          </div>
          <a
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-bold text-white transition hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle aria-hidden="true" className="h-5 w-5" />
            Parler de Scolia
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>
            <span className="font-extrabold text-slate-800">Scolia</span>
            <span className="mx-2">·</span>
            Suivi des frais scolaires pour les écoles privées en RDC.
          </p>
          <Link className="font-semibold text-blue-700 hover:text-blue-900" href="/dashboard">
            Ouvrir la démo
          </Link>
        </div>
      </footer>
    </main>
  );
}
