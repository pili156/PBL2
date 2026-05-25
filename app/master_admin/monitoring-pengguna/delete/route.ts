import { NextResponse } from "next/server";
import { deleteUserById } from "../actions";

export async function POST(req: Request) {
  const { id } = await req.json();
  await deleteUserById(id);
  return NextResponse.json({ success: true });
}
