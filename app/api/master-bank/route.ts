import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const banks = await prisma.masterBank.findMany({ orderBy: { nama_bank: "asc" } });
  return NextResponse.json(banks);
}
