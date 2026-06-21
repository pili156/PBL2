import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf"];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const userEmail = headersList.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const khsId = Number(id);

    if (isNaN(khsId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "File tidak boleh kosong" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Hanya file PDF yang diperbolehkan" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
    }

    const existing = await prisma.monitoringKhs.findUnique({ where: { id: khsId } });
    if (!existing) {
      return NextResponse.json({ error: "KHS tidak ditemukan" }, { status: 404 });
    }

    if (existing.file_khs_path) {
      const oldPath = join(process.cwd(), "public", existing.file_khs_path);
      try { await unlink(oldPath); } catch {}
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = file.name.split(".").pop();
    const fileName = `khs-${khsId}-reupload-${uuidv4()}.${fileExt}`;
    const filePath = join(process.cwd(), "public", "uploads", "khs", fileName);

    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/khs/${fileName}`;

    await prisma.monitoringKhs.update({
      where: { id: khsId },
      data: {
        file_khs_path: fileUrl,
        tanggal_unggah: new Date(),
        status_evaluasi: "pending",
      },
    });

    return NextResponse.json({ success: true, file_khs_path: fileUrl });
  } catch (error) {
    console.error("Error reuploading KHS:", error);
    return NextResponse.json({ error: "Gagal mengupload file" }, { status: 500 });
  }
}
