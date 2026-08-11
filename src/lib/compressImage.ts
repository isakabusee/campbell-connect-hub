export async function compressIfImage(file: File): Promise<File> {
  const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/bmp"];
  if (!imageTypes.includes(file.type)) return file;
  const imageCompression = (await import("browser-image-compression")).default;
  try {
    const out = await imageCompression(file, {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
      initialQuality: 0.8,
      fileType: "image/webp",
    });
    // Never upload something larger than the original.
    return out.size < file.size ? out : file;
  } catch {
    return file;
  }
}

/** Run async tasks with a bounded number of parallel workers. */
export async function runPool<T, R>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>,
  onProgress?: (done: number, total: number) => void,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  let done = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await task(items[i], i);
      onProgress?.(++done, items.length);
    }
  });
  await Promise.all(workers);
  return results;
}
