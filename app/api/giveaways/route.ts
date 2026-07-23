import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllGiveaways, getGiveawaysByStatus, createGiveaway, updateGiveaway } from "@/lib/models";
import { verifyTokenFromRequest } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { mockGiveaways } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ giveaways: mockGiveaways });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const giveaways = status ? await getGiveawaysByStatus(status) : await getAllGiveaways();
  return NextResponse.json({ giveaways });
}

export async function POST(request: NextRequest) {
  const payload = verifyTokenFromRequest(request);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ error: "База данных недоступна" }, { status: 503 });
  }
  const body = await request.json().catch(() => ({}));
  const giveaway = await createGiveaway({
    id: crypto.randomUUID(),
    status: "idle",
    bannerUrl: body.bannerUrl ?? "",
    participants: [],
  });
  return NextResponse.json({ giveaway }, { status: 201 });
}
