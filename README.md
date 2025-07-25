# Gestion du Matériel – Frontend React

## Présentation

Ce projet est une application de gestion de matériel informatique (et articles associés) pour une organisation, développée en **React** avec une interface moderne et professionnelle basée sur **Material UI (MUI)**.  
Il permet la gestion complète des types, marques, modèles, matériels, affectations, utilisateurs, et bien plus, avec des fonctionnalités avancées d’administration, de filtrage, de recherche, de statistiques et de sécurité.

---

## Fonctionnalités principales

- **Authentification JWT** (connexion, routes protégées)
- **Gestion CRUD** (création, lecture, modification, suppression) pour :
  - Types de matériel
  - Marques
  - Modèles
  - Matériels
  - Articles
  - Affectations (attribution de matériel à un agent/utilisateur)
- **Tableaux dynamiques** avec :
  - Pagination, tri, recherche, filtres dépendants (type → marque → modèle)
  - Sélection multiple et suppression par lot
  - Édition inline (ex : numéro de série)
  - Boutons d’action (supprimer, modifier)
- **Dashboard d’administration** avec statistiques, graphiques (Chart.js), alertes, et résumé des affectations
- **Navigation moderne** : sidebar MUI, tabs, responsive design
- **Pop-up de confirmation** (Dialog MUI) pour toutes les suppressions
- **Gestion des erreurs** et feedback utilisateur (alertes, helperText, désactivation des boutons)
- **Réinitialisation rapide des filtres**
- **Sécurité** : désactivation des actions impossibles (ex : suppression d’un matériel affecté)

---

## Bibliothèques et outils utilisés

- **React** (hooks, context)
- **Material UI (MUI)** – composants UI modernes (Table, Dialog, Button, Tabs, Drawer, etc.)
- **Axios** – requêtes HTTP vers l’API backend
- **React Router** – navigation et routes protégées
- **Chart.js** + **react-chartjs-2** – graphiques statistiques
- **react-bootstrap-typeahead** – auto-complétion pour la sélection d’agents
- **JWT-decode** – décodage du token JWT pour la gestion des rôles
- **React Icons** ou MUI Icons – icônes modernes
- **Classnames** – gestion conditionnelle des classes CSS (optionnel)
- **Autres** : outils de développement, ESLint, Prettier, etc.

---

## Architecture et organisation

