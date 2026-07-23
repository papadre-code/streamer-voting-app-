import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, getUserByLogin } from "@/lib/models";
import { hashPassword, ensureAdminExists } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";

const registerSchema = z.object({
  login: z.string().min(3).max(50),
  password: z.string().min(6).max(200),
  nickname: z.string().min(1).max(100),
  server: z.string().min(1).max(20),
  telegram: z.string().max(200).optional().default(""),
  discord: z.string().max(200).optional().default(""),
  supportId: z.string().max(200).optional().default(""),
});

export async function POST(request: NextRequest) {
  await ensureAdminExists();
  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные", details: parsed.error.flatten() }, { status: 400 });
  }
  const { login, password, nickname, server, telegram, discord, supportId } = parsed.data;
  if (login === "admin") {
    return NextResponse.json({ error: "Этот логин зарезервирован" }, { status: 400 });
  }
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ error: "База данных недоступна" }, { status: 503 });
  }
  const existing = await getUserByLogin(login);
  if (existing) {
    return NextResponse.json({ error: "Пользователь с таким логином уже существует" }, { status: 409 });
  }
  const passwordHash = await hashPassword(password);
  const user = await createUser({
    id: crypto.randomUUID(),
    login, passwordHash, nickname, server, telegram, discord, supportId, role: "user",
  });
  return NextResponse.json({ message: "Пользователь зарегистрирован", userId: user.id }, { status: 201 });
}
