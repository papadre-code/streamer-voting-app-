import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/lib/models";
import { verifyTokenFromRequest } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { mockParticipants } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const payload = verifyTokenFromRequest(request);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ participants: mockParticipants });
  }
  const users = await getAllUsers();
  const participants = users.map(u => ({
    id: u.id, login: u.login, nickname: u.nickname, server: u.server,
    telegram: u.telegram, discord: u.discord, supportId: u.supportId, role: u.role,
  }));
  return NextResponse.json({ participants });
}
