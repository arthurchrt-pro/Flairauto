import type { Metadata } from "next";
import Link from "next/link";
import RapportVue from "@/components/RapportVue";
import { rapportExemple } from "@/lib/exemple";

export const metadata: Metadata = {
  title: "Exemple de rapport · Flair Auto",
};

export default function PageExemple() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <p className="mb-1 text-sm font-medium uppercase tracking-wide text-marque">Exemple</p>
      <h1 className="mb-2 text-2xl font-bold">À quoi ressemble un rapport</h1>
      <p className="mb-6 text-slate-600">
        Ce rapport porte sur une annonce fictive. Le vôtre sera adapté à l&apos;annonce que vous
        envoyez.
      </p>

      <RapportVue rapport={rapportExemple} />

      <Link
        href="/#analyser"
        className="mt-6 block rounded-xl bg-marque px-5 py-4 text-center font-semibold text-white hover:bg-marque-fonce"
      >
        Analyser mon annonce gratuitement
      </Link>
    </div>
  );
}
