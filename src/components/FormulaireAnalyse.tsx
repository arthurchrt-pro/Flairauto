"use client";

import { useState } from "react";
import Link from "next/link";

const MAX_CAPTURES = 6;
const LONGUEUR_MIN_TEXTE = 30;

type Capture = { id: string; fichier: File; apercu: string };

export default function FormulaireAnalyse() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoye, setEnvoye] = useState(false);

  function ajouterCaptures(fichiers: FileList | null) {
    if (!fichiers) return;
    setErreur("");
    const images = Array.from(fichiers).filter((f) => f.type.startsWith("image/"));
    const place = MAX_CAPTURES - captures.length;
    if (images.length > place) {
      setErreur(`Vous pouvez envoyer ${MAX_CAPTURES} captures au maximum.`);
    }
    const nouvelles = images.slice(0, place).map((fichier) => ({
      id: crypto.randomUUID(),
      fichier,
      apercu: URL.createObjectURL(fichier),
    }));
    setCaptures((c) => [...c, ...nouvelles]);
  }

  function retirerCapture(id: string) {
    setCaptures((c) => {
      const capture = c.find((x) => x.id === id);
      if (capture) URL.revokeObjectURL(capture.apercu);
      return c.filter((x) => x.id !== id);
    });
  }

  function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (captures.length === 0 && texte.trim().length < LONGUEUR_MIN_TEXTE) {
      setErreur("Ajoutez au moins une capture d'écran ou collez le texte de l'annonce.");
      return;
    }
    setErreur("");
    // L'analyse par l'IA sera branchée à l'étape suivante.
    setEnvoye(true);
  }

  return (
    <form onSubmit={envoyer} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="mb-1 font-semibold">1. Vos captures d&apos;écran de l&apos;annonce</p>
        <p className="mb-3 text-sm text-slate-500">
          Photos, prix, description, informations du vendeur… Jusqu&apos;à {MAX_CAPTURES} captures.
        </p>

        {captures.length > 0 && (
          <ul className="mb-3 grid grid-cols-3 gap-2">
            {captures.map((c) => (
              <li key={c.id} className="relative aspect-[9/16] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local d'un fichier choisi */}
                <img src={c.apercu} alt="Capture de l'annonce" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => retirerCapture(c.id)}
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
                  aria-label="Retirer cette capture"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {captures.length < MAX_CAPTURES && (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-center hover:border-marque hover:bg-blue-50">
            <span className="text-3xl" aria-hidden="true">📷</span>
            <span className="mt-1 font-medium text-marque">
              {captures.length === 0 ? "Ajouter des captures d'écran" : "Ajouter d'autres captures"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                ajouterCaptures(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      <div>
        <label htmlFor="texte" className="mb-1 block font-semibold">
          2. Le texte de l&apos;annonce <span className="font-normal text-slate-500">(facultatif)</span>
        </label>
        <textarea
          id="texte"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          rows={5}
          placeholder="Collez ici la description de l'annonce, si vous l'avez copiée."
          className="w-full rounded-xl border border-slate-300 p-3 text-base focus:border-marque focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {erreur && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erreur}</p>}

      <button
        type="submit"
        className="w-full rounded-xl bg-marque px-5 py-4 text-lg font-semibold text-white hover:bg-marque-fonce"
      >
        Analyser l&apos;annonce
      </button>

      {envoye && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-medium">Version de démonstration</p>
          <p className="mt-1">
            L&apos;analyse par l&apos;IA arrive très bientôt. En attendant,{" "}
            <Link href="/exemple" className="font-medium underline">
              découvrez un exemple de rapport
            </Link>
            .
          </p>
        </div>
      )}

      <p className="text-center text-xs text-slate-500">
        Vos captures sont supprimées dès la fin de l&apos;analyse.
      </p>
    </form>
  );
}
