import type { Gravite, NiveauVigilance, Rapport } from "@/lib/types";

const styleVigilance: Record<NiveauVigilance, { libelle: string; carte: string; pastille: string }> = {
  faible: {
    libelle: "Vigilance faible",
    carte: "border-emerald-200 bg-emerald-50",
    pastille: "bg-emerald-600",
  },
  moyen: {
    libelle: "Vigilance moyenne",
    carte: "border-amber-200 bg-amber-50",
    pastille: "bg-amber-500",
  },
  eleve: {
    libelle: "Vigilance élevée",
    carte: "border-red-200 bg-red-50",
    pastille: "bg-red-600",
  },
};

const styleGravite: Record<Gravite, { libelle: string; classe: string }> = {
  important: { libelle: "Important", classe: "bg-red-100 text-red-800" },
  attention: { libelle: "À surveiller", classe: "bg-amber-100 text-amber-800" },
  info: { libelle: "À noter", classe: "bg-slate-100 text-slate-700" },
};

const euros = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-3 text-lg font-semibold">{titre}</h2>
      {children}
    </section>
  );
}

export default function RapportVue({ rapport }: { rapport: Rapport }) {
  const v = styleVigilance[rapport.vigilance.niveau];

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-5 ${v.carte}`}>
        <p className="text-sm text-slate-600">{rapport.vehicule}</p>
        {rapport.prixAnnonce !== null && (
          <p className="text-sm text-slate-600">Prix annoncé : {euros(rapport.prixAnnonce)}</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${v.pastille}`} />
          <span className="text-xl font-bold">{v.libelle}</span>
        </div>
        <p className="mt-2 leading-relaxed">{rapport.vigilance.explication}</p>
      </div>

      {rapport.signaux.length > 0 && (
        <Section titre="Signaux d'alerte">
          <ul className="space-y-4">
            {rapport.signaux.map((s) => (
              <li key={s.titre}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{s.titre}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styleGravite[s.gravite].classe}`}>
                    {styleGravite[s.gravite].libelle}
                  </span>
                </div>
                <p className="mt-1 text-slate-600">{s.detail}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {rapport.incoherences.length > 0 && (
        <Section titre="Incohérences entre les photos et le texte">
          <ul className="list-disc space-y-2 pl-5 text-slate-700">
            {rapport.incoherences.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </Section>
      )}

      {rapport.prixMarche && (
        <Section titre="Prix du marché (estimation indicative)">
          <p className="text-2xl font-bold">
            {euros(rapport.prixMarche.min)} – {euros(rapport.prixMarche.max)}
          </p>
          <p className="mt-2 text-slate-600">{rapport.prixMarche.commentaire}</p>
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
            Estimation approximative, à comparer avec d&apos;autres annonces similaires. Le prix réel
            dépend de l&apos;état, des options et de l&apos;entretien du véhicule.
          </p>
        </Section>
      )}

      <Section titre="Vérifications à faire">
        <ul className="space-y-3">
          {rapport.verifications.map((v) => (
            <li key={v.titre} className="flex gap-3">
              <span className="mt-0.5 text-marque" aria-hidden="true">✓</span>
              <div>
                <p className="font-medium">{v.titre}</p>
                <p className="text-slate-600">{v.detail}</p>
              </div>
            </li>
          ))}
        </ul>
        <a
          href="https://histovec.interieur.gouv.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm font-medium text-marque underline"
        >
          Accéder à HistoVec (site officiel de l&apos;État)
        </a>
      </Section>

      <Section titre="Questions à poser au vendeur">
        <ol className="list-decimal space-y-2 pl-5 text-slate-700">
          {rapport.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </Section>

      <Section titre="Pendant l'essai">
        <ul className="list-disc space-y-2 pl-5 text-slate-700">
          {rapport.essai.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </Section>

      <p className="rounded-2xl bg-slate-100 p-4 text-sm leading-relaxed text-slate-600">
        Ce rapport est une aide à la décision générée automatiquement à partir des éléments fournis.
        Il signale des points à vérifier et ne constitue ni une garantie, ni une expertise du
        véhicule, ni un jugement sur l&apos;honnêteté du vendeur.
      </p>
    </div>
  );
}
