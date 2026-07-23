// localStorage-based API
// ============================================================

// --- Token management ---
const isBrowser = typeof window !== "undefined";

const TOKEN_KEY = "jwt-token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch { return false; }
}

export function getTokenPayload(): { userId: string; login: string; role: "user" | "admin" } | null {
  const token = getToken();
  if (!token) return null;
  try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; }
}

// --- LocalStorage helpers ---
function lsGet<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function lsSet(key: string, value: any) {
	if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Auth ---
export async function apiLogin(login: string, password: string): Promise<any> {
  const users = lsGet<any[]>("users", []);
  const user = users.find((u: any) => u.login === login);
  if (!user || user.password !== password) {
    throw new Error("Неверный логин или пароль");
  }
  const token = btoa(JSON.stringify({ userId: user.id, login: user.login, role: user.role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
  return { token, user: { ...user, passwordHash: undefined } };
}

export async function apiRegister(data: any): Promise<any> {
  const users = lsGet<any[]>("users", []);
  if (users.find((u: any) => u.login === data.login)) {
    throw new Error("Пользователь с таким логином уже существует");
  }
  const adminPassword = lsGet<string>("admin-password", "streamer123");
  const newUser = {
    id: crypto.randomUUID(),
    login: data.login,
    password: data.password,
    nickname: data.nickname,
    server: data.server,
    telegram: data.telegram || "",
    discord: data.discord || "",
    supportId: data.supportId || "",
    role: "user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.push(newUser);
  lsSet("users", users);
  return { message: "Пользователь зарегистрирован", userId: newUser.id };
}

export async function apiGetMe(): Promise<any> {
  const payload = getTokenPayload();
  if (!payload) throw new Error("Не авторизован");
  const users = lsGet<any[]>("users", []);
  const user = users.find((u: any) => u.id === payload.userId);
  if (!user) throw new Error("Пользователь не найден");
  const { password, ...safe } = user;
  return { user: safe };
}

// --- Admin auth ---
export function checkAdminPassword(password: string): boolean {
  const adminPassword = lsGet<string>("admin-password", "streamer123");
  return password === adminPassword;
}

export function setAdminPassword(password: string) {
  lsSet("admin-password", password);
}

// --- Participants ---
export async function apiGetParticipants(): Promise<any> {
  const users = lsGet<any[]>("users", []);
  const participants = users.filter((u: any) => u.role !== "admin").map((u: any) => {
    const { password, ...rest } = u;
    return rest;
  });
  return { participants };
}

export async function apiUpdateParticipant(id: string, data: any): Promise<any> {
  const users = lsGet<any[]>("users", []);
  const idx = users.findIndex((u: any) => u.id === id);
  if (idx === -1) throw new Error("Не найден");
  users[idx] = { ...users[idx], ...data, updatedAt: new Date().toISOString() };
  lsSet("users", users);
  const { password, ...safe } = users[idx];
  return { user: safe };
}

export async function apiDeleteParticipant(id: string): Promise<void> {
  const users = lsGet<any[]>("users", []);
  lsSet("users", users.filter((u: any) => u.id !== id));
}

// --- Votings ---
export async function apiGetVotings(status?: string): Promise<any> {
  let votings = lsGet<any[]>("votings", []);
  if (status) votings = votings.filter((v: any) => v.status === status);
  return { votings };
}

export async function apiCreateVoting(data: any): Promise<any> {
  const votings = lsGet<any[]>("votings", []);
  // Архивируем активные
  votings.forEach(v => { if (v.status === "active") v.status = "archived"; });
  const voting = {
    id: crypto.randomUUID(),
    question: data.question,
    options: data.options.map((o: any) => ({ ...o, votes: 0 })),
    status: "active",
    totalVotes: 0,
    imageUrl: data.imageUrl || "",
    allowMultiple: data.allowMultiple || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  votings.push(voting);
  lsSet("votings", votings);
  return { voting };
}

export async function apiUpdateVoting(id: string, data: any): Promise<any> {
  const votings = lsGet<any[]>("votings", []);
  const idx = votings.findIndex((v: any) => v.id === id);
  if (idx === -1) throw new Error("Не найдено");
  votings[idx] = { ...votings[idx], ...data, updatedAt: new Date().toISOString() };
  lsSet("votings", votings);
  return { voting: votings[idx] };
}

export async function apiVote(votingId: string, optionId: string): Promise<any> {
  const votings = lsGet<any[]>("votings", []);
  const voting = votings.find((v: any) => v.id === votingId);
  if (!voting) throw new Error("Не найдено");
  const option = voting.options.find((o: any) => o.id === optionId);
  if (!option) throw new Error("Вариант не найден");

  const payload = getTokenPayload();
  if (!payload) throw new Error("Не авторизован");

  // Снимаем старый голос
  const voteRecords = lsGet<any[]>("vote-records", []);
  const existingIdx = voteRecords.findIndex((r: any) => r.votingId === votingId && r.userId === payload.userId);
  if (existingIdx !== -1) {
    const oldOption = voting.options.find((o: any) => o.id === voteRecords[existingIdx].optionId);
    if (oldOption) oldOption.votes = Math.max(0, oldOption.votes - 1);
    voteRecords[existingIdx] = { votingId, userId: payload.userId, optionId, optionText: option.text, createdAt: new Date().toISOString() };
  } else {
    voteRecords.push({ votingId, userId: payload.userId, optionId, optionText: option.text, createdAt: new Date().toISOString() });
  }
  option.votes += 1;
  voting.totalVotes = voting.options.reduce((s: number, o: any) => s + o.votes, 0);
  voting.updatedAt = new Date().toISOString();
  lsSet("votings", votings);
  lsSet("vote-records", voteRecords);
  return { voting };
}

export async function apiGetVotes(votingId: string): Promise<any> {
  const voteRecords = lsGet<any[]>("vote-records", []);
  const users = lsGet<any[]>("users", []);
  const records = voteRecords.filter((r: any) => r.votingId === votingId);
  const votes = records.map((r: any) => {
    const user = users.find((u: any) => u.id === r.userId);
    return { userId: r.userId, nickname: user?.nickname || "Неизвестно", optionId: r.optionId, optionText: r.optionText };
  });
  return { votes };
}

// --- Giveaways ---
export async function apiGetGiveaways(status?: string): Promise<any> {
  let giveaways = lsGet<any[]>("giveaways", []);
  if (giveaways.length === 0) {
    giveaways = [{ id: "g1", status: "idle", bannerUrl: "", participants: [], winnerNickname: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    lsSet("giveaways", giveaways);
  }
  if (status) giveaways = giveaways.filter((g: any) => g.status === status);
  return { giveaways };
}

export async function apiCreateGiveaway(data?: any): Promise<any> {
  const giveaways = lsGet<any[]>("giveaways", []);
  const giveaway = {
    id: crypto.randomUUID(),
    status: "idle",
    bannerUrl: data?.bannerUrl || "",
    participants: [],
    winnerNickname: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  giveaways.push(giveaway);
  lsSet("giveaways", giveaways);
  return { giveaway };
}

export async function apiUpdateGiveaway(id: string, data: any): Promise<any> {
  const giveaways = lsGet<any[]>("giveaways", []);
  const idx = giveaways.findIndex((g: any) => g.id === id);
  if (idx === -1) throw new Error("Не найдено");
  giveaways[idx] = { ...giveaways[idx], ...data, updatedAt: new Date().toISOString() };
  lsSet("giveaways", giveaways);
  return { giveaway: giveaways[idx] };
}

export async function apiJoinGiveaway(giveawayId: string, nickname: string): Promise<any> {
  const giveaways = lsGet<any[]>("giveaways", []);
  const giveaway = giveaways.find((g: any) => g.id === giveawayId);
  if (!giveaway) throw new Error("Не найдено");
  if (giveaway.participants.includes(nickname)) throw new Error("Вы уже участвуете");
  giveaway.participants.push(nickname);
  giveaway.updatedAt = new Date().toISOString();
  lsSet("giveaways", giveaways);
  return { giveaway };
}

// --- Giveaway Winners ---
export async function apiGetGiveawayWinners(): Promise<any> {
  const winners = lsGet<any[]>("giveaway-winners", []);
  return { winners };
}

// --- Settings ---
export async function apiGetSettings(): Promise<any> {
  const settings = lsGet<any[]>("settings", []);
  return { settings };
}

export async function apiUpdateSettings(data: Record<string, string>): Promise<any> {
  const settings = lsGet<any[]>("settings", []);
  Object.entries(data).forEach(([key, value]) => {
    const idx = settings.findIndex((s: any) => s.key === key);
    if (idx !== -1) {
      settings[idx] = { key, value, updatedAt: new Date().toISOString() };
    } else {
      settings.push({ key, value, updatedAt: new Date().toISOString() });
    }
  });
  lsSet("settings", settings);
  return { settings };
}

// --- apiFetch заглушка ---
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  throw new Error("apiFetch не поддерживается в localStorage режиме");
}
