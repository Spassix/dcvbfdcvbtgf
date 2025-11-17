# PLUG CERTIFIÉ

Plateforme e-commerce CBD avec deux applications séparées :

1. **Boutique publique** - Accessible uniquement via Telegram Mini App (mobile)
2. **Panel admin** - Accessible uniquement depuis PC/desktop

## Structure du projet

```
plug-certifie/
├── boutique/          # App client Telegram Mini App
├── admin/             # Panel admin desktop
├── backend/           # API Express + TypeScript
└── shared/            # Types et utilitaires partagés
```

## Technologies

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Upstash Redis
- **Storage**: Vercel Blob / Cloudflare R2
- **Deployment**: Vercel

## Développement

```bash
# Installer les dépendances
npm install

# Démarrer tous les services en mode dev
npm run dev

# Démarrer individuellement
npm run dev:boutique
npm run dev:admin
npm run dev:backend

# Build production
npm run build

# Vérification TypeScript
npm run type-check
```

## Variables d'environnement

Voir les fichiers `.env.example` dans chaque sous-projet.

## Sécurité

- TypeScript strict mode activé
- Validation Zod sur toutes les entrées API
- Zero-trust architecture
- JWT pour l'authentification admin
- Rate limiting sur les endpoints sensibles
- CORS strict

