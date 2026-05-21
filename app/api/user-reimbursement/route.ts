import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userEmail = headersList.get("x-user-email");
    const userId = parseInt(headersList.get("x-user-id") || "0");

    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const semesterKe = formData.get("semester_ke")?.toString();
    const tanggalPembayaran = formData.get("tanggal_pembayaran")?.toString();
    const nominalValue = formData.get("nominal")?.toString();
    const metodePembayaran = formData.get("metode_pembayaran")?.toString();
    const catatan = formData.get("catatan_keuangan")?.toString();
    const file = formData.get("file_bukti_bayar");

    if (!semesterKe || !tanggalPembayaran || !nominalValue || !metodePembayaran || !file) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    const pengajuan = await prisma.pengajuanStudi.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    if (!pengajuan) {
      return NextResponse.json({ error: "Data pengajuan studi tidak ditemukan untuk user ini." }, { status: 400 });
    }

    const semesterNumber = Number(semesterKe);
    if (Number.isNaN(semesterNumber) || semesterNumber < 1) {
      return NextResponse.json({ error: "Semester tidak valid." }, { status: 400 });
    }

    const existing = await prisma.pengajuanReimbursement.findFirst({
      where: {
        pengajuan_id: pengajuan.id,
        semester_ke: semesterNumber,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Pengajuan reimbursement untuk semester ini sudah ada." }, { status: 409 });
    }

    const fileName = file instanceof File ? file.name : String(file);
    const reimbursement = await prisma.pengajuanReimbursement.create({
      data: {
        pengajuan_id: pengajuan.id,
        semester_ke: semesterNumber,
        file_bukti_bayar: fileName,
        nominal: parseFloat(nominalValue),
        status_pencairan: "Pending",
        catatan_keuangan: catatan || null,
        nama_bank: metodePembayaran,
        tanggal_pencairan: new Date(tanggalPembayaran),
      },
    });

    return NextResponse.json(reimbursement);
  } catch (error) {
    console.error("Error creating reimbursement", error);
    return NextResponse.json({ error: "Gagal membuat reimbursement." }, { status: 500 });
  }
}
