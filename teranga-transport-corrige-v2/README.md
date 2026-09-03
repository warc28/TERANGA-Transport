# Teranga Transport — Groupe 4

Application de gestion de transport en **HTML, CSS, JavaScript vanilla et XML**, sans Bootstrap, jQuery, React ni backend.

## Fonctionnalités corrigées
- Lecture initiale des données depuis `xml/*.xml` avec `XMLHttpRequest` + Promise.
- Persistance locale avec `localStorage` pour conserver cars, trajets, passagers et réservations entre les pages et après fermeture du navigateur.
- Trajet : sélection obligatoire d'un car disponible, capacité affichée, places disponibles recalculées automatiquement.
- Réservation : plan interactif, interdiction des doubles réservations, annulation qui libère la place.
- Passager : validation du numéro sénégalais 77/78 + 7 chiffres, avec ou sans espaces.
- Liste des passagers conservée et réutilisable dans les réservations.
- Statut Confirmée/Annulée visible dans le formulaire, le plan, les filtres, la liste et les statistiques.
- Statistiques : nombres de cars/trajets/passagers/réservations, taux de remplissage par car, réservations par statut, revenus mensuels et revenus par trajet.

## Lancement
1. Ouvrir le dossier dans VS Code.
2. Installer/activer **Live Server**.
3. Ouvrir `index.html` .

## Données
Les XML fournissent les données de départ. Les opérations CRUD sont ensuite conservées dans `localStorage` car un navigateur ne peut pas réécrire directement les fichiers XML servis par Live Server.

Le bouton **Réinitialiser XML** supprime les données locales et recharge les données initiales des fichiers XML.
