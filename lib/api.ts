const TOKEN_KEY = "jwt-token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getTokenPayload(): { userId: string; login: string; role: "user" | "admin" } | null {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export interface LoginResponse {
  token: string;
  user: { id: string; login: string; nickname: string; server: string; telegram: string; discord: string; supportId: string; role: "user" | "admin" };
}

export async function apiLogin(login: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ login, password }) });
}

export async function apiRegister(data: { login: string; password: string; nickname: string; server: string; telegram?: string; discord?: string; supportId?: string }): Promise<{ message: string; userId: string }> {
  return apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(data) });
}

export async function apiGetMe(): Promise<{ user: LoginResponse["user"] }> {
  return apiFetch("/api/auth/me");
}

export interface VotingOption { id: string; text: string; votes: number; iconUrl?: string }
export interface VotingDTO { id: string; question: string; options: VotingOption[]; status: "active" | "archived"; totalVotes: number; imageUrl?: string; allowMultiple: boolean; createdAt: string; updatedAt: string }

export async function apiGetVotings(status?: string): Promise<{ votings: VotingDTO[] }> {
  const params = status ? `?status=${status}` : "";
  return apiFetch(`/api/votings${params}`);
}

export async function apiCreateVoting(data: { question: string; options: { id: string; text: string; iconUrl?: string }[]; imageUrl?: string; allowMultiple?: boolean }): Promise<{ voting: VotingDTO }> {
  return apiFetch("/api/votings", { method: "POST", body: JSON.stringify(data) });
}

export async function apiUpdateVoting(id: string, data: Partial<{ question: string; options: VotingOption[]; status: "active" | "archived"; totalVotes: number; imageUrl: string; allowMultiple: boolean }>): Promise<{ voting: VotingDTO }> {
  return apiFetch(`/api/votings/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function apiVote(votingId: string, optionId: string): Promise<{ voting: VotingDTO }> {
  return apiFetch(`/api/votings/${votingId}/vote`, { method: "POST", body: JSON.stringify({ optionId }) });
}

export interface VoteDetailDTO { userId: string; nickname: string; optionId: string; optionText: string }
export async function apiGetVotes(votingId: string): Promise<{ votes: VoteDetailDTO[] }> {
  return apiFetch(`/api/votings/${votingId}/votes`);
}

export interface ParticipantDTO { id: string; login: string; nickname: string; server: string; telegram: string; discord: string; supportId: string; role: "user" | "admin" }
export async function apiGetParticipants(): Promise<{ participants: ParticipantDTO[] }> {
  return apiFetch("/api/participants");
}

export async function apiUpdateParticipant(id: string, data: Partial<{ nickname: string; server: string; telegram: string; discord: string; supportId: string }>): Promise<{ user: ParticipantDTO }> {
  return apiFetch(`/api/participants/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function apiDeleteParticipant(id: string): Promise<void> {
  await apiFetch(`/api/participants/${id}`, { method: "DELETE" });
}

export interface GiveawayDTO { id: string; status: "idle" | "active" | "drawing" | "complete"; bannerUrl?: string; participants: string[]; winnerNickname?: string; createdAt: string; updatedAt: string }
export async function apiGetGiveaways(status?: string): Promise<{ giveaways: GiveawayDTO[] }> {
  const params = status ? `?status=${status}` : "";
  return apiFetch(`/api/giveaways${params}`);
}

export async function apiCreateGiveaway(data?: { bannerUrl?: string }): Promise<{ giveaway: GiveawayDTO }> {
  return apiFetch("/api/giveaways", { method: "POST", body: JSON.stringify(data ?? {}) });
}

export async function apiUpdateGiveaway(id: string, data: Partial<{ status: string; bannerUrl: string; participants: string[]; winnerNickname: string }>): Promise<{ giveaway: GiveawayDTO }> {
  return apiFetch(`/api/giveaways/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function apiJoinGiveaway(giveawayId: string, nickname: string): Promise<{ giveaway: GiveawayDTO }> {
  return apiFetch(`/api/giveaways/${giveawayId}/join`, { method: "POST", body: JSON.stringify({ nickname }) });
}

export interface GiveawayWinnerDTO { id: string; giveawayId: string; nickname: string; participantsCount: number; wonAt: string }
export async function apiGetGiveawayWinners(): Promise<{ winners: GiveawayWinnerDTO[] }> {
  return apiFetch("/api/giveaway-winners");
}

export interface SettingsDTO { key: string; value: string; updatedAt: string }
export async function apiGetSettings(): Promise<{ settings: SettingsDTO[] }> {
  return apiFetch("/api/settings");
}

export async function apiUpdateSettings(data: Record<string, string>): Promise<{ settings: SettingsDTO[] }> {
  return apiFetch("/api/settings", { method: "PUT", body: JSON.stringify(data) });
}
