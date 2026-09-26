import Link from "next/link";
import FormulaireAnalyse from "@/components/FormulaireAnalyse";

const contenuRapport = [
  "Un niveau de vigilance clair : faible, moyen ou élevé",
  "Les signaux d'alerte repérés dans l'annonce",
  "Les incohérences entre les photos et le texte",
  "Une estimation indicative du prix du marché",
  "Les vérifications à faire (HistoVec, contrôle technique, carte grise…)",
  "Les questions à poser au vendeur et les points à contrôler pendant l'essai",
];

const etapes = [
  { titre: "Faites des captures", texte: "Sur Leboncoin, La Centrale, Facebook Marketplace ou ailleurs." },
  { titre: "Envoyez-les ici", texte: "Ajoutez aussi le texte de l'annonce si vous l'avez copié." },
  { titre: "Lisez votre rapport", texte: "Vous savez quoi vérifier avant de vous déplacer ou de payer." },
];

export default function Accueil() {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <section className="pb-6 pt-8">
        <p className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
          1re analyse offerte, sans inscription
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Une voiture d&apos;occasion vous tente ? Vérifiez l&apos;annonce avant de vous déplacer.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Envoyez les captures d&apos;écran de l&apos;annonce. Flair Auto repère les signaux
          d&apos;alerte et vous dit quoi vérifier et quelles questions poser au vendeur.
        </p>
      </section>

      <section id="analyser" className="scroll-mt-4 pb-10">
        <FormulaireAnalyse />
      </section>

      <section className="pb-10">
        <h2 className="mb-4 text-2xl font-bold">Comment ça marche</h2>
        <ol className="space-y-3">
          {etapes.map((e, i) => (
            <li key={e.titre} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marque font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{e.titre}</p>
                <p className="text-slate-600">{e.texte}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="pb-10">
        <h2 className="mb-4 text-2xl font-bold">Ce que contient votre rapport</h2>
        <ul className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5">
          {contenuRapport.map((c) => (
            <li key={c} className="flex gap-3">
              <span className="text-marque" aria-hidden="true">✓</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <Link href="/exemple" className="mt-3 inline-block font-medium text-marque underline">
          Voir un exemple de rapport
        </Link>
      </section>

      <section className="pb-10">
        <h2 className="mb-4 text-2xl font-bold">Tarifs</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-semibold">Première analyse</p>
            <p className="mt-2 text-3xl font-bold">Gratuite</p>
            <p className="mt-2 text-sm text-slate-600">Sans inscription, rapport complet.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-semibold">À l&apos;unité</p>
            <p className="mt-2 text-3xl font-bold">2,99 €</p>
            <p className="mt-2 text-sm text-slate-600">Pour une annonce.</p>
          </div>
          <div className="rounded-2xl border-2 border-marque bg-white p-5">
            <p className="font-semibold">Pack de 5 analyses</p>
            <p className="mt-2 text-3xl font-bold">6,99 €</p>
            <p className="mt-2 text-sm text-slate-600">Soit 1,40 € l&apos;analyse.</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Paiement unique, sans abonnement. Vos analyses n&apos;expirent jamais.
        </p>
      </section>

      <section className="pb-12">
        <h2 className="mb-4 text-2xl font-bold">Bon à savoir</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-semibold">Pourquoi des captures d&apos;écran et pas un lien ?</p>
            <p className="mt-1 text-slate-600">
              Les sites d&apos;annonces interdisent la récupération automatique de leur contenu. Les
              captures d&apos;écran fonctionnent avec tous les sites, et elles sont supprimées dès la
              fin de l&apos;analyse.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-semibold">Le rapport est-il une garantie ?</p>
            <p className="mt-1 text-slate-600">
              Non. Flair Auto est une aide : il signale des points à vérifier, sans jamais affirmer
              qu&apos;un vendeur est malhonnête. Voir la voiture, l&apos;essayer et contrôler ses
              papiers reste indispensable.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
