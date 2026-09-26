// Réduit une capture d'écran avant l'envoi : plus rapide sur mobile et moins cher à analyser,
// tout en gardant le texte lisible.
const COTE_MAX = 1600;

export async function compresserImage(fichier: File): Promise<{ mediaType: "image/jpeg"; data: string }> {
  const image = await createImageBitmap(fichier);
  const echelle = Math.min(1, COTE_MAX / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * echelle);
  canvas.height = Math.round(image.height * echelle);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { mediaType: "image/jpeg", data: dataUrl.slice(dataUrl.indexOf(",") + 1) };
}
