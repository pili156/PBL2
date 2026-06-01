import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png'];

export type KategoriFolder = 'studi' | 'khs' | 'keuangan' | 'dokumen';

export interface UploadResult {
  filePath: string;
  fileName: string;
  originalName: string;
}

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

export function validateFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    const types = ALLOWED_EXT.join(', ');
    throw new UploadError(`Tipe file tidak didukung. Gunakan: ${types}`);
  }
  if (file.size > MAX_SIZE) {
    throw new UploadError('Ukuran file maksimal 5MB');
  }
}

export function sanitizeFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext)
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  const timestamp = Date.now();
  return `${base}-${timestamp}${ext}`;
}

export function getUploadDir(idDosen: number, kategori: KategoriFolder): string {
  return path.join(process.cwd(), 'public', 'uploads', 'dosen', String(idDosen), kategori);
}

export async function uploadFile(
  file: File,
  idDosen: number,
  kategori: KategoriFolder,
  customName?: string
): Promise<UploadResult> {
  validateFile(file);

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    throw new UploadError(`Ekstensi file tidak didukung: ${ext}`);
  }

  const dir = getUploadDir(idDosen, kategori);
  await mkdir(dir, { recursive: true });

  const sanitized = customName
    ? `${customName.replace(/[^a-zA-Z0-9\-_]/g, '-').toLowerCase()}${ext}`
    : sanitizeFileName(file.name);

  const fullPath = path.join(dir, sanitized);
  const bytes = await file.arrayBuffer();
  await writeFile(fullPath, Buffer.from(bytes));

  const publicPath = `/uploads/dosen/${idDosen}/${kategori}/${sanitized}`;

  return {
    filePath: publicPath,
    fileName: sanitized,
    originalName: file.name,
  };
}
