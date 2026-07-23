import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/models";
import { verifyToken, getSafeUser } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Токен не предоставлен" }, { status: 401 });
  }
  const token = authHeader.slice(7);
  let payload: ReturnType<typeof verifyToken>;
  try {
    payload = verifyToken(token);
  } catch {
    return NextResponse.json({ error: "Недействительный или просроченный токен" }, { status: 401 });
  }
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ error: "База данных недоступна" }, { status: 503 });
  }
  const user = await getUserById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }
  return NextResponse.json({ user: getSafeUser(user) });
}
