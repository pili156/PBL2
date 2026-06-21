import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    let dataDosen: any[] = [];
    
    try {
      dataDosen = await prisma.masterDosen.findMany();
    } catch (dbError) {
      console.error("Gagal query ke tabel masterDosen:", dbError);
      dataDosen = [];
    }

    // Hitung statistik dasar
    const totalDosen = dataDosen.length;
    
    const tugasBelajarTotal = dataDosen.filter((d: any) => 
      (d.jenis_pengajuan_studi || d.jenisPengajuanStudi || "").toLowerCase().includes("tugas belajar")
    ).length;

    const izinBelajarTotal = dataDosen.filter((d: any) => 
      (d.jenis_pengajuan_studi || d.jenisPengajuanStudi || "").toLowerCase().includes("izin belajar")
    ).length;

    const doktorTotal = dataDosen.filter((d: any) => 
      (d.jenjang || d.jenjangStudi || "").toUpperCase() === "S3"
    ).length;

    const profesorTotal = dataDosen.filter((d: any) => 
      (d.jabatan || d.jabatanFungsional || "").toLowerCase() === "profesor"
    ).length;

    return NextResponse.json({
      daftarDosen: dataDosen,
      lulusanTerbaru: [], 
      stats: {
        totalDosen: totalDosen,
        tugasBelajar: { total: tugasBelajarTotal, aktif: tugasBelajarTotal, lulus: 0, do: 0 },
        izinBelajar: { total: izinBelajarTotal, aktif: izinBelajarTotal, selesai: 0 },
        doktor: doktorTotal,
        profesor: profesorTotal
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error pada API Buku Induk Master Admin:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "ID tidak valid" },
        { status: 400 }
      );
    }

    await prisma.masterDosen.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json(
      { message: "Data berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saat menghapus data:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data" },
      }
      { status: 500 }
    );
  }
}
