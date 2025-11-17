# 🚀 Guide de déploiement sur Vercel

## 📋 Prérequis

1. **Compte Vercel** (gratuit) : https://vercel.com
2. **Compte Upstash Redis** (gratuit) : https://upstash.com
3. **Git** installé
4. **Repository GitHub/GitLab/Bitbucket**

## 🎯 Étapes rapides

### 1. Préparer le projet Git

```bash
# Si pas encore fait
git init
git add .
git commit -m "Initial commit"

# Créer un repo sur GitHub, puis :
git remote add origin https://github.com/votre-username/plug-certifie.git
git push -u origin main
```

### 2. Configurer Upstash Redis

1. Allez sur https://console.upstash.com
2. Créez une nouvelle base Redis
3. **Copiez l'URL REST et le Token** (vous en aurez besoin)

### 3. Déployer sur Vercel

#### Méthode 1 : Interface Web (Recommandé)

1. Allez sur **https://vercel.com/new**
2. **Importez votre repository** GitHub
3. Configurez le projet :
   - **Framework Preset** : `Other`
   - **Root Directory** : `./` (racine)
   - **Build Command** : `npm run build`
   - **Output Directory** : `boutique/dist`
   - **Install Command** : `npm install`

4. **Ajoutez les variables d'environnement** (cliquez sur "Environment Variables") :

```env
NODE_ENV=production
PORT=5000

# CORS - À mettre à jour après le premier déploiement avec votre URL Vercel
ALLOWED_ORIGINS=https://votre-projet.vercel.app

# JWT Secrets (générez des secrets aléatoires longs)
JWT_SECRET=changez-moi-par-un-secret-tres-long-et-aleatoire-minimum-32-caracteres
JWT_REFRESH_SECRET=changez-moi-par-un-autre-secret-tres-long-et-aleatoire-minimum-32-caracteres
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Upstash Redis (remplacez par vos valeurs)
UPSTASH_REDIS_REST_URL=https://votre-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=votre-token-upstash

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend API URL (pour boutique et admin)
VITE_API_URL=https://votre-projet.vercel.app/api
```

5. Cliquez sur **Deploy** 🚀

#### Méthode 2 : CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Suivre les instructions interactives
```

### 4. Mettre à jour les URLs après déploiement

Après le premier déploiement, Vercel vous donnera une URL (ex: `https://plug-certifie.vercel.app`).

**Mettez à jour les variables d'environnement** dans Vercel :
- `ALLOWED_ORIGINS` : Ajoutez votre URL Vercel
- `VITE_API_URL` : Mettez à jour avec votre URL

Puis **redéployez** (Vercel redéploie automatiquement à chaque push).

## 📍 URLs après déploiement

- **Boutique publique** : `https://votre-projet.vercel.app/`
- **Panel admin** : `https://votre-projet.vercel.app/admin/`
- **API** : `https://votre-projet.vercel.app/api/`

## 🔐 Générer des secrets JWT sécurisés

```bash
# Sur Linux/Mac
openssl rand -base64 32

# Sur Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Ou utilisez un générateur en ligne : https://randomkeygen.com/

## ✅ Vérification après déploiement

1. **Testez la boutique** : `https://votre-projet.vercel.app/`
2. **Testez l'API** : `https://votre-projet.vercel.app/api/products`
3. **Testez l'admin** : `https://votre-projet.vercel.app/admin/login`

## 🔄 Déploiements automatiques

Vercel déploie automatiquement à chaque **push sur `main`**.

## 🛠️ Commandes utiles

```bash
# Déployer en production
vercel --prod

# Voir les logs
vercel logs

# Lister les variables d'environnement
vercel env ls

# Ajouter une variable d'environnement
vercel env add NOM_VARIABLE
```

## ⚠️ Notes importantes

1. **Ne commitez JAMAIS** les fichiers `.env` ou les secrets
2. **CORS** : Mettez à jour `ALLOWED_ORIGINS` avec votre URL de production
3. **Redis** : Vérifiez que votre base Upstash est active
4. **Build** : Le premier build peut prendre 3-5 minutes

## 🐛 Dépannage

### Erreur de build
- Vérifiez les logs dans Vercel Dashboard
- Testez localement : `npm run build`

### Erreur CORS
- Vérifiez que `ALLOWED_ORIGINS` contient votre URL Vercel exacte
- Format : `https://votre-projet.vercel.app` (sans slash final)

### Erreur Redis
- Vérifiez les credentials Upstash dans les variables d'environnement
- Vérifiez que la base Redis est active dans Upstash

### Erreur 404 sur les routes
- Vérifiez que `vercel.json` est à la racine
- Vérifiez les routes dans Vercel Dashboard → Settings → Functions

## 📚 Documentation

- Vercel Docs : https://vercel.com/docs
- Upstash Redis : https://docs.upstash.com/redis
