# Déploiement — première version

Version en ligne : https://rsi-paiement.vercel.app (API : https://rsi-paiement-api.onrender.com).

Architecture :

```
Navigateur ──HTTPS──▶ Vercel (frontend Angular + PWA)
                         │  /api/*  (rewrite, même origine)
                         ▼
                      Render (backend Spring Boot, Docker)
                         │  JDBC + SSL
                         ▼
                      Supabase (PostgreSQL)
```

Vercel ne peut pas exécuter le backend Java (serveur permanent) : il est hébergé sur Render.
Le frontend appelle `/api`, que Vercel relaie vers Render — pas de CORS côté navigateur.

Ordre : **1. Supabase → 2. Render → 3. Vercel → 4. finitions**.

---

## 1. Supabase (base PostgreSQL)

1. Créer un compte sur https://supabase.com puis **New project**.
   - Région : la plus proche des fidèles et de Render (ex. *West EU (Paris)* ou *Frankfurt*).
   - Mot de passe de la base : en générer un fort et le **conserver** (gestionnaire de mots de passe).
2. Une fois le projet prêt : bouton **Connect** → onglet **Session pooler** (compatible IPv4,
   nécessaire pour Render). Noter :
   - Host : `aws-0-<region>.pooler.supabase.com`
   - Port : `5432`
   - User : `postgres.<référence-du-projet>`
3. Les tables sont créées automatiquement au premier démarrage du backend : rien à faire dans l'éditeur SQL.

> Ne pas utiliser le *Transaction pooler* (port 6543) : il est incompatible avec les requêtes préparées de Hibernate.

## 2. Render (backend)

1. Créer un compte sur https://render.com (connexion avec GitHub).
2. **New → Web Service** → choisir le dépôt `RsiPaiementQrCode`.
   - **Root Directory** : `backend`
   - **Language / Runtime** : `Docker` (le `backend/Dockerfile` est détecté)
   - **Region** : la même que Supabase
   - **Instance** : *Free* pour une démo (le service s'endort après 15 min d'inactivité ; le premier
     appel suivant prend ~1 min). *Starter* pour un usage réel.
3. **Environment Variables** :

| Variable | Valeur |
|---|---|
| `DB_URL` | `jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require` |
| `DB_USERNAME` | `postgres.<référence-du-projet>` |
| `DB_PASSWORD` | mot de passe Supabase (étape 1) |
| `JWT_SECRET` | chaîne aléatoire ≥ 32 caractères (ex. sortie de `openssl rand -base64 48`) |
| `ADMIN_EMAIL` | email du premier administrateur |
| `ADMIN_PASSWORD` | mot de passe fort (≥ 12 caractères) — à changer après la 1re connexion |
| `CORS_ALLOWED_ORIGINS` | `https://<projet>.vercel.app` (connu à l'étape 3, mettre une valeur provisoire) |
| `QR_DONATION_URL` | `https://<projet>.vercel.app/don` |
| `QR_APP_URL` | `https://<projet>.vercel.app/login` |
| `PAYMENT_SIMULATION_ENABLED` | `true` **uniquement pour la démo** (sans agrégateur, sinon les dons sont refusés). Repasser à `false` avant d'ouvrir au public |

4. **Create Web Service**. Dans les logs, attendre :
   `Started OfferingApplication` puis `Administrateur initial créé : …`.
5. Noter l'URL du service : `https://<nom>.onrender.com`. Vérifier :
   `https://<nom>.onrender.com/api/public/offering-types` → liste des 4 types d'offrande.

Le démarrage échoue volontairement si `JWT_SECRET` ou `DB_URL` manque. Les comptes de démonstration
(`admin@rsi.local`…) ne sont **jamais** créés en production.

## 3. Vercel (frontend)

1. Dans `frontend/vercel.json`, remplacer `REMPLACER-PAR-URL-BACKEND.onrender.com` par l'hôte Render
   (étape 2.5), commiter et pousser.
2. Créer un compte sur https://vercel.com (connexion avec GitHub) → **Add New → Project** → importer le dépôt.
   - **Root Directory** : `frontend`
   - Framework : *Angular* (commande et dossier de sortie sont lus dans `vercel.json`)
3. **Deploy**. Vercel fournit l'URL `https://<projet>.vercel.app` (HTTPS forcé automatiquement).
4. Retourner sur Render et mettre à jour `CORS_ALLOWED_ORIGINS`, `QR_DONATION_URL`, `QR_APP_URL`
   avec cette URL (Render redéploie tout seul).

## 4. Finitions

- En cas de domaine personnalisé : remplacer `https://rsi-paiement.vercel.app` dans
  `frontend/src/index.html`, `frontend/public/robots.txt` et `frontend/public/sitemap.xml`,
  ainsi que dans les variables Render (CORS, QR).
- Compléter les pages `/confidentialite` et `/conditions` (éléments entre crochets).
- Se connecter avec `ADMIN_EMAIL`, puis changer le mot de passe dans **Réglages → Mot de passe**.
- Imprimer le QR du don : `https://<projet>.vercel.app/don` (il pointe désormais vers la vraie URL).
- Tester l'installation PWA sur un téléphone (HTTPS requis : c'est le cas sur Vercel).

## Vérifier en local avant de déployer (optionnel, Docker)

```bash
docker network create rsi-test
docker run -d --name rsi-pg --network rsi-test -e POSTGRES_PASSWORD=local postgres:16-alpine
docker build -t rsi-backend backend
docker run --rm --network rsi-test -p 18080:8080 \
  -e DB_URL=jdbc:postgresql://rsi-pg:5432/postgres -e DB_USERNAME=postgres -e DB_PASSWORD=local \
  -e JWT_SECRET=une-chaine-locale-de-plus-de-32-caracteres \
  -e CORS_ALLOWED_ORIGINS=http://localhost:4200 \
  -e QR_DONATION_URL=http://localhost:4200/don -e QR_APP_URL=http://localhost:4200/login \
  rsi-backend
```

## Limites connues de cette première version

- Schéma géré par Hibernate (`ddl-auto: update`) : suffisant pour démarrer ; passer à Flyway quand le
  modèle se stabilise (renommages de colonnes non gérés).
- Render *Free* s'endort : premier chargement lent après inactivité.
- Paiement encore simulé tant que l'agrégateur n'est pas intégré.
