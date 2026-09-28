"""
Récupérer les annonces sur Vinted avec Selenium.

Comment ça marche, en bref :

1. On ouvre un vrai navigateur Chrome, piloté par Selenium.
   Vinted est protégé par Cloudflare, qui bloque les programmes "robots".
   Un vrai navigateur passe cette vérification comme le ferait un humain.

2. On visite la page d'accueil de Vinted. Le site nous donne alors des
   cookies (une sorte de "badge visiteur") sans lesquels il refuse de répondre.

3. On demande les annonces à l'API de Vinted : c'est l'adresse que le site
   utilise lui-même pour afficher ses listes d'annonces. Elle renvoie des
   données déjà bien rangées (du JSON) au lieu d'une page web à décortiquer.
   La demande part depuis l'intérieur du navigateur, avec son badge visiteur.
"""

import json
import random
import time
from urllib.parse import urlencode

from selenium import webdriver
from selenium.webdriver.common.by import By

VINTED_URL = "https://www.vinted.fr"

# Sur Vinted, chaque rayon a un numéro (un "catalogue").
# 4 = Femmes > Vêtements, 2050 = Hommes > Vêtements.
CATALOGUES_VETEMENTS = "4,2050"

# Vinted renvoie au maximum 96 annonces par page.
ANNONCES_PAR_PAGE = 96

# Petit programme JavaScript exécuté DANS le navigateur : il appelle l'API
# de Vinted (avec les cookies du navigateur) et renvoie la réponse à Python.
SCRIPT_APPEL_API = """
const adresse = arguments[0];
const terminer = arguments[arguments.length - 1];
fetch(adresse, {credentials: "include", headers: {"Accept": "application/json"}})
    .then(async (reponse) => terminer({statut: reponse.status, contenu: await reponse.text()}))
    .catch((erreur) => terminer({statut: 0, contenu: String(erreur)}));
"""


def pause():
    """Attend 1 à 2,5 secondes, pour ne pas bombarder Vinted de demandes."""
    time.sleep(random.uniform(1, 2.5))


def ouvrir_navigateur(invisible=False):
    """Lance Chrome. Selenium télécharge tout seul le "pilote" de Chrome."""
    options = webdriver.ChromeOptions()
    if invisible:
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1280,900")
    options.add_argument("--lang=fr-FR")
    # Ces 3 réglages cachent le petit drapeau "je suis piloté par un robot"
    # que Chrome affiche normalement quand Selenium le contrôle.
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    navigateur = webdriver.Chrome(options=options)

    # En mode invisible, Chrome se présente comme "HeadlessChrome" :
    # Cloudflare le repère tout de suite, donc on retire ce mot.
    identite = navigateur.execute_script("return navigator.userAgent")
    navigateur.execute_cdp_cmd(
        "Network.setUserAgentOverride",
        {"userAgent": identite.replace("HeadlessChrome", "Chrome")},
    )
    navigateur.set_script_timeout(30)
    return navigateur


def attendre_fin_verification(navigateur, secondes_max=60):
    """Attend que la page "Vérification en cours..." de Cloudflare disparaisse."""
    message_affiche = False
    for _ in range(secondes_max):
        titre = navigateur.title.lower()
        if "just a moment" not in titre and "un instant" not in titre:
            return
        if not message_affiche:
            print("   Cloudflare vérifie le navigateur... Si une case")
            print("   'Je ne suis pas un robot' apparaît dans Chrome, clique dessus.")
            message_affiche = True
        time.sleep(1)


def ouvrir_vinted(navigateur):
    """Visite la page d'accueil pour passer Cloudflare et récupérer les cookies."""
    navigateur.get(VINTED_URL)
    attendre_fin_verification(navigateur)


