import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserByLogin } from "@/lib/models";
import { comparePassword, signToken, ensureAdminExists, getSafeUser } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";

const loginSchema = z.object({
  login: z.string().min(1).max(50),
  password: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  await ensureAdminExists();
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные", details: parsed.error.flatten() }, { status: 400 });
  }
  const { login, password } = parsed.data;
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ error: "База данных недоступна" }, { status: 503 });
  }
  const user = await getUserByLogin(login);
  if (!user) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }
  const token = signToken({ userId: user.id, login: user.login, role: user.role });
  return NextResponse.json({ token, user: getSafeUser(user) });
}
