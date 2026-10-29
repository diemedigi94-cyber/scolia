# Scolia 🇨🇩

> **Logiciel en ligne de suivi et recouvrement des frais scolaires pour les écoles privées en République démocratique du Congo.**

---

## 🎯 Problème résolu

Dans la majorité des écoles privées en RDC :
- Les parents paient en retard ou par petites tranches.
- Les paiements en espèces sont inscrits sur des cahiers volants et se perdent.
- Les relances téléphoniques se font manuellement et prennent des heures.
- En fin d'année scolaire, une grande partie des recettes reste impayée.

**Scolia** permet à la caissière d'enregistrer un versement en **moins de 30 secondes** depuis un simple smartphone, d'émettre un reçu officiel partageable immédiatement sur WhatsApp, et donne au directeur une vision en temps réel du reste à recouvrer.

---

## ⚡ Fonctionnalités du MVP (Étape 1)

1. **Multi-écoles & Rôles :**
   - Inscription directe du directeur depuis la page d'accueil.
   - Séparation stricte des données entre écoles.
   - Rôles dédiés : **Directeur** (vision globale, audit, annulations) et **Caissière** (encaissement ultra-rapide).
2. **Double Monnaie (USD & CDF) :**
   - Choix de la devise en un clic : Franc congolais ou Dollar américain.
   - Stockage en nombres entiers (cents pour USD, unités pour CDF) : **zéro erreur de virgule**.
3. **Élèves & Classes :**
   - 3 classes types (7EB, 8EB, 1SC) et 30 élèves de démonstration avec noms et numéros WhatsApp réalistes (+243).
   - Importation groupée depuis un fichier **Excel ou CSV** avec modèle type téléchargeable.
4. **Paiements & Reçus :**
   - Espèces, Mobile Money (M-Pesa, Orange Money, Airtel Money) et Virement bancaire.
   - **Règle d'or :** Aucun paiement n'est supprimé définitivement. Une annulation exige un motif obligatoire et reste tracée.
   - Reçu compact vertical (format adapté smartphone et imprimante thermique) avec lien direct WhatsApp (`wa.me`).
5. **Relances WhatsApp en 1 clic :**
   - Calcul automatique des impayés et des retards en jours.
   - Bouton « Envoyer un rappel » préremplissant le message de relance poli sans frais d'API.
6. **Journal d'Audit :**
   - Traçabilité à la seconde (fuseau `Africa/Kinshasa`) de toutes les opérations financières.

---

## 🚀 Comment déployer sur Vercel (Recommandé)

1. Créez un compte sur [Vercel.com](https://vercel.com) (gratuit).
2. Importez le dossier du projet ou connectez votre dépôt GitHub.
3. Cliquez sur **Deploy**.
4. L'application fonctionne immédiatement en mode autonome avec les 30 élèves et données de démonstration !

---

## 🗄️ Comment connecter Supabase (Base de données PostgreSQL)

1. Créez un projet gratuit sur [Supabase.com](https://supabase.com).
2. Ouvrez l'onglet **SQL Editor** dans Supabase.
3. Copiez le contenu du fichier `supabase/schema.sql` et cliquez sur **Run**.
4. Dans votre tableau de bord Supabase, copiez les clés dans **Project Settings > API** :
   - `Project URL`
   - `anon public key`
5. Dans Vercel (ou votre fichier `.env.local`), ajoutez :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-publique
   ```

---

## 💻 Comment lancer le projet en local (sur votre ordinateur)

Dès que Node.js est installé sur votre ordinateur :

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev

# 3. Ouvrir dans le navigateur
# http://localhost:3000
```

---

## 🧪 Données de test et rôles préconfigurés

| Profil | Nom d'utilisateur | Rôle | Droits |
| :--- | :--- | :--- | :--- |
| **Directeur** | M. Jean-Paul Mukendi | `director` | Tableau de bord complet, impayés, annulation avec motif, journal d'audit |
| **Caissière** | Mme Rachel Kabedi | `cashier` | Encaissement express (&lt; 30s), édition des reçus, partage WhatsApp |

*Astuce : Vous pouvez basculer d'un profil à l'autre en un tap grâce au bouton situé en haut à droite de l'écran.*
