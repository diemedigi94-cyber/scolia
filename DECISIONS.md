# Registre des Décisions d'Architecture et Produit (DECISIONS.md)

Ce document consigne tous les choix structurants réalisés lors de la conception de **Scolia**, ainsi que les raisons métier et techniques associées.

---

### Décision 1 : Stockage des montants d'argent en nombres entiers
- **Constat :** En informatique, les nombres à virgule flottante (comme `0.1 + 0.2 = 0.30000000000000004`) créent des erreurs d'arrondi dramatiques pour la comptabilité d'une école.
- **Choix retenu :**
  - **Pour les Dollars (USD) :** Tous les montants sont stockés dans la plus petite unité, c'est-à-dire les **centimes** (`cents`). Par exemple, $50.00 est stocké sous la forme de l'entier `5000`.
  - **Pour les Francs congolais (CDF) :** Les montants sont stockés en unités entières (ex : `120000` pour 120 000 CDF).
- **Bénéfice :** Précision arithmétique absolue à 100%, aucune perte de centime, conformité bancaire.

---

### Décision 2 : Double monnaie (USD et CDF) sans conversion forcée
- **Constat :** En RDC, certaines écoles facturent les frais de scolarité en USD et les fournitures ou uniformes en CDF. Les taux de change du marché parallèle fluctuent constamment.
- **Choix retenu :** Le directeur ou la caissière dispose d'un sélecteur simple en un clic [Dollar (USD)] / [Franc (CDF)]. Les soldes restent calculés et affichés distinctement dans chaque monnaie sans appliquer de taux de change automatique non maîtrisé par l'école.
- **Bénéfice :** Transparence totale pour les parents et zéro risque de litige sur un taux de conversion non agréé.

---

### Décision 3 : Interdiction stricte de suppression physique des paiements
- **Constat :** Dans un cahier ou un tableau Excel classique, un caissier indélicat peut effacer une ligne après avoir encaissé de l'argent liquide, ce qui favorise la fraude.
- **Choix retenu :** L'instruction SQL `DELETE` est proscrite sur la table `payments`. Un paiement erroné ne peut être qu'**annulé**. L'annulation exige obligatoirement un motif écrit, horodaté et rattaché à l'identité du directeur dans le journal d'audit.
- **Bénéfice :** Confiance totale pour les promoteurs d'écoles privées. Toutes les écritures de caisse sont irréversibles et auditables.

---

### Décision 4 : Interface pensée d'abord pour le téléphone (« Mobile-First »)
- **Constat :** Les caissières et directeurs des écoles pilotes n'ont pas toujours d'ordinateur allumé ou d'onduleur fiable en cas de coupure de courant à Kinshasa. Ils utilisent leur smartphone Android.
- **Choix retenu :**
  - Gros boutons tactiles (hauteur minimum de 48px pour faciliter l'appui du pouce).
  - Contraste élevé pour une lisibilité parfaite sous forte luminosité.
  - Formulaire de paiement épuré pour valider un encaissement en moins de 30 secondes chrono.
- **Bénéfice :** Adoption immédiate par les équipes sans formation technique préalable.

---

### Décision 5 : Reçus au format compact vertical (non A4)
- **Constat :** Les feuilles A4 ou A3 sont coûteuses en papier et peu pratiques à lire ou stocker pour les parents sur leurs téléphones.
- **Choix retenu :** Un format compact vertical inspiré des fiches reçus et tickets de caisse, parfaitement lisible sur l'écran d'un smartphone et imprimable directement sur une imprimante thermique de caisse de 58mm ou 80mm si l'école en possède une.
- **Bénéfice :** Économie de papier pour l'école et reçu facile à transférer ou enregistrer dans la galerie photo du parent.

---

### Décision 6 : Relances WhatsApp directes sans surcoût d'API pour le MVP
- **Constat :** Les API officielles payantes (Meta Business API) demandent des démarches administratives longues (vérification d'entreprise, numéro dédié) et facturent chaque message. Pour 4 écoles pilotes, cela ajouterait une barrière à l'entrée.
- **Choix retenu :** Utilisation des liens universels WhatsApp `wa.me/243...` avec message poli pré-rédigé comprenant le nom de l'enfant et le montant exact restant.
- **Bénéfice :** Zéro frais d'envoi pour l'école, mise en service instantanée et contrôle humain avant chaque envoi.

---

### Décision 7 : Séparation stricte des données (« Multi-Tenant » avec RLS Supabase)
- **Constat :** Plusieurs écoles utilisent la même plateforme. Aucune école ne doit pouvoir consulter ne serait-ce qu'un nom d'élève ou un montant d'une autre école.
- **Choix retenu :** Chaque table comporte un identifiant `school_id` obligatoire, protégé au niveau du moteur PostgreSQL par les politiques de sécurité par ligne (*Row Level Security* - RLS).
- **Bénéfice :** Cloisonnement étanche et protection des données des élèves mineurs.

---

### Décision 8 : Fuseau horaire de référence « Africa/Kinshasa » (UTC+1)
- **Constat :** Le décalage horaire avec les serveurs internationaux peut faire passer un paiement enregistré à 23h30 au jour suivant.
- **Choix retenu :** Toutes les dates, heures de saisie et écritures d'audit sont verrouillées sur le fuseau officiel de la capitale congolaise `Africa/Kinshasa`.

---

### Décision 9 : Connexion par e-mail et mot de passe via Supabase Auth
- **Constat :** Les profils de démonstration stockés dans le navigateur ne vérifient pas l’identité et ne conviennent pas aux données réelles des écoles.
- **Choix retenu :** L’authentification réelle passe par Supabase Auth. L’inscription crée le profil, l’école, le rôle directeur et l’année scolaire en une seule transaction côté base de données.
- **Bénéfice :** Les mots de passe ne sont pas gérés par l’application et les accès aux données sont contrôlés par les politiques RLS.

---

### Décision 10 : La démo reste distincte des comptes réels
- **Constat :** Les écrans de démonstration utilisent encore un stockage local et ne sont pas reliés aux tables Supabase.
- **Choix retenu :** Conserver la démo pour essayer l’interface, mais signaler clairement qu’elle n’est pas un espace sécurisé et ne doit pas recevoir de données réelles.
- **Bénéfice :** Les fonctions existantes restent essayables sans confondre un profil fictif avec un compte d’école.
