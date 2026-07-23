import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllVotings, getVotingsByStatus, createVoting, updateVoting, getVoteRecordsByVoting, deleteVoteRecord, createVoteRecord, getUserById } from "@/lib/models";
import { verifyTokenFromRequest } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { mockVotings } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ votings: mockVotings });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const votings = status ? await getVotingsByStatus(status) : await getAllVotings();
  return NextResponse.json({ votings });
}

const createVotingSchema = z.object({
  question: z.string().min(1).max(500),
  options: z.array(z.object({ id: z.string(), text: z.string().min(1), iconUrl: z.string().optional() })).min(2).max(12),
  imageUrl: z.string().optional(),
  allowMultiple: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  const payload = verifyTokenFromRequest(request);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ error: "База данных недоступна" }, { status: 503 });
  }
  const parsed = createVotingSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные", details: parsed.error.flatten() }, { status: 400 });
  }
  const { question, options, imageUrl, allowMultiple } = parsed.data;
  const existingActive = await getVotingsByStatus("active");
  for (const v of existingActive) {
    await updateVoting(v.id, { status: "archived" });
  }
  const voting = await createVoting({
    id: crypto.randomUUID(),
    question,
    options: options.map(o => ({ ...o, votes: 0 })),
    status: "active",
    totalVotes: 0,
    imageUrl,
    allowMultiple,
  });
  return NextResponse.json({ voting }, { status: 201 });
}
