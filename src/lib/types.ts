export type NiveauVigilance = "faible" | "moyen" | "eleve";

export type Gravite = "info" | "attention" | "important";

// Structure du rapport renvoyé par l'analyse et affiché à l'utilisateur.
export type Rapport = {
  vehicule: string;
  prixAnnonce: number | null;
  vigilance: {
    niveau: NiveauVigilance;
    explication: string;
  };
  signaux: { titre: string; detail: string; gravite: Gravite }[];
  incoherences: string[];
  prixMarche: { min: number; max: number; commentaire: string } | null;
  verifications: { titre: string; detail: string }[];
  questions: string[];
  essai: string[];
};
