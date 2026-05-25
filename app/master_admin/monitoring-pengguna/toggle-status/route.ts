import { NextResponse } from "next/server";
import { toggleStatus } from "../actions";

export async function POST(req: Request) {
  const form = await req.formData();
  const id = Number(form.get("id"));
  await toggleStatus(id);
  return NextResponse.json({ success: true });
}
