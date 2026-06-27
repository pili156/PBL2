import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headersList = await headers();
    const userEmail = headersList.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const reimbursementId = id ? Number(id) : NaN;
    if (Number.isNaN(reimbursementId)) {
      return NextResponse.json({ error: "ID pengajuan tidak valid." }, { status: 400 });
    }

    const reimbursement = await prisma.pengajuanReimbursement.findUnique({
      where: { id: reimbursementId },
      include: {
        pengajuan_studi: {
          include: {
            user: true,
            jalur_pendanaan: true,
            jenis_studi: true,
            wilayah: true,
            status: true,
            dokumen_pengajuan: {
              where: {
                pengajuan_reimbursement_id: reimbursementId,
              },
              include: { master_dokumen: true },
            },
          },
        },
      },
    });

    const dosen = await prisma.masterDosen.findUnique({
      where: { user_id: reimbursement?.pengajuan_studi?.user_id || 0 },
      select: { pendidikan_terakhir: true, tanggal_lulus: true, gelar: true },
    });

    if (!reimbursement || reimbursement.pengajuan_studi?.user?.email !== userEmail) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan." }, { status: 404 });
    }

    const isDoktorLulus = 
      (dosen?.pendidikan_terakhir === 'S3' && dosen?.tanggal_lulus) ||
      (reimbursement.pengajuan_studi?.status?.nama_status === 'lulus' && 
       (reimbursement.pengajuan_studi?.jenis_studi?.nama_jenis?.toLowerCase().includes('s3') || 
        reimbursement.pengajuan_studi?.jenis_studi?.nama_jenis?.toLowerCase().includes('doktor')));

    return NextResponse.json({ ...reimbursement, isDoktorLulus });
  } catch (error) {
    console.error("Error fetching bantuan studi detail", error);
    return NextResponse.json({ error: "Gagal memuat detail." }, { status: 500 });
  }
}
