import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { getUserByLogin, createUser, getUserById } from "./models";
import { isDatabaseAvailable } from "./db";

const SALT_ROUNDS = 10;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
}

export function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD ?? null;
}

export interface JwtPayload {
  userId: string;
  login: string;
  role: "user" | "admin";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}

let adminInitPromise: Promise<void> | null = null;

export async function ensureAdminExists(): Promise<void> {
  if (adminInitPromise) return adminInitPromise;
  adminInitPromise = (async () => {
    const adminPassword = getAdminPassword();
    if (!adminPassword) return;
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) return;
    const existing = await getUserByLogin("admin");
    if (existing) return;
    const passwordHash = await hashPassword(adminPassword);
    await createUser({
      id: "admin",
      login: "admin",
      passwordHash,
      nickname: "Administrator",
      server: "1",
      telegram: "",
      discord: "",
      supportId: "ADMIN",
      role: "admin",
    });
  })();
  return adminInitPromise;
}

export function verifyTokenFromRequest(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return verifyToken(authHeader.slice(7));
  } catch {
    return null;
  }
}

export function getSafeUser(user: Awaited<ReturnType<typeof getUserById>>): Omit<NonNullable<typeof user>, "passwordHash"> | null {
  if (!user) return null;
  const safeUser = { ...user };
  delete (safeUser as Record<string, unknown>).passwordHash;
  return safeUser as Omit<NonNullable<typeof user>, "passwordHash">;
}
