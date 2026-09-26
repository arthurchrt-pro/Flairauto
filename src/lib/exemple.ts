import type { Rapport } from "./types";

// Rapport fictif affiché sur la page « Exemple de rapport ».
export const rapportExemple: Rapport = {
  vehicule: "Peugeot 208 1.2 PureTech 110 Allure · 2019 · 45 000 km",
  prixAnnonce: 6500,
  vigilance: {
    niveau: "eleve",
    explication:
      "Prix très inférieur au marché, vendeur à l'étranger et acompte demandé avant toute visite : plusieurs signaux d'alerte se cumulent.",
  },
  signaux: [
    {
      titre: "Prix anormalement bas",
      detail:
        "6 500 € pour ce modèle, cette année et ce kilométrage, c'est environ 40 % sous les prix habituellement constatés.",
      gravite: "important",
    },
    {
      titre: "Acompte demandé avant la visite",
      detail:
        "Le vendeur propose une livraison par transporteur après le versement d'un acompte de 500 €. Ne payez jamais avant d'avoir vu et essayé le véhicule.",
      gravite: "important",
    },
    {
      titre: "Vendeur à l'étranger",
      detail:
        "Le vendeur indique être « muté en Espagne ». Cela rend la visite et la vérification des papiers difficiles.",
      gravite: "attention",
    },
    {
      titre: "Plaque d'immatriculation masquée",
      detail:
        "La plaque est floutée sur toutes les photos. C'est courant, mais demandez-la avant de vous déplacer pour consulter l'historique.",
      gravite: "info",
    },
    {
      titre: "Contrôle technique non mentionné",
      detail:
        "Pour une voiture de plus de 4 ans, le vendeur doit fournir un contrôle technique de moins de 6 mois.",
      gravite: "attention",
    },
  ],
  incoherences: [
    "Le compteur visible sur la 4e photo semble afficher 78 450 km, alors que l'annonce indique 45 000 km.",
    "Les jantes et les logos visibles sur les photos correspondent plutôt à une finition GT Line qu'à la finition Allure annoncée.",
    "Les photos semblent prises à des endroits et à des saisons différents (arbres en fleurs, puis sol enneigé).",
  ],
  prixMarche: {
    min: 10500,
    max: 13000,
    commentaire:
      "Fourchette indicative pour une 208 PureTech 110 de 2019 autour de 45 000 km en bon état, vendue entre particuliers.",
  },
  verifications: [
    {
      titre: "Rapport HistoVec",
      detail:
        "Demandez au vendeur le lien de son rapport HistoVec (site officiel et gratuit de l'État). Vous y verrez les propriétaires successifs, les sinistres déclarés et l'historique des contrôles techniques.",
    },
    {
      titre: "Contrôle technique de moins de 6 mois",
      detail:
        "Demandez le procès-verbal complet et lisez la liste des défaillances, pas seulement le résultat.",
    },
    {
      titre: "Carte grise au nom du vendeur",
      detail:
        "Le nom sur la carte grise doit correspondre à la pièce d'identité du vendeur. Vérifiez aussi que le numéro VIN est le même sur la carte grise et sur la voiture (bas du pare-brise).",
    },
    {
      titre: "Certificat de non-gage",
      detail:
        "Le certificat de situation administrative, inclus dans le rapport HistoVec, confirme que la voiture n'est ni gagée ni volée.",
    },
    {
      titre: "Carnet d'entretien et factures",
      detail:
        "Ils permettent de confirmer le kilométrage et le remplacement de la courroie de distribution.",
    },
  ],
  questions: [
    "Pouvez-vous m'envoyer le lien de votre rapport HistoVec ?",
    "Sur la 4e photo, le compteur semble afficher 78 450 km : pouvez-vous m'expliquer la différence avec les 45 000 km annoncés ?",
    "La carte grise est-elle à votre nom ?",
    "Est-il possible de voir la voiture et de l'essayer avant tout paiement ?",
    "À quelle date la courroie de distribution a-t-elle été remplacée ? Avez-vous la facture ?",
    "Le contrôle technique date-t-il de moins de 6 mois ? Pouvez-vous m'envoyer le procès-verbal ?",
    "S'agit-il d'une finition Allure ou GT Line ?",
  ],
  essai: [
    "Démarrez le moteur à froid : écoutez les bruits anormaux et regardez s'il y a de la fumée à l'échappement.",
    "Vérifiez le niveau d'huile avec la jauge : une consommation d'huile excessive est connue sur ce moteur.",
    "Assurez-vous qu'aucun voyant ne reste allumé au tableau de bord, notamment le voyant moteur ou « antipollution ».",
    "Testez l'embrayage en côte : il ne doit pas patiner ni accrocher trop haut.",
    "Passez toutes les vitesses, y compris la marche arrière, sans craquement.",
    "Vérifiez la climatisation, l'écran tactile et les vitres électriques.",
    "Regardez l'usure des pneus : une usure irrégulière peut trahir un problème de géométrie ou un choc.",
  ],
};
