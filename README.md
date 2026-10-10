# RsiPaiementQrCode

PWA de paiement d'offrandes pour l'église (dîmes, offrandes du culte, prémices, dons…).

## Stack

- **Backend** : Spring Boot 3.5.x (Java 17, Maven) — `backend/`
  - Web, Spring Data JPA, Validation, Spring Security + JWT (filtre + entry point REST)
  - Base de données H2 enregistrée dans `backend/data/` (dev, PostgreSQL-ready, surchargeable par `DB_URL`), console H2 sur `/h2-console` ; les tests utilisent une base en mémoire
  - Domaines : église/temples, membres, types d'offrandes, contributions, reçus, paiements
  - Authentification : login, register (rôles Membre/Admin/Trésorier/Pasteur)
  - REST : `/api/auth`, `/api/my/**` (don membre, reçu, profil, mot de passe), `/api/public/**` (don QR), `/api/admin/**`, `/api/temples/**`
- **Frontend** : Angular 20 — `frontend/`
  - Standalone components, routing activé, guard d'authentification
  - **PWA** : `@angular/service-worker`, manifest + icônes, `ngsw-config.json`
  - Responsive : mobile (<768px, encadré 430px + bottom-nav), tablette/desktop (≥768px, sidebar + grille plein écran), auth en split image/formulaire
  - Pages : welcome (hero), login/register, don public `/don`, espace membre (tableau de bord, contribution, historique + détail du reçu, profil)

## Démarrage

### Backend

```bash
cd backend
mvn spring-boot:run
```

- API : http://localhost:8080
- Console H2 : http://localhost:8080/h2-console (JDBC URL : `jdbc:h2:file:./data/offeringdb;AUTO_SERVER=TRUE`)
- Repartir d'une base vierge : arrêter le backend et supprimer le dossier `backend/data/`
- Comptes seed (dev) : `admin@rsi.local / Admin@12345`, `membre@rsi.local / Membre@12345`, `tresorier@rsi.local / Tresorier@12345`, `pasteur@rsi.local / Pasteur@12345`
- JWT : clé dev par défaut surchargée par la variable d'environnement `JWT_SECRET` ; expiration 2h
- CORS : `CORS_ALLOWED_ORIGINS` (défaut http://localhost:4200)
- Paiement simulé : `PAYMENT_SIMULATION_ENABLED` (défaut `true` en dev). **À mettre à `false` en production** tant que l'agrégateur n'est pas branché : sinon n'importe qui pourrait marquer un don comme payé
- Anti-spam : POST limités par IP et par minute sur `/api/auth/login` (20), `/api/auth/register` (10) et `/api/public/**` (60), réglables dans `app.rate-limit` (`RATE_LIMIT_ENABLED`). Derrière un reverse proxy, activer `server.forward-headers-strategy=native`
- Saisie manuelle d'une contribution (`POST /api/contributions`, ex. espèces du culte) : réservée à l'Admin et au Trésorier
- QR codes : `QR_DONATION_URL` (QR du don affiché à l'église, défaut http://localhost:4200/don) et `QR_APP_URL` (QR « installer sur mobile » proposé après connexion sur ordinateur, défaut http://localhost:4200/login) — à régler sur l'URL publique HTTPS en production

### Frontend

```bash
cd frontend
npm start
```

- App : http://localhost:4200
- L'app appelle l'API en relatif (`/api`) : `ng serve` relaie vers http://localhost:8080 (`proxy.conf.json`). En production, servir le frontend et l'API sur la même origine (reverse proxy)
- Tester sur un téléphone du même wifi : `npm run start:lan`, puis ouvrir `http://<IP-du-PC>:4200` sur le téléphone (l'installation PWA exige toutefois HTTPS)
- Build prod (génère les fichiers service worker) : `npm run build`

## Déploiement

Frontend sur **Vercel**, backend Docker sur **Render**, base PostgreSQL sur **Supabase** : guide pas à pas dans [docs/deploiement.md](docs/deploiement.md) (profil Spring `prod`, `backend/Dockerfile`, `frontend/vercel.json`).

## Avant la mise en ligne

- Remplacer `https://example.org` par le domaine public dans `frontend/src/index.html` (balises Open Graph), `frontend/public/robots.txt` et `frontend/public/sitemap.xml`
- Compléter les éléments entre crochets des pages `/confidentialite` et `/conditions` et les faire valider par l'église
- `PAYMENT_SIMULATION_ENABLED=false`, `JWT_SECRET`, `QR_DONATION_URL`, `QR_APP_URL` ; HTTPS forcé (redirection 80→443 + HSTS) au niveau du serveur frontal

## Arborescence

```
├── backend/    # API Spring Boot (security, model, repository, service, web)
├── docs/       # Cadrage & décisions
└── frontend/   # Application Angular (PWA)
```

## Feuille de route (à venir)

- Gestion membres / temples côté admin (CRUD backend en place, pages frontend à venir)
- Historique + reçus (PDF + QR + email)
- Dashboard Pastor / Admin
- Intégration vrai agrégateur de moyens de paiement / génération QR
- Déploiement HTTPS (requis pour le service worker)