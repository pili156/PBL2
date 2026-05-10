import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get("user_email")?.value;

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
          },
        },
      },
    });

    if (!reimbursement || reimbursement.pengajuan_studi?.user?.email !== userEmail) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(reimbursement);
  } catch (error) {
    console.error("Error fetching reimbursement detail", error);
    return NextResponse.json({ error: "Gagal memuat detail reimbursement." }, { status: 500 });
  }
}
