# React Native + Expo + Maestro + Git Flow

© 2025 Alain Dubé  

Ce projet combine **React Native** et **Expo** pour le développement mobile multiplateforme, **Maestro** pour les tests E2E automatisés, et **Git Flow** pour une gestion de versions propre et structurée.

---

## Cloner le projet

```bash
git clone https://github.com/alainduberdl/reactNative.git
cd reactNative
```

---

## Installation des dépendances

Installe les dépendances nécessaires au projet :

```bash
npm install
```

> Assure-toi d’avoir installé **Node.js (>=18)** et **npm** avant cette étape.

---

## Configuration des hooks Git

Les hooks permettent d’automatiser certaines tests lors des push
Ils ne sont pas par défaut transférés dans le repo distant puisque ils sont dans le .git.
Il faut donc les copier :

```bash
copy hooks/. .git/hooks/.
```

> Si tu es sous **macOS** ou **Linux**, utilise :
> ```bash
> cp hooks/* .git/hooks/
> chmod +x .git/hooks/*
> ```

---

## Lancer les tests Maestro manuellement

Pour exécuter les tests E2E avec **Maestro** :

```bash
./run-maestro-tests.bat
```

> Les fichiers de configuration `.yaml` sont situés dans le dossier `.maestro/`.  
> Vérifie qu’un **émulateur Android** ou un **appareil physique** est actif avant d’exécuter les tests.

---

## Standardisation de nommage des branches

## Standardisation du nommage des branches

Afin d’assurer une cohérence dans la gestion du code source, les branches doivent suivre le format suivant :


### 📘 Types de branches

| Type       | Description                                  | Exemple                             |
|-------------|----------------------------------------------|-------------------------------------|
| **feature/** | Nouvelle fonctionnalité ou amélioration      | `feature/AjoutLogin-Issue102`       |
| **fix/**     | Correction d’un bogue identifié              | `fix/ErreurConnexion-Issue145`      |
| **hotfix/**  | Correction urgente en production             | `hotfix/CrashAuDemarrage-Issue210`  |
| **release/** | Préparation d’une version stable             | `release/v1.0.0`                    |
| **chore/**   | Tâche mineure, maintenance ou nettoyage      | `chore/MiseAJourDependances`        |

### 💡 Remarque
Inclure le numéro de l’**issue** si la modification provient d’un ticket ou d’une demande spécifique.


## Exemple de workflow Git Flow standard

### 1. Optenir la version courrante
```bash
git checkout main
git pull origin main
```

### 2. Démarrer une nouvelle fonctionnalité
```bash
git checkout -b core/correction_readme_francais_Issue_23
```

### 3. Travailler et valider les changements
```bash
git add .
git commit -m "Correction du francais dans le Read.me. Issue_23."
```

### 4. S'assurer que la branche est encore bonne (au cas ou il y a eu modifications)
```bash
git fetch origin
git rebase origin/main
```

### 5. Transférer la branche dans le REPO (genere un test avant)
```bash
git push --force-with-lease origin correction_readme_francais_Issue_23
```
Si on ne veux pas lancer le test, on peut utiliser : **.\push-sans-hook.bat**

### 6. Créer et finaliser une version stable
```bash
git checkout -b release/v1.0.0
```

```bash
git commit -am "Préparation de la version 1.0.0"
git push -u origin release/v1.0.0
git tag v1.0.0
git push origin v1.0.0

```



Après ne pas oublier de faire un PULL Request dans le GitHub pour faire approuver les changements

---

## Structure du projet

```
reactNative/
├── App.tsx                # Point d’entrée principal de l’application
├── components/            # Composants réutilisables
├── screens/               # Pages et vues principales
├── assets/                # Images, icônes, polices
├── maestro/               # Scénarios de test E2E (.yaml)
├── hooks/                 # Scripts Git personnalisés
├── package.json           # Dépendances et scripts npm
└── README.md              # Ce fichier
```

---

## Prérequis système

Avant de démarrer, assure-toi d’avoir installé :

- [Node.js 18+](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
  ```bash
  npm install -g expo-cli
  ```
- [Android Studio](https://developer.android.com/studio)
  - Crée un **émulateur Android** ou connecte un appareil physique.
- [Maestro CLI](https://maestro.mobile.dev/getting-started/installation)
  ```bash
  npm install -g @mobile-dev/maestro
  ```

---

## Commandes utiles

### Démarrer le projet avec Expo
```bash
npx expo start
```

### Lancer l’application sur un émulateur Android
```bash
npx expo run:android
```

### Lancer les tests Maestro
```bash
maestro test .maestro/main_flow.yaml
```

### Mettre à jour les dépendances
```bash
npm update
```

---

## Technologies principales

| Technologie | Rôle |
|--------------|------|
| **React Native** | Développement d’applications mobiles natives |
| **Expo** | Simplifie la configuration, le build et le déploiement |
| **Maestro** | Tests E2E pour automatiser les scénarios utilisateur |


---

## Bonnes pratiques

- Commits fréquents et clairs (`feat`, `fix`, `chore`, `test`, etc.)
- Toujours tester avant de fusionner 
- Utiliser des **branches courtes** et ciblées

---

## Auteur

**Alain Dubé**  

Projet pédagogique et démonstratif – Québec, 2025

