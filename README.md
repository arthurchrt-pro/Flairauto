# Bot Vinted : détecteur de bonnes affaires

Ce petit programme parcourt les dernières annonces de vêtements sur Vinted et
repère celles vendues **au moins 25 % sous le prix du marché**, en visant le
moyen et haut de gamme.

Résultat : une liste JSON des annonces « À acheter », triée de la plus grosse
marge à la plus petite.

```json
[
  {
    "verdict": "À acheter",
    "titre": "Pull col rond Sézane",
    "prix": 37.3,
    "prix_marche_estime": 63.35,
    "marge_pourcent": 41,
    "gain_potentiel": 26.05,
    "marque": "Sézane",
    "categorie": "pull",
    "taille": "M",
    "etat": "Très bon état",
    "comparaison": "médiane de 40 annonces Sézane / pull",
    "lien": "https://www.vinted.fr/items/...",
    "description": "..."
  }
]
```

- `prix_marche_estime` : le prix « normal » de ce type d'article sur Vinted.
- `marge_pourcent` : de combien l'annonce est moins chère que le marché.
  Exemple : 30 € au lieu de 50 € → (50 − 30) / 50 = **40 %**.
- `gain_potentiel` : ce que tu peux espérer gagner en € si tu revends au prix du marché.

---

## Installation (à faire une seule fois)

1. **Installe Python** (version 3.10 ou plus récente) : https://www.python.org/downloads/
   Sur Windows, coche bien la case **« Add Python to PATH »** pendant l'installation.
2. **Installe Google Chrome** si tu ne l'as pas déjà : https://www.google.com/chrome/
3. **Ouvre un terminal** dans le dossier du projet
   (Mac : app « Terminal » ; Windows : clic droit dans le dossier → « Ouvrir dans le terminal »).
4. **Crée un environnement Python** (une « boîte » isolée pour les outils du projet) :

   ```bash
   python3 -m venv .venv
   ```

5. **Active-le** (à refaire à chaque nouveau terminal) :

   ```bash
   source .venv/bin/activate      # Mac / Linux
   .venv\Scripts\activate         # Windows
   ```

6. **Installe Selenium** (l'outil qui pilote Chrome) :

   ```bash
   pip install -r requirements.txt
   ```

## Lancer le bot

```bash
python main.py
```

Une fenêtre Chrome s'ouvre toute seule : c'est normal, c'est le bot qui navigue.
**Ne la ferme pas.** Si Vinted affiche une case « Je ne suis pas un robot »,
clique dessus : le bot attend.

Compte 1 à 3 minutes. Les résultats s'affichent dans le terminal et sont
enregistrés dans le fichier `deals.json`.

---

## Comment ça marche, étape par étape

Le code est réparti en 3 fichiers, chacun commenté ligne par ligne :

| Fichier | Rôle |
|---|---|
| `main.py` | Le chef d'orchestre : lance les étapes dans l'ordre, contient les réglages. |
| `scraper_vinted.py` | Tout ce qui parle à Vinted (ouvrir Chrome, récupérer les annonces). |
| `detecteur_deals.py` | Le calcul : prix du marché, marge, verdict « À acheter ». |

**Étape 1 : ouvrir Chrome et Vinted.**
Vinted est protégé par Cloudflare, un « videur » qui bloque les robots. Au lieu
d'un simple programme, on utilise Selenium pour piloter un vrai Chrome : il passe
la vérification comme un humain et reçoit ses cookies (un badge visiteur).

**Étape 2 : récupérer les 50 dernières annonces.**
Le bot interroge l'API de Vinted, c'est-à-dire l'adresse que le site utilise
lui-même pour afficher les annonces. Elle renvoie des données déjà bien rangées :
titre, prix, marque, taille, état, lien. Le bot devine ensuite le type de
vêtement (pull, jean, veste...) à partir des mots du titre.

**Étape 3 : trouver le prix du marché.**
Avec 50 annonces de toutes marques, on n'a souvent qu'un seul « pull Sandro » :
impossible de savoir si son prix est bon. Pour chaque couple marque + type
(ex : « Sandro pull »), le bot lance donc une recherche sur Vinted et récupère
jusqu'à 96 annonces comparables.

**Étape 4 : calculer la médiane et repérer les deals.**
La médiane, c'est le prix du milieu quand on range tous les prix dans l'ordre.
Elle n'est pas faussée par un prix délirant (contrairement à la moyenne).
Une annonce est « À acheter » si : `prix < médiane × 0,75`.
Le bot ignore :
- les annonces sans marque (impossible d'estimer leur valeur) ;
- les groupes avec moins de 5 annonces comparables (médiane pas fiable) ;
- les articles dont le prix du marché est sous 20 € (entrée de gamme).

**Étape 5 : lire les descriptions.**
Pour chaque deal, le bot ouvre l'annonce et lit sa description, pour que tu
puisses vérifier l'état de l'article (tache, trou, etc.).

## Réglages

En haut de `main.py` :

| Réglage | Par défaut | Effet |
|---|---|---|
| `NOMBRE_ANNONCES` | 50 | Annonces analysées. Mets 200 pour trouver plus de deals (c'est plus long). |
| `SEUIL_DEAL` | 0.75 | 0.75 = 25 % de marge minimum. Mets 0.6 pour 40 % minimum. |
| `MIN_COMPARABLES` | 5 | Nombre d'annonces comparables minimum pour faire confiance à la médiane. |
| `PRIX_MARCHE_MINIMUM` | 20 | Prix du marché minimum (en €) pour qu'un article nous intéresse. |
| `MODE_INVISIBLE` | False | True = pas de fenêtre Chrome (mais Cloudflare bloque plus souvent). |

## À savoir avant d'acheter

- **Le « prix du marché » est calculé sur des prix affichés**, pas sur des ventes
  conclues. Les annonces trop chères restent en ligne, donc la médiane peut être
  un peu optimiste. La vérification sur Leboncoin (prochaine étape) servira à ça.
- **Les frais ne sont pas comptés** : protection acheteur Vinted et livraison
  s'ajoutent au prix affiché.
- **Un prix très bas peut cacher un problème** : contrefaçon, défaut, mauvaise
  catégorie. Lis toujours la description et regarde les photos.
- **Vinted change parfois son site.** Si le bot plante, c'est souvent
  `scraper_vinted.py` qu'il faut adapter.
- Utilise le bot avec modération (il fait des pauses exprès entre chaque demande).

## Tests

Les calculs (médiane, marge, tri) sont testés sans connexion Internet :

```bash
pip install pytest
pytest
```

## Prochaine étape

Scraper Leboncoin, pour comparer les prix Vinted aux prix de revente sur Leboncoin.
