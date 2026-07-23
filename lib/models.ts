import { ydbRequest } from "./db";

function uuid() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  login: string;
  passwordHash: string;
  nickname: string;
  server: string;
  telegram: string;
  discord: string;
  supportId: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await ydbRequest("GetItem", { TableName: "users", Key: { id: { S: id } } });
    if (!result.Item) return null;
    return itemToUser(result.Item);
  } catch { return null; }
}

export async function getUserByLogin(login: string): Promise<User | null> {
  try {
    const result = await ydbRequest("Query", {
      TableName: "users",
      IndexName: "login-index",
      KeyConditionExpression: "#login = :login",
      ExpressionAttributeNames: { "#login": "login" },
      ExpressionAttributeValues: { ":login": { S: login } },
    });
    if (!result.Items || result.Items.length === 0) return null;
    return itemToUser(result.Items[0]);
  } catch { return null; }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const result = await ydbRequest("Scan", { TableName: "users" });
    return (result.Items || []).map(itemToUser);
  } catch { return []; }
}

export async function createUser(data: Omit<User, "createdAt" | "updatedAt">): Promise<User> {
  const user: User = { ...data, createdAt: now(), updatedAt: now() };
  await ydbRequest("PutItem", { TableName: "users", Item: userToItem(user) });
  return user;
}

export async function updateUser(id: string, data: Partial<Pick<User, "nickname" | "server" | "telegram" | "discord" | "supportId" | "role" | "passwordHash">>): Promise<User> {
  const user = await getUserById(id);
  if (!user) throw new Error("User not found");
  const updated = { ...user, ...data, updatedAt: now() };
  await ydbRequest("PutItem", { TableName: "users", Item: userToItem(updated) });
  return updated;
}

export async function deleteUser(id: string): Promise<void> {
  await ydbRequest("DeleteItem", { TableName: "users", Key: { id: { S: id } } });
}

function itemToUser(item: any): User {
  return {
    id: item.id.S,
    login: item.login.S,
    passwordHash: item.passwordHash.S,
    nickname: item.nickname.S,
    server: item.server.S,
    telegram: item.telegram?.S || "",
    discord: item.discord?.S || "",
    supportId: item.supportId?.S || "",
    role: item.role.S as "user" | "admin",
    createdAt: item.createdAt.S,
    updatedAt: item.updatedAt.S,
  };
}

function userToItem(user: User): any {
  return {
    id: { S: user.id },
    login: { S: user.login },
    passwordHash: { S: user.passwordHash },
    nickname: { S: user.nickname },
    server: { S: user.server },
    telegram: { S: user.telegram },
    discord: { S: user.discord },
    supportId: { S: user.supportId },
    role: { S: user.role },
    createdAt: { S: user.createdAt },
    updatedAt: { S: user.updatedAt },
  };
}

// ---------------------------------------------------------------------------
// Voting
// ---------------------------------------------------------------------------

export interface VoteOption {
  id: string;
  text: string;
  votes: number;
  iconUrl?: string;
}

