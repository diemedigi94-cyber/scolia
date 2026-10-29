# Scolia

Scolia est un outil en construction pour le suivi des frais scolaires des écoles privées en République démocratique du Congo.

## État actuel

- L’accueil et la démo interactive sont accessibles sans compte.
- La démo utilise des données locales dans le navigateur. Les profils directeur et caissier de démonstration ne sont **pas** des comptes sécurisés.
- L’inscription réelle utilise Supabase Auth (e-mail et mot de passe). Elle crée le profil du directeur, son école, son rôle et l’année scolaire en cours.
- Les fonctions de gestion ne sont pas encore toutes reliées à Supabase. Ne pas utiliser la démo pour enregistrer de vrais paiements ou des données réelles d’élèves.

## Lancer le projet en local

Avec Node.js installé :

```bash
npm install
npm run dev
```

Ouvrir ensuite <http://localhost:3000>. Sans configuration Supabase, l’accueil et la démo restent accessibles, mais la connexion et la création de comptes ne fonctionnent pas.

## Configurer Supabase pour l’authentification

1. Créez un projet sur [Supabase](https://supabase.com).
2. Dans **SQL Editor**, copiez `supabase/schema.sql` et cliquez sur **Run**. Le script crée les tables, les règles de sécurité par école et le traitement d’inscription.
3. Dans **Project Settings > API**, récupérez l’URL du projet et la clé publique `anon` (ou `publishable`).
4. Copiez `.env.example` vers `.env.local`, puis renseignez les valeurs :

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-publique
   ```

5. Redémarrez `npm run dev`, puis choisissez **Créer mon école**. Si la confirmation d’adresse est activée dans Supabase, confirmez l’e-mail avant de vous connecter.

La clé publique est limitée par les règles RLS. **Ne placez jamais la clé `service_role` dans le navigateur, `.env.example` ou un fichier versionné.**

Pour déployer sur Vercel, ajoutez les deux variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` aux variables d’environnement du projet, puis déployez.

## Essayer la démo

Depuis l’accueil, choisissez **Découvrir la démo**. Les données de démonstration sont fictives et sauvegardées dans le navigateur. Le changement de rôle dans la démo ne crée pas de comptes Supabase.
