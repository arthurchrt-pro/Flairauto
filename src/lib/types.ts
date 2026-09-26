import { z } from "zod";

// Structure du rapport : l'IA doit la remplir exactement, et le site l'affiche.
export const schemaRapport = z.object({
  lisible: z
    .boolean()
    .describe("false si les éléments fournis ne sont pas une annonce de véhicule exploitable"),
  motifIllisible: z
    .string()
    .nullable()
    .describe("Si lisible est false : explication courte pour l'utilisateur. Sinon null."),
  vehicule: z.string().describe("Marque, modèle, motorisation, année et kilométrage, séparés par « · »"),
  prixAnnonce: z.number().nullable().describe("Prix demandé en euros, ou null s'il n'apparaît pas"),
  vigilance: z.object({
    niveau: z.enum(["faible", "moyen", "eleve"]),
    explication: z.string().describe("Une seule phrase"),
  }),
  signaux: z.array(
    z.object({
      titre: z.string(),
      detail: z.string(),
      gravite: z.enum(["info", "attention", "important"]),
    }),
  ),
  incoherences: z.array(z.string()),
  prixMarche: z
    .object({
      min: z.number(),
      max: z.number(),
      commentaire: z.string(),
    })
    .nullable(),
  verifications: z.array(z.object({ titre: z.string(), detail: z.string() })),
  questions: z.array(z.string()),
  essai: z.array(z.string()),
});

export type ResultatAnalyse = z.infer<typeof schemaRapport>;
export type Rapport = Omit<ResultatAnalyse, "lisible" | "motifIllisible">;
export type NiveauVigilance = Rapport["vigilance"]["niveau"];
export type Gravite = Rapport["signaux"][number]["gravite"];
