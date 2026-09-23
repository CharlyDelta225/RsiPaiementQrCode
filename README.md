# RsiPaiementQrCode

PWA de paiement d'offrandes pour l'église (dîmes, offrandes du culte, prémices, dons…).

## Stack

- **Backend** : Spring Boot 3.5.x (Java 17, Maven) — `backend/`
  - Web, Spring Data JPA, Validation, Spring Security + JWT (filtre + entry point REST)
  - Base de données H2 en mémoire (dev, PostgreSQL-ready), console H2 sur `/h2-console`
  - Domaines : église/temples, membres, types d'offrandes, contributions, reçus, paiements
  - Authentification : login, register (rôles Membre/Admin/Trésorier/Pasteur)
  - REST : `/api/auth`, `/api/member/**`, `/api/contribution/**`, `/api/temple/**`, `/api/user/**`
- **Frontend** : Angular 20 — `frontend/`
  - Standalone components, routing activé, guard d'authentification
  - **PWA** : `@angular/service-worker`, manifest + icônes, `ngsw-config.json`
  - Responsive : mobile (<768px, encadré 430px + bottom-nav), tablette/desktop (≥768px, sidebar + grille plein écran), auth en split image/formulaire
  - Pages : welcome (hero), login/register, dashboard membre (solde, actions rapides, verset, contributions récentes)

## Démarrage

### Backend

```bash
cd backend
mvn spring-boot:run
```

- API : http://localhost:8080
- Console H2 : http://localhost:8080/h2-console (JDBC URL : `jdbc:h2:mem:offeringdb`)
- Comptes seed (dev) : `admin@rsi.local / Admin@12345`, `membre@rsi.local / Membre@12345`, `tresorier@rsi.local / Tresorier@12345`, `pasteur@rsi.local / Pasteur@12345`
- JWT : clé dev par défaut surchargée par la variable d'environnement `JWT_SECRET` ; expiration 2h
- CORS : `CORS_ALLOWED_ORIGINS` (défaut http://localhost:4200)

### Frontend

```bash
cd frontend
npm start
```

- App : http://localhost:4200
- Build prod (génère les fichiers service worker) : `npm run build`

## Arborescence

```
├── backend/    # API Spring Boot (security, model, repository, service, web)
├── docs/       # Cadrage & décisions
└── frontend/   # Application Angular (PWA)
```

## Feuille de route (à venir)

- Gestion membres / temples (CRUD backend en cours, pages frontend "bientôt disponible")
- Gestion des contributions + paiement simulé
- Historique + reçus (PDF + QR + email)
- Dashboard Pastor / Admin
- Intégration vrai agrégateur de moyens de paiement / génération QR
- Déploiement HTTPS (requis pour le service worker)