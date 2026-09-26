import Anthropic from "@anthropic-ai/sdk";
import { analyserAnnonce, type ImageAnnonce } from "@/lib/analyse";

// Les captures ne sont jamais enregistrées : elles n'existent que le temps de la requête.

// L'analyse peut prendre jusqu'à quelques minutes.
export const maxDuration = 300;

const MAX_IMAGES = 6;
const MAX_TAILLE_IMAGE = 2_000_000; // caractères base64, soit environ 1,5 Mo
const MAX_TEXTE = 10_000;
const TYPES_ACCEPTES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function erreur(message: string, status: number) {
  return Response.json({ erreur: message }, { status });
}

export async function POST(request: Request) {
  let corps: { images?: unknown; texte?: unknown };
  try {
    corps = await request.json();
  } catch {
    return erreur("Requête invalide.", 400);
  }

  const images = Array.isArray(corps.images) ? (corps.images as ImageAnnonce[]) : [];
  const texte = typeof corps.texte === "string" ? corps.texte.trim() : "";

  if (images.length === 0 && texte.length === 0) {
    return erreur("Ajoutez au moins une capture d'écran ou le texte de l'annonce.", 400);
  }
  if (images.length > MAX_IMAGES) {
    return erreur(`${MAX_IMAGES} captures au maximum.`, 400);
  }
  const imagesValides = images.every(
    (img) =>
      TYPES_ACCEPTES.includes(img?.mediaType) &&
      typeof img?.data === "string" &&
      img.data.length <= MAX_TAILLE_IMAGE,
  );
  if (!imagesValides) {
    return erreur("Une des captures n'est pas une image valide ou est trop lourde.", 400);
  }
  if (texte.length > MAX_TEXTE) {
    return erreur("Le texte de l'annonce est trop long.", 400);
  }

  try {
    const { lisible, motifIllisible, ...rapport } = await analyserAnnonce(images, texte);
    if (!lisible) {
      return erreur(
        motifIllisible ?? "Nous n'avons pas réussi à lire une annonce de véhicule dans les éléments envoyés.",
        422,
      );
    }
    return Response.json({ rapport });
  } catch (e) {
    console.error("Erreur d'analyse :", e);
    if (e instanceof Anthropic.RateLimitError || (e instanceof Anthropic.APIError && e.status === 529)) {
      return erreur("Le service est très sollicité. Réessayez dans une minute.", 503);
    }
    return erreur("L'analyse n'a pas pu aboutir. Réessayez dans un instant.", 500);
  }
}
