# Documentation de l'API de Creative Blogger

Menu :

- [@Me](#me)
  - [Me](#me-1)
  - [Update](#update)
  - [Delete](#delete)
- [Auth](#auth)
  - [Register](#register)
  - [Login](#login)
  - [Logout](#logout)

# @Me

Les routes ayant pour préfix `/@me` sont utilisées pour l'affichage du profil de l'utilisateur

## Me

**Route :** `/@me/me`

**Méthode :**`GET`

**Middleware :**`auth`

**Resultat :**`Email, pseudo, password`

## Update

**Route :** `/@me/update`

**Méthode :**`PUT`

**Middleware :**`auth`

**Contenu à envoyé :**`email, pseudo, password`

## Delete

**Route :** `/@me/delete`

**Méthode :**`DELETE`

**Middleware :**`auth`

**Limitations :**`Aucun admin (3) ne peut delete son compte`

---

# Auth

Les routes ayant pour préfix `/auth` sont utilisées pour le système de login / register / logout

## Register

**Route :** `/auth/register`

**Méthode :** `POST`

**Contenu à envoyé :** `email, username, password`

## Login

**Route :** `/auth/login`

**Méthode :** `POST`

**Contenu à envoyé :** `username, password`

## Logout

**Route :** `/auth/logout`

**Méthode :** `GET`

**Middleware :** `auth`
