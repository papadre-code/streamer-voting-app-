import { NextRequest, NextResponse } from "next/server";
import { getVoteRecordsByVoting, getUserById } from "@/lib/models";
import { verifyTokenFromRequest } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { mockVoteDetails } from "@/lib/mock-data";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = verifyTokenFromRequest(request);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }
  const { id } = await params;
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ votes: mockVoteDetails });
  }
  const records = await getVoteRecordsByVoting(id);
  const votes = await Promise.all(records.map(async r => {
    const user = await getUserById(r.userId);
    return { userId: r.userId, nickname: user?.nickname ?? "Неизвестно", optionId: r.optionId, optionText: r.optionText };
  }));
  return NextResponse.json({ votes });
}
