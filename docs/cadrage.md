# Cadrage — RsiPaiementQrCode

> Document de référence des décisions prises en Phase 0. À maintenir tout au long du projet.

## Objectif

PWA de paiement d'offrandes pour l'église : dîmes, offrandes du culte, prémices, dons… Accessible depuis un smartphone (membre ou visiteur) et administrée par l'équipe de l'église.

## Décisions (Phase 0)

| Sujet | Décision |
|---|---|
| Donateurs | **Visiteur anonyme** (nom + téléphone) **ou membre connecté** — le compte n'est pas obligatoire pour donner |
| Périmètre | **Multi-temples** : une église, N temples/localités ; chaque offrande est rattachée à un temple |
| Rôles | **Admin** (administration), **Pasteur** (dashboards), **Trésorier** (pointage/rapprochement), **Membre** (déposer + historique) |
| Devise | **Configurable** au niveau de l'église (FCFA, EUR…), multi-devises si besoin |
| Types d'offrandes | Dîme, Offrande du culte, Prémices, Don — **catalogue extensible** (paramétrable) |
| Reçus | **PDF + QR** de vérification + **Email** |
| Paiement | **Simulé** dans un premier temps (validation de la logique métier), **agrégateur réel** intégré ensuite |

## Parcours utilisateur (cible)

1. **Visiteur** → choisit un temple, un type d'offrande, saisit nom/téléphone, valide → reçoit un reçu (PDF + QR) par email.
2. **Membre** → se connecte, choisit temple/type, le montant est pré-suggéré selon son historique → historique + reçus en ligne.
3. **Trésorier / Pasteur / Admin** → tableaux de bord des contributions par temple/type/période, pointage des paiements.

## Roadmap

| Phase | Contenu | Statut |
|---|---|---|
| 0 | Cadrage | ✅ |
| 1 | Création des projets (Spring Boot 3.5 + Angular 20) | ✅ |
| 2 | Modèle de données (PostgreSQL-ready, H2 en dev) | ✅ |
| 3 | Authentification / rôles (Spring Security + JWT) | ✅ |
| 4 | Gestion des membres / temples | 🔄 (API en place, UI "bientôt disponible") |
| 5 | Gestion des contributions | 🔄 (API en place, UI "bientôt disponible") |
| 6 | Paiement simulé | |
| 7 | Historique + reçus (PDF + QR + email) | |
| 8 | Dashboard Pastor / Admin | |
| 9 | Intégration vrai prestataire de paiement | |
| 10 | PWA (manifest, service worker, icônes) | ✅ |
| 10b | Dashboard membre (conforme mockup) | ✅ |
| 10c | Responsive tablette + desktop (sidebar ≥768px) | ✅ |
| 11 | Tests / sécurité | 🔄 (tests d'intégration backend) |
| 12 | Déploiement | |

## Notes techniques

- **Backend** : Spring Boot 3.5.x, Java 17, package `com.church.offering`.
- **Base** : H2 en mémoire en développement ; le modèle est conçu PostgreSQL-compatible (repositories Spring Data JPA identiques, aucun changement de code à la bascule).
- **Paiement** : pas d'intégration Orange Money/MTN/Wave tant que la logique n'est pas validée avec un paiement simulé.
- **Frontend** : Angular 20, composants standalone ; **PWA active** (`@angular/service-worker`, manifest `public/manifest.webmanifest`, `ngsw-config.json`, icônes dans `public/icons/`). Le service worker n'est actif qu'en build de production (`enabled: !isDevMode()`).
- **Responsive** : 3 régimes — mobile **<768px** (encadré 430px, bottom-nav), tablette+**≥768px** (plein écran, sidebar desktop dans l'espace membre, auth en split image/formulaire), grille dashboard 2 colonnes pour **≥1024px**.
- **JWT** : clé dev dans `application.yml`, à surcharger impérativement via `JWT_SECRET` en production, expiration 2h.