def appeler_api(navigateur, parametres):
    """Demande une liste d'annonces à l'API de Vinted et renvoie la réponse."""
    adresse = VINTED_URL + "/api/v2/catalog/items?" + urlencode(parametres)

    for essai in range(1, 4):
        reponse = navigateur.execute_async_script(SCRIPT_APPEL_API, adresse)
        if reponse["statut"] == 200:
            try:
                return json.loads(reponse["contenu"])
            except ValueError:
                pass  # Réponse illisible (souvent une page anti-robot) : on réessaie.

        # 401/403 : Vinted ne nous reconnaît plus. 429 : on va trop vite.
        # Dans tous les cas : on souffle, on repasse par l'accueil, on réessaie.
        print(f"   Vinted a répondu {reponse['statut']} (essai {essai}/3), nouvel essai...")
        time.sleep(5 * essai)
        ouvrir_vinted(navigateur)

    raise RuntimeError(
        "Vinted refuse de répondre. Essaie de relancer dans quelques minutes, "
        "en laissant la fenêtre Chrome visible (MODE_INVISIBLE = False dans main.py)."
    )


def nettoyer_annonce(brute):
    """Garde seulement les infos utiles d'une annonce, avec des noms en français."""
    prix = brute.get("price")
    if isinstance(prix, dict):  # Format récent : {"amount": "25.0", "currency_code": "EUR"}
        prix = prix.get("amount")
    try:
        prix = float(prix)
    except (TypeError, ValueError):
        prix = 0.0

    lien = brute.get("url") or brute.get("path") or f"/items/{brute.get('id')}"
    if lien.startswith("/"):
        lien = VINTED_URL + lien

    return {
        "id": brute.get("id"),
        "titre": (brute.get("title") or "").strip(),
        "prix": prix,
        "marque": (brute.get("brand_title") or "").strip(),
        "taille": brute.get("size_title") or "",
        "etat": brute.get("status") or "",
        "lien": lien,
    }


def dernieres_annonces(navigateur, nombre=50):
    """Récupère les `nombre` annonces de vêtements les plus récentes."""
    annonces = {}  # rangées par numéro d'annonce, pour éviter les doublons
    page = 1
    while len(annonces) < nombre:
        donnees = appeler_api(navigateur, {
            "page": page,
            "per_page": ANNONCES_PAR_PAGE,
            "order": "newest_first",
            "catalog_ids": CATALOGUES_VETEMENTS,
        })
        deja_vues = len(annonces)
        for item in donnees.get("items", []):
            annonce = nettoyer_annonce(item)
            if annonce["prix"] > 0:
                annonces[annonce["id"]] = annonce
        if len(annonces) == deja_vues:
            break  # Plus rien de nouveau : on s'arrête.
        page += 1
        pause()
    return list(annonces.values())[:nombre]


def rechercher(navigateur, texte):
    """Cherche `texte` dans les vêtements (ex : "Ralph Lauren pull"), 96 annonces max."""
    donnees = appeler_api(navigateur, {
        "page": 1,
        "per_page": ANNONCES_PAR_PAGE,
        "search_text": texte,
        "catalog_ids": CATALOGUES_VETEMENTS,
    })
    annonces = [nettoyer_annonce(item) for item in donnees.get("items", [])]
    return [a for a in annonces if a["prix"] > 0]


def lire_description(navigateur, lien):
    """Ouvre la page d'une annonce et lit sa description (texte vide si introuvable)."""
    navigateur.get(lien)
    attendre_fin_verification(navigateur)

    # Plan A : le bloc "description" affiché sur la page.
    for selecteur in ['[itemprop="description"]', '[data-testid="item-description"]']:
        for element in navigateur.find_elements(By.CSS_SELECTOR, selecteur):
            if element.text.strip():
                return element.text.strip()

    # Plan B : le résumé caché dans l'en-tête de la page (balises "meta").
    for selecteur in ['meta[property="og:description"]', 'meta[name="description"]']:
        for element in navigateur.find_elements(By.CSS_SELECTOR, selecteur):
            contenu = (element.get_attribute("content") or "").strip()
            if contenu:
                return contenu
    return ""
