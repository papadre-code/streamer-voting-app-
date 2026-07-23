import { NextRequest, NextResponse } from "next/server";
import { getAllSettings, updateSettings, createSettings } from "@/lib/models";
import { verifyTokenFromRequest } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { mockSettings } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ settings: Object.entries(mockSettings).map(([key, value]) => ({ key, value, updatedAt: new Date().toISOString() })) });
  }
  const settings = await getAllSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const payload = verifyTokenFromRequest(request);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ error: "База данных недоступна" }, { status: 503 });
  }
  const body = await request.json() as Record<string, string>;
  const results = await Promise.all(
    Object.entries(body).map(([key, value]) =>
      updateSettings(key, value).catch(() => createSettings({ key, value }))
    )
  );
  return NextResponse.json({ settings: results });
}
