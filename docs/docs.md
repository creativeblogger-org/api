# Documentation de l'API de Creative Blogger

Menu :

- [@Me](#me)
  - [Image-Show](#show)
  - [Image-Upload](#upload)
  - [Image-Delete](#delete)
  - [Me](#me-1)
  - [Update](#update)
  - [Delete](#delete-1)
- [Auth](#auth)
  - [Register](#register)
  - [Login](#login)
  - [Logout](#logout)
- [Comments](#comments)
  - [Afficher](#afficher-les-commentaires)
  - [Update](#update-1)
  - [Delete](#delete-2)
- [Panel](#panel)
  - [Users-list](#users)
- [Posts](#post)
  - [List](#tous-les-posts)
  - [Slug](#un-post-en-particulier)
  - [Créer](#post)
  - [Update](#update-2)
  - [Delete](#delete-3)
  - [Image-Upload](#upload-image)
  - [Post-Comment](#post-comment)
- [Social](#social)
  - [Mastodon](#mastodon)
- [Users](#users)
  - [List](#list)
  - [Username](#utilisateur-en-particulier)
  - [Post-of-user](#les-posts-dun-utilisateur)
  - [Delete](#delete-4)
  - [Upgrade](#upgrade)
- [Verif](#verification)
  - [Grade](#grade)
  - [Email](#email)
  - [Username](#username)
  - [Slug](#slug)

# @Me

Les routes ayant pour préfix `/@me` sont utilisées pour l'affichage du profil de l'utilisateur

## Image de profil :

### Show

**Route :** `/@me/image/:UserID`

**Méthode :**`GET`

**Utilité :** Renvoie l'image de profil d'un utilisateur via son ID

### Upload

**Route :** `/@me/upload`

**Méthode :**`POST`

**Middleware :**`auth`

**Contenu à envoyé :**`fichier jpg, jpeg ou png`

**Utilité :** Upload l'image de profil de l'utilisateur au chemin `https://api.creativeblogger.org/public/users/<ID>.png`

### Delete

**Route :** `/@me/delete`

**Méthode :**`DELETE`

**Middleware :**`auth`

**Utilité :** Supprime l'image de profil de l'utilisateur

## Utilisateur

### Me

**Route :** `/@me/me`

**Méthode :**`GET`

**Middleware :**`auth`

**Resultat :**`Modèle "User"`

**Utilité :** Permet de renvoyer les informations personnelles de l'utilisateur

### Update

**Route :** `/@me/update`

**Méthode :**`PUT`

**Middleware :**`auth`

**Contenu à envoyé :**`email, pseudo, password`

**Utilité :** Permet de modifier les informations personnelles d'un utilisateur

### Delete

**Route :** `/@me/delete`

**Méthode :**`DELETE`

**Middleware :**`auth`

**Limitations :**`Aucun admin (3) ne peut delete son compte`

**Utilité :** Supprime le compte

---

# Auth

Les routes ayant pour préfix `/auth` sont utilisées pour le système de login / register / logout

### Register

**Route :** `/auth/register`

**Méthode :** `POST`

**Contenu à envoyé :** `email, username, password, birthdate`

**Utilité :** Créer un comte

### Login

**Route :** `/auth/login`

**Méthode :** `POST`

**Contenu à envoyé :** `username || email, password`

**Utilité :** Permet de se connecter à son compte

### Logout

**Route :** `/auth/logout`

**Méthode :** `GET`

**Middleware :** `auth`

**Utilité :** Permet de se déconnecter

---

# Comments

Les routes ayant pour préfix `/comments` sont utilisées afin d'afficher, envoyer, modifier et supprimer des commentaires

## Afficher les commentaires

### /

**Route :** `/comments/:PostID`

**Méthode :** `GET`

**Utilité :** Renvoie les commentaires d'un post via son ID

## Modifier / Supprimer un commentaire

### Update

**Route :** `comments/:CommentID`

**Méthode :** `PUT`

**Middleware :** `auth`

**Contenu à envoyé :** `content`

**Utilité :** Permet de modifier un commentaire via son ID

### Delete

**Route :** `comments/:CommentID`

**Méthode :** `DELETE`

**Middleware :** `auth`

**Utilité :** Permet de supprimer un commentaire via son ID

---

# Panel

Les routes ayant pour préfix `/panel` sont utilisées par les administrateurs afin de gérer la plate-forme. Elles demandent une permission de 3.

### Users

**Route :** `/`

**Méthode :** `GET`

**Middleware :** `auth`

**Utilité :** Permet d'avoir une liste d'utilisateurs

---

# Posts

Les routes ayant pour préfix `/posts` sont utilisées pour récupérer, modifier, supprimer des posts et envoyés des commentaires

## Récupérer les posts

### Tous les posts

**Route :** `/`

**Méthode :** `GET`

**Paramètres :** - `limit=20` => Limiter le renvoie de posts à un nombre entier - `page=0` => Passer d'une page de posts à une autre - `q=hello` => Chercher un article par son titre - `tag=tech` => Cherche les articles par tags - `user=ID` => Permet de chercher les articles par l'ID de l'utilisateur

**Restriction :** Renvoie les posts adaptés à l'âge de l'utilisateur (si il n'y a pas d'utilisateurs, alors ne renvoie que les posts dont l'age_required = 0)

**Utilité :** Permet d'avoir une liste des posts

### Un post en particulier

**Route :** `/:slug`

**Méthode :** `GET`

**Utilité :** Permet d'avoir accès à un post en particulier avec son contenu.

## Post, Update, Delete, Comment

### Post

**Route :** `/`

**Méthode :** `POST`

**Restrictions :** `permission` supérieure ou égal à 1

**Middleware :** `auth`

**Contenu à envoyé :** `title, description, tags, image, description, age_required, content`

**Utilité :** Permet de créer un post

### Update

**Route :** `/:slug`

**Méthode :** `PUT`

**Restrictions :** Doit être l'auteur du post ou modérateur / administrateur

**Middleware :** `auth`

**Contenu à envoyé :** `title, description, tags, image, description, content`

**Utilité :** Permet de modifier un post

### Delete

**Route :** `/:slug`

**Méthode :** `DELETE`

**Restrictions :** Doit être l'auteur du post ou modérateur / administrateur

**Middleware :** `auth`

**Utilité :** Permet de supprimer un post

### Upload (image)

**Route :** `/upload/`

**Méthode :** `POST`

**Middleware :** `auth`

**Contenu à envoyé :** `image`

**Utilité :** Permet d'upload une image pour l'image de preview du post à l'adresse `https://api.creativeblogger.org/public/posts/nom-du-fichier.extension`

### Post comment

**Route :** `:slug/comment`

**Méthode :** `POST`

**Middleware :** `auth`

**Contenu à envoyé :** `content`

**Utilité :** Permet de poster un commentaire sur un post précis

---

# Social

Les routes ayant pour préfix `/social` sont utilisées par les équipes administratives et marketing pour gérer les réseaux sociaux de Creative Blogger, elles ne sont pas accessibles au grand public

### Mastodon

**Route :** `/mastodon`

**Méthode :** `POST`

**Restrictions :** Admin only

**Middleware :** `auth`

**Contenu à envoyé :** `title, content, tags`

**Utilité :** Permet d'envoyer un message sur Mastodon via le site

# Users

Les routes ayant pour préfix `/users` sont utilisées sur le site pour rendre certaines informations et par les administrateurs pour supprimer, rétrograder des membres

## Utilisateurs

### List

**Route :** `/`

**Méthode :** `GET`

**Restrictions :** Admin only

**Middleware :** `auth`

**Utilité :** Permet d'avoir une liste d'utilisateurs

### Utilisateur en particulier

**Route :** `/:username`

**Méthode :** `GET`

**Résultat :** `id, username, created_at, updated_at, permissions, pp`

**Utilité :** Permet de visualiser les informations non-sensibles d'un utilisateur

### Les posts d'un utilisateur

**Route :** `:UserID/posts`

**Méthode :** `GET`

**Utilité :** Permet d'avoir accès aux posts d'un utilisateur

### Delete

**Route :** `:username`

**Méthode :** `DELETE`

**Middleware :** `auth`

**Utilité :** Permet de supprimer un utilisateur

### Upgrade

**Route :** `upgrade/:username`

**Méthode :** `PUT`

**Restrictions :** Admin only

**Middleware :** `auth`

**Utilité :** Permet de faire monter en grade un utilisateur

---

# Verification

Les routes ayant le préfix `/verif` sont utilisées pour vérifier le grade d'un utilisateur, l'existance des adresses-mail et usernames

### Grade

**Route :** `/writer`

**Méthode :** `GET`

**Middleware :** `auth`

**Utilité :** Permet de savoir si l'utilisateur authentifié est rédacteur ou pas.

### Email

**Route :** `/email/:EMAIL`

**Méthode :** `GET`

**Utilité :** Permet de savoir si une adresse email est déjà prise

### Username

**Route :** `username/:USERNAME`

**Méthode :** `GET`

**Utilité :** Permet de savoir si un nom d'utilisateur est déjà pris

### Slug

**Route :** `post/SLUG`

**Méthode :** `GET`

**Utilité :** Permet de savoir si un slug de post est déjà pris
