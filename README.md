# 📺 PLAYTV - IPTV Streaming Platform

PLAYTV est une plateforme de streaming IPTV moderne, performante et sécurisée, conçue pour offrir une expérience premium sur tous les appareils (Mobile, Tablette, Desktop, TV).

## 🚀 Fonctionnalités Clés

- **Streaming HLS Fluide** : Lecteur vidéo optimisé avec support Hls.js et mode Picture-in-Picture.
- **Navigation TV-Ready** : Interface entièrement contrôlable à la télécommande ou au clavier avec focus haute visibilité.
- **Favoris Synchronisés** : Sauvegarde des chaînes préférées via Supabase (abonnés) ou LocalStorage (invités).
- **Recherche Globale** : Barre de recherche instantanée intégrée à la barre de navigation.
- **Admin Dashboard** : Gestion sécurisée des chaînes personnalisées.
- **Mode Éco** : Option d'économie de données (Max 360p) intégrée au lecteur.
- **Design Premium** : Interface moderne avec effets de flou (Glassmorphism) et animations fluides.

## 🛠️ Installation

1. 📥 **Cloner le projet**

2. 📦 **Installer les dépendances** : `npm install`

3. 🔑 **Configuration Environnement** : Renommer `.env.local.example` en `.env.local` et remplir les clés Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

1. 🗄️ **Base de données** : Exécuter le SQL suivant dans l'éditeur SQL de Supabase :

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  plan text default 'trial',
  subscription_expiry timestamp with time zone,
  data_saver boolean default false
);
```

1. ▶️ **Lancer le serveur** : `npm run dev`

### 🌍 URL Locale

Le serveur tourne sur [http://localhost:5050](http://localhost:5050)

---

Propulsé par Next.js & Supabase