- **src/pages/Admin/** – toutes les pages d’administration (Types, Marques, Modèles, Matériels, Dashboard, etc.)
- **src/components/** – composants réutilisables (Sidebar, CardLayout, MaterielForm, PaginationControl, etc.)
- **src/api/** – fonctions d’appel à l’API backend (getMateriels, updateMateriel, etc.)
- **src/context/** – gestion du contexte d’authentification
- **src/utils/** – utilitaires (stockage du token, helpers)
- **src/assets/** – images, logos

---

## Fonctionnement technique

- **Connexion** : l’utilisateur s’authentifie, le token JWT est stocké et utilisé dans tous les appels API.
- **Navigation** : sidebar MUI et tabs pour accéder à toutes les pages d’administration.
- **Gestion CRUD** : chaque entité (type, marque, modèle, matériel) a sa page dédiée avec :
  - Tableaux dynamiques (MUI Table)
  - Filtres dépendants (sélection d’un type filtre les marques, etc.)
  - Recherche, tri, pagination
  - Sélection multiple et suppression par lot (avec pop-up de confirmation)
  - Édition inline (ex : numéro de série)
- **Affectation** : formulaire avec auto-complétion pour choisir un agent, sélection dépendante du matériel disponible.
- **Dashboard** : affichage de statistiques, graphiques, alertes, et résumé des affectations.
- **Sécurité** : actions impossibles désactivées (ex : suppression d’un matériel affecté), feedback utilisateur en cas d’erreur.
- **Pop-up de confirmation** : toutes les suppressions (individuelle ou multiple) passent par une modale MUI.

---

## Points techniques importants

- **Centralisation des colonnes de tableaux** dans `adminTableColumns.js` pour un code DRY et maintenable.
- **Mapping dynamique** pour afficher les valeurs liées (ex : afficher le nom du type à partir de l’id).
- **Gestion des erreurs** spécifique à chaque champ lors de l’édition inline.
- **Réinitialisation des filtres** qui recharge dynamiquement les listes dépendantes.
- **Utilisation de l’état local et global** (context) pour une UX fluide et réactive.
- **Respect des bonnes pratiques REST** (envoi de l’objet complet lors d’un PUT, gestion des erreurs backend).

---

## Dashboard d’administration et graphiques

Le projet inclut un **dashboard moderne** accessible aux administrateurs, qui centralise les statistiques et l’état du parc matériel. Il est conçu pour offrir une vue d’ensemble rapide et des analyses visuelles grâce à des graphiques interactifs.

### Fonctionnalités du dashboard
- **Cartes de résumé** : total des matériels, matériels affectés, disponibles, utilisateurs, etc.
- **Graphiques dynamiques** (via Chart.js et react-chartjs-2) :
  - **Camembert/Pie** : répartition des matériels par type (ex : PC, ECRAN, Imprimante…)
  - **Barres** : nombre de matériels par marque ou par modèle
  - **Doughnut** : comparaison matériels affectés vs disponibles
  - **Ligne/Area** : évolution des ajouts de matériels ou d’affectations dans le temps
- **Alertes** : matériels en stock faible, matériels très utilisés, alertes de maintenance à venir
- **Filtres dynamiques** : possibilité de filtrer les graphiques par type, marque, période, etc.
- **Section “statistiques avancées”** : nombre d’affectations ce mois, matériels les plus affectés, utilisateurs les plus actifs, etc.

### Fonctionnement technique
- Les données sont récupérées via l’API backend (ex : `/api/materiels`, `/api/affectations`, `/api/types`…)
- Les graphiques sont générés côté frontend avec **Chart.js** (via le wrapper react-chartjs-2), ce qui permet une grande flexibilité et des animations modernes.
- Les couleurs, labels et légendes sont personnalisés pour une meilleure lisibilité.
- Les statistiques sont recalculées à chaque chargement ou modification des données (ajout, suppression, affectation…)
- Les alertes sont générées dynamiquement selon des seuils définis (ex : stock < 3, matériels affectés > 10 fois…)

### Utilité pour l’utilisateur
- Permet de **visualiser rapidement l’état du parc** (répartition, disponibilité, alertes)
- Facilite la **prise de décision** (achat, maintenance, réaffectation…)
- Met en avant les points critiques (stock faible, matériels très sollicités)
- Offre une expérience moderne et professionnelle grâce à l’intégration de graphiques interactifs et de filtres avancés

---

## Lancement du projet

1. **Installer les dépendances** :
   ```bash
   npm install
   ```
2. **Configurer l’URL de l’API backend** dans `src/api/auth.js` (`API_URL`)
3. **Démarrer l’application** :
   ```bash
   npm start
   ```
4. **Accéder à l’interface** sur [http://localhost:3000](http://localhost:3000)

---

## À propos du backend

- Le backend doit respecter les conventions REST (routes, gestion des erreurs, update vs insert).
- Les endpoints doivent exister pour tous les CRUD (types, marques, modèles, matériels, affectations, etc.).
- Les routes de modification (`PUT`) doivent vérifier l’existence de l’entité avant update.

---

## Contribution

- Le code est organisé pour faciliter l’ajout de nouvelles entités ou fonctionnalités.
- Les composants et la logique de table sont factorisés pour une maintenance aisée.

---

N’hésite pas à adapter ce README à tes besoins spécifiques (ajoute des captures, des exemples d’API, etc.) !
Si tu veux une version en anglais ou plus détaillée sur un point précis, fais-moi signe !

---

## Auteur

Ce projet a été réalisé par **YASSINE BISSAOUI**.