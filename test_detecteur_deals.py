"""Tests de la détection des deals (sans Internet). Lancement : pytest"""

from detecteur_deals import deviner_categorie, marque_utilisable, trouver_deals
from scraper_vinted import nettoyer_annonce


def fabriquer(id, prix, titre="Pull col rond", marque="Ralph Lauren"):
    return {"id": id, "titre": titre, "prix": prix, "marque": marque,
            "taille": "M", "etat": "Très bon état", "lien": f"https://www.vinted.fr/items/{id}"}


def pulls_de_reference():
    # 5 pulls Ralph Lauren à 40, 45, 50, 55, 60 € : la médiane vaut 50 €.
    return {("Ralph Lauren", "pull"): [fabriquer(100 + i, p) for i, p in enumerate([40, 45, 50, 55, 60])]}


def test_categorie_devinee_depuis_le_titre():
    assert deviner_categorie("Veste en jean bleue") == "veste"
    assert deviner_categorie("Jean slim noir") == "jean"
    assert deviner_categorie("Sweat à capuche") == "sweat"
    assert deviner_categorie("Casquette") == "autre"


def test_la_marque_ne_fausse_pas_la_categorie():
    assert deviner_categorie("Jean Paul Gaultier robe", "Jean Paul Gaultier") == "robe"


def test_marques_ignorees():
    assert not marque_utilisable("Sans marque")
    assert not marque_utilisable("")
    assert marque_utilisable("Sandro")


def test_annonce_sous_75_pourcent_de_la_mediane_est_un_deal():
    annonce = fabriquer(1, 30) | {"categorie": "pull"}
    deals = trouver_deals([annonce], pulls_de_reference())
    assert len(deals) == 1
    assert deals[0]["verdict"] == "À acheter"
    assert deals[0]["prix_marche_estime"] == 50
    assert deals[0]["marge_pourcent"] == 40  # (50 - 30) / 50
    assert deals[0]["gain_potentiel"] == 20


def test_annonce_au_prix_du_marche_nest_pas_un_deal():
    annonce = fabriquer(1, 37.5) | {"categorie": "pull"}  # pile 75 % de 50 € : pas assez bas
    assert trouver_deals([annonce], pulls_de_reference()) == []


def test_pas_de_verdict_sans_assez_de_comparables():
    references = {("Ralph Lauren", "pull"): [fabriquer(100, 50), fabriquer(101, 60)]}
    annonce = fabriquer(1, 10) | {"categorie": "pull"}
    assert trouver_deals([annonce], references) == []


def test_les_comparables_doivent_avoir_la_meme_marque_et_categorie():
    references = pulls_de_reference()
    # La recherche Vinted peut ramener d'autres marques ou d'autres types de vêtements.
    references[("Ralph Lauren", "pull")] += [
        fabriquer(200, 500, marque="Moncler"),
        fabriquer(201, 500, titre="Manteau laine"),
    ]
    annonce = fabriquer(1, 30) | {"categorie": "pull"}
    assert trouver_deals([annonce], references)[0]["prix_marche_estime"] == 50


def test_entree_de_gamme_ignoree():
    references = {("Kiabi", "pull"): [fabriquer(100 + i, 8, marque="Kiabi") for i in range(5)]}
    annonce = fabriquer(1, 2, marque="Kiabi") | {"categorie": "pull"}
    assert trouver_deals([annonce], references) == []


def test_deals_tries_par_marge_decroissante():
    annonces = [fabriquer(1, 35) | {"categorie": "pull"}, fabriquer(2, 10) | {"categorie": "pull"}]
    deals = trouver_deals(annonces, pulls_de_reference())
    assert [d["marge_pourcent"] for d in deals] == [80, 30]


def test_nettoyer_annonce_accepte_les_deux_formats_de_prix():
    recent = nettoyer_annonce({"id": 1, "title": "Pull", "price": {"amount": "25.0", "currency_code": "EUR"},
                               "brand_title": "Sandro", "url": "https://www.vinted.fr/items/1-pull"})
    ancien = nettoyer_annonce({"id": 2, "title": "Pull", "price": "12.5", "brand_title": "Sandro",
                               "path": "/items/2-pull"})
    assert recent["prix"] == 25.0 and recent["marque"] == "Sandro"
    assert ancien["prix"] == 12.5 and ancien["lien"] == "https://www.vinted.fr/items/2-pull"
