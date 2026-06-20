import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { masterPangkatSchema } from "@/src/lib/validation";

export async function GET() {
  const masterPangkat = await prisma.masterPangkat.findMany({ orderBy: { golongan: "asc" } });
  return NextResponse.json(masterPangkat);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = masterPangkatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const created = await prisma.masterPangkat.create({ data: parsed.data });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Golongan pangkat sudah terdaftar." }, { status: 409 });
    }
    console.error("Master Pangkat create error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
