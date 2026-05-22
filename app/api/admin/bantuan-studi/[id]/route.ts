import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { headers } from "next/headers";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const role = headersList.get("x-user-role");
    if (!role || (role !== "admin_fakultas" && role !== "master_admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const existing = await prisma.pengajuanReimbursement.findUnique({
      where: { id: parsedId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    const body = await request.json();
    const { status, catatan_revisi } = body;

    const updated = await prisma.pengajuanReimbursement.update({
      where: { id: parsedId },
      data: {
        status_pencairan: status || existing.status_pencairan,
        catatan_keuangan: catatan_revisi !== undefined ? catatan_revisi : existing.catatan_keuangan,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating bantuan studi:", error);
    return NextResponse.json({ error: "Gagal memperbarui" }, { status: 500 });
  }
}
