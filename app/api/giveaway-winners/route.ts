import { NextRequest, NextResponse } from "next/server";
import { getAllGiveawayWinners } from "@/lib/models";
import { verifyTokenFromRequest } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";

export async function GET(request: NextRequest) {
  const payload = verifyTokenFromRequest(request);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ winners: [] });
  }
  const winners = await getAllGiveawayWinners();
  return NextResponse.json({ winners });
}
