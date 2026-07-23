import { NextRequest, NextResponse } from "next/server";
import { updateUser, deleteUser } from "@/lib/models";
import { verifyTokenFromRequest } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = verifyTokenFromRequest(request);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }
  const { id } = await params;
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ error: "База данных недоступна" }, { status: 503 });
  }
  const body = await request.json();
  const user = await updateUser(id, body);
  return NextResponse.json({ user });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = verifyTokenFromRequest(request);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }
  const { id } = await params;
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ error: "База данных недоступна" }, { status: 503 });
  }
  await deleteUser(id);
  return NextResponse.json({ message: "Участник удалён" });
}
