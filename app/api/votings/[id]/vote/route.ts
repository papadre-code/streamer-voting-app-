import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getVotingById, updateVoting, getVoteRecord, createVoteRecord, updateVoteRecord, deleteVoteRecord, getUserById } from "@/lib/models";
import { verifyTokenFromRequest } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";

const voteSchema = z.object({ optionId: z.string() });

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
  const parsed = voteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const { optionId } = parsed.data;
  const voting = await getVotingById(id);
  if (!voting || voting.status !== "active") {
    return NextResponse.json({ error: "Голосование не активно" }, { status: 400 });
  }
  const option = voting.options.find(o => o.id === optionId);
  if (!option) {
    return NextResponse.json({ error: "Вариант не найден" }, { status: 404 });
  }
  const user = await getUserById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }
  const existingVote = await getVoteRecord(id, payload.userId);
  if (existingVote) {
    const oldOption = voting.options.find(o => o.id === existingVote.optionId);
    if (oldOption) {
      oldOption.votes = Math.max(0, oldOption.votes - 1);
    }
    await updateVoteRecord(id, payload.userId, { optionId, optionText: option.text });
  } else {
    await createVoteRecord({ votingId: id, userId: payload.userId, optionId, optionText: option.text });
  }
  option.votes += 1;
  const totalVotes = voting.options.reduce((s, o) => s + o.votes, 0);
  const updated = await updateVoting(id, { options: voting.options, totalVotes });
  return NextResponse.json({ voting: updated });
}
