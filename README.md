# RsiPaiementQrCode

PWA de paiement d'offrandes pour l'église (dîmes, offrandes du culte, prémices, dons…).

## Stack

- **Backend** : Spring Boot 3.5.x (Java 17, Maven) — `backend/`
  - Web, Spring Data JPA, Validation
  - Base de données H2 en mémoire (dev), console H2 sur `/h2-console`
- **Frontend** : Angular 20 — `frontend/`
  - Standalone components, routing activé

## Démarrage

### Backend

```bash
cd backend
mvn spring-boot:run
```

- API : http://localhost:8080
- Console H2 : http://localhost:8080/h2-console (JDBC URL : `jdbc:h2:mem:offeringdb`)

### Frontend

```bash
cd frontend
npm start
```

- App : http://localhost:4200

## Arborescence

```
├── backend/    # API Spring Boot
└── frontend/   # Application Angular (future PWA)
```

## Feuille de route (à venir)

- Domaine métier : types d'offrandes (DÎMES, OFFRANDES DU CULTE, PRÉMICES, DON…), donateurs, transactions
- Intégration agrégateur de moyens de paiement
- Génération de tickets / QR code
- Mode PWA (manifest, service worker) et déploiement HTTPS