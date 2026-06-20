import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { reimbursementSchema } from "@/src/lib/validation";

export async function GET() {
  try {
    const headersList = await headers();
    const userEmail = headersList.get("x-user-email");
    const userId = parseInt(headersList.get("x-user-id") || "0");

    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pengajuan = await prisma.pengajuanStudi.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    if (!pengajuan) {
      return NextResponse.json({ data: [], exists: false });
    }

    const bantuanStudiList = await prisma.pengajuanReimbursement.findMany({
      where: {
        pengajuan_id: pengajuan.id,
        jenis_pengajuan: "bantuan_studi",
      },
      orderBy: { semester_ke: "asc" },
      include: {
        pengajuan_studi: {
          include: {
            dokumen_pengajuan: {
              where: {
                master_dokumen_id: { in: [21, 22, 23, 24] },
              },
              include: { master_dokumen: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: bantuanStudiList, exists: true });
  } catch (error) {
    console.error("Error fetching bantuan studi", error);
    return NextResponse.json({ error: "Gagal memuat data." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userEmail = headersList.get("x-user-email");
    const userId = parseInt(headersList.get("x-user-id") || "0");

    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const formObj = Object.fromEntries(formData.entries());
    const parsed = reimbursementSchema.safeParse(formObj);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { semester_ke: semesterKe, tahun_akademik: tahunAkademik, tahun_ke: tahunKe, nominal: nominalValue, catatan_keuangan: catatan, jenis_pengajuan: jenisPengajuan, nomor_rekening: nomorRekening, nama_bank: namaBank } = parsed.data;

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

    const nominalNumber = parseFloat(nominalValue.replace(/[^0-9]/g, ""));
    if (Number.isNaN(nominalNumber) || nominalNumber <= 0) {
      return NextResponse.json({ error: "Nominal tidak valid." }, { status: 400 });
    }

    const existing = await prisma.pengajuanReimbursement.findFirst({
      where: {
        pengajuan_id: pengajuan.id,
        jenis_pengajuan: jenisPengajuan,
        semester_ke: semesterNumber,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Pengajuan untuk semester ini sudah ada." }, { status: 409 });
    }

    const reimbursement = await prisma.pengajuanReimbursement.create({
      data: {
        pengajuan_id: pengajuan.id,
        jenis_pengajuan: jenisPengajuan,
        semester_ke: semesterNumber,
        tahun_akademik: tahunAkademik || null,
        tahun_ke: tahunKe ? parseInt(tahunKe) : null,
        nominal: nominalNumber,
        status_pencairan: "pending",
        catatan_keuangan: catatan || null,
        nomor_rekening: nomorRekening,
        nama_bank: namaBank,
      },
    });

    return NextResponse.json(reimbursement);
  } catch (error) {
    console.error("Error creating bantuan studi", error);
    return NextResponse.json({ error: "Gagal membuat pengajuan." }, { status: 500 });
  }
}
