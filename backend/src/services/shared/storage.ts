import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";

export type StoredBlob = {
  path: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export async function storeLocalBlob(baseDir: string, relativePath: string, fileName: string, buffer: Buffer, mimeType: string): Promise<StoredBlob> {
  const finalPath = join(baseDir, relativePath, fileName);
  await mkdir(dirname(finalPath), { recursive: true });
  await writeFile(finalPath, buffer);

  return {
    path: finalPath,
    fileName,
    mimeType,
    size: buffer.byteLength
  };
}