export interface Voting {
  id: string;
  question: string;
  options: VoteOption[];
  status: "active" | "archived";
  totalVotes: number;
  imageUrl?: string;
  allowMultiple: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getVotingById(id: string): Promise<Voting | null> {
  try {
    const result = await ydbRequest("GetItem", { TableName: "votings", Key: { id: { S: id } } });
    if (!result.Item) return null;
    return itemToVoting(result.Item);
  } catch { return null; }
}

export async function getVotingsByStatus(status: string): Promise<Voting[]> {
  try {
    const result = await ydbRequest("Query", {
      TableName: "votings",
      IndexName: "status-index",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": { S: status } },
    });
    return (result.Items || []).map(itemToVoting);
  } catch { return []; }
}

export async function getAllVotings(): Promise<Voting[]> {
  try {
    const result = await ydbRequest("Scan", { TableName: "votings" });
    return (result.Items || []).map(itemToVoting);
  } catch { return []; }
}

export async function createVoting(data: Omit<Voting, "createdAt" | "updatedAt">): Promise<Voting> {
  const voting: Voting = { ...data, createdAt: now(), updatedAt: now() };
  await ydbRequest("PutItem", { TableName: "votings", Item: votingToItem(voting) });
  return voting;
}

export async function updateVoting(id: string, data: Partial<Pick<Voting, "question" | "options" | "status" | "totalVotes" | "imageUrl" | "allowMultiple">>): Promise<Voting> {
  const voting = await getVotingById(id);
  if (!voting) throw new Error("Voting not found");
  const updated = { ...voting, ...data, updatedAt: now() };
  await ydbRequest("PutItem", { TableName: "votings", Item: votingToItem(updated) });
  return updated;
}

export async function deleteVoting(id: string): Promise<void> {
  await ydbRequest("DeleteItem", { TableName: "votings", Key: { id: { S: id } } });
}

function itemToVoting(item: any): Voting {
  return {
    id: item.id.S,
    question: item.question.S,
    options: JSON.parse(item.options.S),
    status: item.status.S as "active" | "archived",
    totalVotes: Number(item.totalVotes.N || 0),
    imageUrl: item.imageUrl?.S || "",
    allowMultiple: item.allowMultiple?.BOOL || false,
    createdAt: item.createdAt.S,
    updatedAt: item.updatedAt.S,
  };
}

function votingToItem(voting: Voting): any {
  return {
    id: { S: voting.id },
    question: { S: voting.question },
    options: { S: JSON.stringify(voting.options) },
    status: { S: voting.status },
    totalVotes: { N: String(voting.totalVotes) },
    imageUrl: { S: voting.imageUrl || "" },
    allowMultiple: { BOOL: voting.allowMultiple },
    createdAt: { S: voting.createdAt },
    updatedAt: { S: voting.updatedAt },
  };
}

// ---------------------------------------------------------------------------
// VoteRecord
// ---------------------------------------------------------------------------

export interface VoteRecord {
  votingId: string;
  userId: string;
  optionId: string;
  optionText: string;
  createdAt: string;
}

export async function getVoteRecord(votingId: string, userId: string): Promise<VoteRecord | null> {
  try {
    const result = await ydbRequest("GetItem", {
      TableName: "vote-records",
      Key: { votingId: { S: votingId }, userId: { S: userId } },
    });
    if (!result.Item) return null;
    return itemToVoteRecord(result.Item);
  } catch { return null; }
}

export async function getVoteRecordsByVoting(votingId: string): Promise<VoteRecord[]> {
  try {
    const result = await ydbRequest("Query", {
      TableName: "vote-records",
      KeyConditionExpression: "#votingId = :votingId",
      ExpressionAttributeNames: { "#votingId": "votingId" },
      ExpressionAttributeValues: { ":votingId": { S: votingId } },
    });
    return (result.Items || []).map(itemToVoteRecord);
  } catch { return []; }
}

export async function createVoteRecord(data: Omit<VoteRecord, "createdAt">): Promise<VoteRecord> {
  const record: VoteRecord = { ...data, createdAt: now() };
  await ydbRequest("PutItem", { TableName: "vote-records", Item: voteRecordToItem(record) });
  return record;
}

export async function updateVoteRecord(votingId: string, userId: string, data: Pick<VoteRecord, "optionId" | "optionText">): Promise<VoteRecord> {
  const record: VoteRecord = { votingId, userId, ...data, createdAt: now() };
  await ydbRequest("PutItem", { TableName: "vote-records", Item: voteRecordToItem(record) });
  return record;
}

export async function deleteVoteRecord(votingId: string, userId: string): Promise<void> {
  await ydbRequest("DeleteItem", {
    TableName: "vote-records",
    Key: { votingId: { S: votingId }, userId: { S: userId } },
  });
}

function itemToVoteRecord(item: any): VoteRecord {
  return {
    votingId: item.votingId.S,
    userId: item.userId.S,
    optionId: item.optionId.S,
    optionText: item.optionText.S,
    createdAt: item.createdAt.S,
  };
}

function voteRecordToItem(record: VoteRecord): any {
  return {
    votingId: { S: record.votingId },
    userId: { S: record.userId },
    optionId: { S: record.optionId },
    optionText: { S: record.optionText },
    createdAt: { S: record.createdAt },
  };
}

// ---------------------------------------------------------------------------
// Giveaway
// ---------------------------------------------------------------------------

export interface Giveaway {
  id: string;
  status: "idle" | "active" | "drawing" | "complete";
  bannerUrl?: string;
  participants: string[];
  winnerNickname?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getGiveawayById(id: string): Promise<Giveaway | null> {
  try {
    const result = await ydbRequest("GetItem", { TableName: "giveaways", Key: { id: { S: id } } });
    if (!result.Item) return null;
    return itemToGiveaway(result.Item);
  } catch { return null; }
}

export async function getGiveawaysByStatus(status: string): Promise<Giveaway[]> {
  try {
    const result = await ydbRequest("Query", {
      TableName: "giveaways",
      IndexName: "status-index",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": { S: status } },
    });
    return (result.Items || []).map(itemToGiveaway);
  } catch { return []; }
}

export async function getAllGiveaways(): Promise<Giveaway[]> {
  try {
    const result = await ydbRequest("Scan", { TableName: "giveaways" });
    return (result.Items || []).map(itemToGiveaway);
  } catch { return []; }
}

export async function createGiveaway(data: Omit<Giveaway, "createdAt" | "updatedAt">): Promise<Giveaway> {
  const giveaway: Giveaway = { ...data, createdAt: now(), updatedAt: now() };
  await ydbRequest("PutItem", { TableName: "giveaways", Item: giveawayToItem(giveaway) });
  return giveaway;
}

export async function updateGiveaway(id: string, data: Partial<Pick<Giveaway, "status" | "bannerUrl" | "participants" | "winnerNickname">>): Promise<Giveaway> {
  const giveaway = await getGiveawayById(id);
  if (!giveaway) throw new Error("Giveaway not found");
  const updated = { ...giveaway, ...data, updatedAt: now() };
  await ydbRequest("PutItem", { TableName: "giveaways", Item: giveawayToItem(updated) });
  return updated;
}

export async function deleteGiveaway(id: string): Promise<void> {
  await ydbRequest("DeleteItem", { TableName: "giveaways", Key: { id: { S: id } } });
}

function itemToGiveaway(item: any): Giveaway {
  return {
    id: item.id.S,
    status: item.status.S as any,
    bannerUrl: item.bannerUrl?.S || "",
    participants: JSON.parse(item.participants?.S || "[]"),
    winnerNickname: item.winnerNickname?.S || "",
    createdAt: item.createdAt.S,
    updatedAt: item.updatedAt.S,
  };
}

function giveawayToItem(giveaway: Giveaway): any {
  return {
    id: { S: giveaway.id },
    status: { S: giveaway.status },
    bannerUrl: { S: giveaway.bannerUrl || "" },
    participants: { S: JSON.stringify(giveaway.participants) },
    winnerNickname: { S: giveaway.winnerNickname || "" },
    createdAt: { S: giveaway.createdAt },
    updatedAt: { S: giveaway.updatedAt },
  };
}

// ---------------------------------------------------------------------------
// GiveawayWinner
// ---------------------------------------------------------------------------

export interface GiveawayWinner {
  id: string;
  giveawayId: string;
  nickname: string;
  participantsCount: number;
  wonAt: string;
}

export async function getAllGiveawayWinners(): Promise<GiveawayWinner[]> {
  try {
    const result = await ydbRequest("Scan", { TableName: "giveaway-winners" });
    return (result.Items || []).map((i: any) => ({
      id: i.id.S,
      giveawayId: i.giveawayId.S,
      nickname: i.nickname.S,
      participantsCount: Number(i.participantsCount.N || 0),
      wonAt: i.wonAt.S,
    }));
  } catch { return []; }
}

export async function createGiveawayWinner(data: Omit<GiveawayWinner, "wonAt">): Promise<GiveawayWinner> {
  const winner: GiveawayWinner = { ...data, wonAt: now() };
  await ydbRequest("PutItem", {
    TableName: "giveaway-winners",
    Item: {
      id: { S: winner.id },
      giveawayId: { S: winner.giveawayId },
      nickname: { S: winner.nickname },
      participantsCount: { N: String(winner.participantsCount) },
      wonAt: { S: winner.wonAt },
    },
  });
  return winner;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export interface Settings {
  key: string;
  value: string;
  updatedAt: string;
}

export async function getAllSettings(): Promise<Settings[]> {
  try {
    const result = await ydbRequest("Scan", { TableName: "settings" });
    return (result.Items || []).map((i: any) => ({
      key: i.key.S,
      value: i.value.S,
      updatedAt: i.updatedAt.S,
    }));
  } catch { return []; }
}

export async function updateSettings(key: string, value: string): Promise<Settings> {
  const settings: Settings = { key, value, updatedAt: now() };
  await ydbRequest("PutItem", {
    TableName: "settings",
    Item: {
      key: { S: key },
      value: { S: value },
      updatedAt: { S: now() },
    },
  });
  return settings;
}

// заглушки для совместимости
export async function getServiceById() { return null; }
export async function getServicesByStatus() { return []; }
export async function getAllServices() { return []; }
export async function createService(data: any) { return data; }
export async function updateService() { return null; }
export async function deleteService() {}
export async function getSettingsByKey() { return null; }
export async function createSettings(data: any) { return data; }
export async function deleteSettings() {}
export async function getGiveawayWinnerById() { return null; }
export async function deleteGiveawayWinner() {}
