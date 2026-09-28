"""
Bot Vinted : trouve les vêtements vendus sous le prix du marché.

Lancement :  python main.py

Le programme suit 5 étapes, affichées dans le terminal au fur et à mesure.
Les réglages ci-dessous peuvent être modifiés librement.
"""

import json
from pathlib import Path

from detecteur_deals import deviner_categorie, marque_utilisable, trouver_deals
from scraper_vinted import (
    dernieres_annonces,
    lire_description,
    ouvrir_navigateur,
    ouvrir_vinted,
    pause,
    rechercher,
)

# ---------------------------------------------------------------- RÉGLAGES
NOMBRE_ANNONCES = 50      # Combien d'annonces récentes analyser (plus = plus de deals).
SEUIL_DEAL = 0.75         # "À acheter" si prix < médiane × 0.75 (= 25 % de marge minimum).
MIN_COMPARABLES = 5       # Nombre minimum d'annonces comparables pour faire confiance à la médiane.
PRIX_MARCHE_MINIMUM = 20  # On ignore les articles dont le prix du marché est sous 20 € (entrée de gamme).
MODE_INVISIBLE = False    # True = Chrome tourne sans fenêtre (mais Cloudflare bloque plus souvent).
FICHIER_RESULTATS = Path(__file__).parent / "deals.json"
# -------------------------------------------------------------------------


def main():
    print("Étape 1/5 : ouverture de Chrome et de Vinted...")
    navigateur = ouvrir_navigateur(MODE_INVISIBLE)
    try:
        ouvrir_vinted(navigateur)

        print(f"Étape 2/5 : récupération des {NOMBRE_ANNONCES} dernières annonces de vêtements...")
        annonces = dernieres_annonces(navigateur, NOMBRE_ANNONCES)
        # On devine le type de chaque vêtement (pull, jean, veste...) grâce au titre.
        for annonce in annonces:
            annonce["categorie"] = deviner_categorie(annonce["titre"], annonce["marque"])
        print(f"   {len(annonces)} annonces récupérées.")

        # Pour connaître le prix du marché d'un "pull Ralph Lauren", on cherche
        # sur Vinted d'autres pulls Ralph Lauren et on regarde leurs prix.
        groupes = sorted({
            (a["marque"], a["categorie"]) for a in annonces if marque_utilisable(a["marque"])
        })
        print(f"Étape 3/5 : recherche des prix du marché ({len(groupes)} marques/catégories)...")
        references = {}
        for numero, (marque, categorie) in enumerate(groupes, start=1):
            print(f"   [{numero}/{len(groupes)}] {marque} / {categorie}")
            recherche = marque if categorie == "autre" else f"{marque} {categorie}"
            references[(marque, categorie)] = rechercher(navigateur, recherche)
            pause()

        print("Étape 4/5 : comparaison des prix avec les médianes...")
        deals = trouver_deals(
            annonces,
            references,
            seuil=SEUIL_DEAL,
            min_comparables=MIN_COMPARABLES,
            prix_marche_minimum=PRIX_MARCHE_MINIMUM,
        )
        print(f"   {len(deals)} bonne(s) affaire(s) trouvée(s).")

        # On lit la description seulement pour les deals (inutile pour les
        # autres, et ça évite d'ouvrir 50 pages une par une).
        print("Étape 5/5 : lecture des descriptions des bonnes affaires...")
        for deal in deals:
            deal["description"] = lire_description(navigateur, deal["lien"])
            pause()
    finally:
        navigateur.quit()

    resultat = json.dumps(deals, ensure_ascii=False, indent=2)
    print("\n" + resultat)
    FICHIER_RESULTATS.write_text(resultat, encoding="utf-8")
    print(f"\nRésultats enregistrés dans {FICHIER_RESULTATS}")
    if len(deals) < 5:
        print("Peu de deals ? Augmente NOMBRE_ANNONCES (ex : 200) en haut de main.py.")


if __name__ == "__main__":
    main()
