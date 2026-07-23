import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGiveawayById, updateGiveaway } from "@/lib/models";
import { verifyTokenFromRequest } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";

const joinSchema = z.object({ nickname: z.string().min(1) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = verifyTokenFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }
  const { id } = await params;
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ error: "База данных недоступна" }, { status: 503 });
  }
  const parsed = joinSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const { nickname } = parsed.data;
  const giveaway = await getGiveawayById(id);
  if (!giveaway || giveaway.status !== "active") {
    return NextResponse.json({ error: "Розыгрыш не активен" }, { status: 400 });
  }
  if (giveaway.participants.includes(nickname)) {
    return NextResponse.json({ error: "Вы уже участвуете" }, { status: 409 });
  }
  const updated = await updateGiveaway(id, { participants: [...giveaway.participants, nickname] });
  return NextResponse.json({ giveaway: updated });
}
