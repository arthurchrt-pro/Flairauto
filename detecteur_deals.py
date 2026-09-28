"""
Repérer les bonnes affaires.

L'idée :

- Pour savoir si un prix est bas, il faut le comparer au "prix du marché".

- Le prix du marché d'un article = la MÉDIANE des prix des annonces de la
  même marque ET du même type de vêtement (ex : les pulls Ralph Lauren).
  On ne compare pas un t-shirt à un manteau !

- La médiane, c'est le prix "du milieu" : on range tous les prix du moins
  cher au plus cher et on prend celui du milieu. Contrairement à la moyenne,
  un prix délirant (1 € ou 900 €) ne la fausse pas.

- Une annonce est "À acheter" si son prix est sous 75 % de la médiane,
  c'est-à-dire au moins 25 % moins chère que le marché.
"""

from statistics import median

# Pour deviner le type de vêtement, on cherche ces mots dans le titre.
# L'ordre compte : "veste en jean" est rangé dans "veste" car "veste" est
# testé avant "jean". Le nom de la catégorie sert aussi de mot de recherche.
CATEGORIES = [
    ("manteau", ["manteau", "trench", "parka", "caban"]),
    ("doudoune", ["doudoune"]),
    ("veste", ["veste", "blouson", "blazer", "perfecto", "bomber", "coupe-vent"]),
    ("robe", ["robe"]),
    ("combinaison", ["combinaison", "salopette"]),
    ("jupe", ["jupe"]),
    ("short", ["short", "bermuda"]),
    ("jean", ["jean"]),
    ("pantalon", ["pantalon", "chino", "jogging", "legging", "cargo"]),
    ("sweat", ["sweat", "hoodie", "capuche"]),
    ("pull", ["pull", "gilet", "cardigan", "maille"]),
    ("chemise", ["chemise", "blouse"]),
    ("t-shirt", ["t-shirt", "tee-shirt", "tshirt", "débardeur", "top"]),
    ("polo", ["polo"]),
]

# Annonces sans vraie marque : impossible d'estimer un prix du marché.
MARQUES_IGNOREES = {"", "sans marque", "autre", "fait main", "vintage"}


def marque_utilisable(marque):
    return marque.strip().lower() not in MARQUES_IGNOREES


def deviner_categorie(titre, marque=""):
    """Devine le type de vêtement à partir du titre : "pull", "jean", ... ou "autre"."""
    texte = titre.lower()
    # On retire la marque du titre : sinon "Jean Paul Gaultier" serait un "jean"
    # et "Polo Ralph Lauren" un "polo".
    if marque:
        texte = texte.replace(marque.lower(), " ")
    for categorie, mots in CATEGORIES:
        if any(mot in texte for mot in mots):
            return categorie
    return "autre"


def trouver_deals(annonces, references, seuil=0.75, min_comparables=5, prix_marche_minimum=20):
    """
    Compare chaque annonce aux annonces de référence de sa marque + catégorie.

    - `annonces` : les annonces à juger (chacune a déjà une "categorie").
    - `references` : {(marque, categorie): [annonces comparables trouvées sur Vinted]}.
    - `seuil` : 0.75 = il faut être sous 75 % du prix du marché.
    - `min_comparables` : en dessous de ce nombre d'annonces comparables,
      la médiane n'est pas fiable, donc on ne juge pas.
    - `prix_marche_minimum` : on ignore les articles dont le prix du marché
      est trop bas (entrée de gamme) : on vise le moyen/haut de gamme.

    Renvoie les bonnes affaires, de la meilleure marge à la moins bonne.
    """
    deals = []
    for annonce in annonces:
        marque, categorie = annonce["marque"], annonce["categorie"]

        # On garde seulement les vraies comparaisons : même marque, même
        # type de vêtement, et pas l'annonce elle-même.
        comparables = [
            r for r in references.get((marque, categorie), [])
            if r["id"] != annonce["id"]
            and r["marque"].lower() == marque.lower()
            and deviner_categorie(r["titre"], r["marque"]) == categorie
        ]
        if len(comparables) < min_comparables:
            continue  # Pas assez d'annonces pour connaître le prix du marché.

        prix_marche = median(r["prix"] for r in comparables)
        if prix_marche < prix_marche_minimum:
            continue  # Article d'entrée de gamme : pas notre cible.
        if annonce["prix"] >= prix_marche * seuil:
            continue  # Pas assez en dessous du marché.

        deals.append({
            "verdict": "À acheter",
            "titre": annonce["titre"],
            "prix": annonce["prix"],
            "prix_marche_estime": round(prix_marche, 2),
            "marge_pourcent": round((prix_marche - annonce["prix"]) / prix_marche * 100),
            "gain_potentiel": round(prix_marche - annonce["prix"], 2),
            "marque": marque,
            "categorie": categorie,
            "taille": annonce["taille"],
            "etat": annonce["etat"],
            "comparaison": f"médiane de {len(comparables)} annonces {marque} / {categorie}",
            "lien": annonce["lien"],
        })

    deals.sort(key=lambda deal: deal["marge_pourcent"], reverse=True)
    return deals
