export async function compressIfImage(file: File): Promise<File> {
  const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/bmp"];
  if (!imageTypes.includes(file.type)) return file;
  const imageCompression = (await import("browser-image-compression")).default;
  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });
}
