const MAX_IMAGE_EDGE = 1600;
const TARGET_IMAGE_BYTES = 900 * 1024;
const MIN_WEBP_QUALITY = 0.68;

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Foto tidak dapat dibaca."));
    };
    image.src = objectUrl;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Gagal mengompres foto.")),
      "image/webp",
      quality
    );
  });

export const compressProductImage = async (file: File) => {
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Ukuran foto mentah maksimal 20MB.");

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Browser tidak mendukung kompresi foto.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  let quality = 0.86;
  let blob = await canvasToBlob(canvas, quality);
  while (blob.size > TARGET_IMAGE_BYTES && quality > MIN_WEBP_QUALITY) {
    quality = Math.max(MIN_WEBP_QUALITY, quality - 0.06);
    blob = await canvasToBlob(canvas, quality);
  }

  const originalBaseName = file.name.replace(/\.[^.]+$/, "") || "produk";
  return new File([blob], `${originalBaseName}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
};
