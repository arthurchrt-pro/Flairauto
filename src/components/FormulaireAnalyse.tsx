"use client";

import { useEffect, useRef, useState } from "react";
import RapportVue from "@/components/RapportVue";
import { compresserImage } from "@/lib/compression";
import type { Rapport } from "@/lib/types";

const MAX_CAPTURES = 6;
const LONGUEUR_MIN_TEXTE = 30;

const MESSAGES_ATTENTE = [
  "Lecture des captures d'écran…",
  "Recherche des signaux d'alerte…",
  "Comparaison des photos et du texte…",
  "Estimation du prix du marché…",
  "Préparation des questions à poser au vendeur…",
  "Rédaction du rapport…",
];

type Capture = { id: string; fichier: File; apercu: string };

export default function FormulaireAnalyse() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [etapeAttente, setEtapeAttente] = useState(0);
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const haut = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enCours) return;
    const minuteur = setInterval(
      () => setEtapeAttente((i) => Math.min(i + 1, MESSAGES_ATTENTE.length - 1)),
      12000,
    );
    return () => clearInterval(minuteur);
  }, [enCours]);

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

  function recommencer() {
    captures.forEach((c) => URL.revokeObjectURL(c.apercu));
    setCaptures([]);
    setTexte("");
    setRapport(null);
    setErreur("");
    haut.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (captures.length === 0 && texte.trim().length < LONGUEUR_MIN_TEXTE) {
      setErreur("Ajoutez au moins une capture d'écran ou collez le texte de l'annonce.");
      return;
    }
    setErreur("");
    setEtapeAttente(0);
    setEnCours(true);
    haut.current?.scrollIntoView({ behavior: "smooth" });

    try {
      const images = await Promise.all(captures.map((c) => compresserImage(c.fichier)));
      const reponse = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, texte }),
      });
      const donnees = await reponse.json().catch(() => null);
      if (!reponse.ok || !donnees?.rapport) {
        setErreur(donnees?.erreur ?? "L'analyse n'a pas pu aboutir. Réessayez dans un instant.");
      } else {
        setRapport(donnees.rapport);
      }
    } catch {
      setErreur("Impossible de joindre le serveur. Vérifiez votre connexion internet et réessayez.");
    } finally {
      setEnCours(false);
      haut.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  if (rapport) {
    return (
      <div ref={haut} className="scroll-mt-4">
        <h2 className="mb-4 text-2xl font-bold">Votre rapport</h2>
        <RapportVue rapport={rapport} />
        <button
          type="button"
          onClick={recommencer}
          className="mt-6 w-full rounded-xl bg-marque px-5 py-4 text-lg font-semibold text-white hover:bg-marque-fonce"
        >
          Analyser une autre annonce
        </button>
      </div>
    );
  }

  if (enCours) {
    return (
      <div ref={haut} className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-marque" />
        <p className="mt-5 text-lg font-semibold" aria-live="polite">
          {MESSAGES_ATTENTE[etapeAttente]}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          L&apos;analyse prend en général une à deux minutes. Gardez cette page ouverte.
        </p>
      </div>
    );
  }

  return (
    <div ref={haut} className="scroll-mt-4">
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

        <p className="text-center text-xs text-slate-500">
          Vos captures sont supprimées dès la fin de l&apos;analyse.
        </p>
      </form>
    </div>
  );
}
