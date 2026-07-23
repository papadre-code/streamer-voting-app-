import { docClient } from "./db";
import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableName, IndexName } from "./schema";

// ---------------------------------------------------------------------------
// Service (legacy demo)
// ---------------------------------------------------------------------------

export interface Service {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "deploying";
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getServiceById(id: string): Promise<Service | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.SERVICES,
      Key: { id },
    })
  );
  return (result.Item as Service) ?? null;
}

export async function getServicesByStatus(status: string): Promise<Service[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.SERVICES,
      IndexName: IndexName.SERVICES_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status },
    })
  );
  return (result.Items as Service[]) ?? [];
}

export async function getAllServices(): Promise<Service[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: TableName.SERVICES })
  );
  return (result.Items as Service[]) ?? [];
}

export async function createService(
  data: Omit<Service, "createdAt" | "updatedAt">
): Promise<Service> {
  const now = new Date().toISOString();
  const service: Service = { ...data, createdAt: now, updatedAt: now };
  await docClient.send(
    new PutCommand({ TableName: TableName.SERVICES, Item: service })
  );
  return service;
}

export async function updateService(
  id: string,
  data: Partial<Pick<Service, "name" | "description" | "status" | "url">>
): Promise<Service> {
  const updateExpr: string[] = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.name !== undefined) {
    updateExpr.push("#name = :name");
    exprValues[":name"] = data.name;
    exprNames["#name"] = "name";
  }
  if (data.description !== undefined) {
    updateExpr.push("#description = :description");
    exprValues[":description"] = data.description;
    exprNames["#description"] = "description";
  }
  if (data.status !== undefined) {
    updateExpr.push("#status = :status");
    exprValues[":status"] = data.status;
    exprNames["#status"] = "status";
  }
  if (data.url !== undefined) {
    updateExpr.push("#url = :url");
    exprValues[":url"] = data.url;
    exprNames["#url"] = "url";
  }
  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.SERVICES,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames: Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );
  return result.Attributes as Service;
}

export async function deleteService(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({ TableName: TableName.SERVICES, Key: { id } })
  );
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
  const result = await docClient.send(
    new GetCommand({ TableName: TableName.USERS, Key: { id } })
  );
  return (result.Item as User) ?? null;
}

export async function getUserByLogin(login: string): Promise<User | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.USERS,
      IndexName: IndexName.USERS_LOGIN,
      KeyConditionExpression: "#login = :login",
      ExpressionAttributeNames: { "#login": "login" },
      ExpressionAttributeValues: { ":login": login },
    })
  );
  return (result.Items?.[0] as User) ?? null;
}

export async function getAllUsers(): Promise<User[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: TableName.USERS })
  );
  return (result.Items as User[]) ?? [];
}

export async function createUser(
  data: Omit<User, "createdAt" | "updatedAt">
): Promise<User> {
  const now = new Date().toISOString();
  const user: User = { ...data, createdAt: now, updatedAt: now };
  await docClient.send(
    new PutCommand({ TableName: TableName.USERS, Item: user })
  );
  return user;
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, "nickname" | "server" | "telegram" | "discord" | "supportId" | "role" | "passwordHash">>
): Promise<User> {
  const updateExpr: string[] = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.nickname !== undefined) {
    updateExpr.push("#nickname = :nickname");
    exprValues[":nickname"] = data.nickname;
    exprNames["#nickname"] = "nickname";
  }
  if (data.server !== undefined) {
    updateExpr.push("#server = :server");
    exprValues[":server"] = data.server;
    exprNames["#server"] = "server";
  }
  if (data.telegram !== undefined) {
    updateExpr.push("#telegram = :telegram");
    exprValues[":telegram"] = data.telegram;
    exprNames["#telegram"] = "telegram";
  }
  if (data.discord !== undefined) {
    updateExpr.push("#discord = :discord");
    exprValues[":discord"] = data.discord;
    exprNames["#discord"] = "discord";
  }
  if (data.supportId !== undefined) {
    updateExpr.push("#supportId = :supportId");
    exprValues[":supportId"] = data.supportId;
    exprNames["#supportId"] = "supportId";
  }
  if (data.role !== undefined) {
    updateExpr.push("#role = :role");
    exprValues[":role"] = data.role;
    exprNames["#role"] = "role";
  }
  if (data.passwordHash !== undefined) {
    updateExpr.push("#passwordHash = :passwordHash");
    exprValues[":passwordHash"] = data.passwordHash;
    exprNames["#passwordHash"] = "passwordHash";
  }
  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.USERS,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames: Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );
  return result.Attributes as User;
}

export async function deleteUser(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({ TableName: TableName.USERS, Key: { id } })
  );
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
  const result = await docClient.send(
    new GetCommand({ TableName: TableName.VOTINGS, Key: { id } })
  );
  return (result.Item as Voting) ?? null;
}

export async function getVotingsByStatus(status: string): Promise<Voting[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.VOTINGS,
      IndexName: IndexName.VOTINGS_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status },
    })
  );
  return (result.Items as Voting[]) ?? [];
}

export async function getAllVotings(): Promise<Voting[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: TableName.VOTINGS })
  );
  return (result.Items as Voting[]) ?? [];
}

export async function createVoting(
  data: Omit<Voting, "createdAt" | "updatedAt">
): Promise<Voting> {
  const now = new Date().toISOString();
  const voting: Voting = { ...data, createdAt: now, updatedAt: now };
  await docClient.send(
    new PutCommand({ TableName: TableName.VOTINGS, Item: voting })
  );
  return voting;
}

export async function updateVoting(
  id: string,
  data: Partial<Pick<Voting, "question" | "options" | "status" | "totalVotes" | "imageUrl" | "allowMultiple">>
): Promise<Voting> {
  const updateExpr: string[] = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.question !== undefined) {
    updateExpr.push("#question = :question");
    exprValues[":question"] = data.question;
    exprNames["#question"] = "question";
  }
  if (data.options !== undefined) {
    updateExpr.push("#options = :options");
    exprValues[":options"] = data.options;
    exprNames["#options"] = "options";
  }
  if (data.status !== undefined) {
    updateExpr.push("#status = :status");
    exprValues[":status"] = data.status;
    exprNames["#status"] = "status";
  }
  if (data.totalVotes !== undefined) {
    updateExpr.push("#totalVotes = :totalVotes");
    exprValues[":totalVotes"] = data.totalVotes;
    exprNames["#totalVotes"] = "totalVotes";
  }
  if (data.imageUrl !== undefined) {
    updateExpr.push("#imageUrl = :imageUrl");
    exprValues[":imageUrl"] = data.imageUrl;
    exprNames["#imageUrl"] = "imageUrl";
  }
  if (data.allowMultiple !== undefined) {
    updateExpr.push("#allowMultiple = :allowMultiple");
    exprValues[":allowMultiple"] = data.allowMultiple;
    exprNames["#allowMultiple"] = "allowMultiple";
  }
  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.VOTINGS,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames: Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );
  return result.Attributes as Voting;
}

export async function deleteVoting(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({ TableName: TableName.VOTINGS, Key: { id } })
  );
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
  const result = await docClient.send(
    new GetCommand({ TableName: TableName.VOTE_RECORDS, Key: { votingId, userId } })
  );
  return (result.Item as VoteRecord) ?? null;
}

export async function getVoteRecordsByVoting(votingId: string): Promise<VoteRecord[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.VOTE_RECORDS,
      KeyConditionExpression: "#votingId = :votingId",
      ExpressionAttributeNames: { "#votingId": "votingId" },
      ExpressionAttributeValues: { ":votingId": votingId },
    })
  );
  return (result.Items as VoteRecord[]) ?? [];
}

export async function createVoteRecord(data: Omit<VoteRecord, "createdAt">): Promise<VoteRecord> {
  const now = new Date().toISOString();
  const record: VoteRecord = { ...data, createdAt: now };
  await docClient.send(
    new PutCommand({ TableName: TableName.VOTE_RECORDS, Item: record })
  );
  return record;
}

export async function updateVoteRecord(votingId: string, userId: string, data: Pick<VoteRecord, "optionId" | "optionText">): Promise<VoteRecord> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.VOTE_RECORDS,
      Key: { votingId, userId },
      UpdateExpression: "set #optionId = :optionId, #optionText = :optionText, createdAt = :createdAt",
      ExpressionAttributeNames: { "#optionId": "optionId", "#optionText": "optionText" },
      ExpressionAttributeValues: { ":optionId": data.optionId, ":optionText": data.optionText, ":createdAt": new Date().toISOString() },
      ReturnValues: "ALL_NEW",
    })
  );
  return result.Attributes as VoteRecord;
}

export async function deleteVoteRecord(votingId: string, userId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({ TableName: TableName.VOTE_RECORDS, Key: { votingId, userId } })
  );
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
  const result = await docClient.send(
    new GetCommand({ TableName: TableName.GIVEAWAYS, Key: { id } })
  );
  return (result.Item as Giveaway) ?? null;
}

export async function getGiveawaysByStatus(status: string): Promise<Giveaway[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.GIVEAWAYS,
      IndexName: IndexName.GIVEAWAYS_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status },
    })
  );
  return (result.Items as Giveaway[]) ?? [];
}

export async function getAllGiveaways(): Promise<Giveaway[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: TableName.GIVEAWAYS })
  );
  return (result.Items as Giveaway[]) ?? [];
}

export async function createGiveaway(data: Omit<Giveaway, "createdAt" | "updatedAt">): Promise<Giveaway> {
  const now = new Date().toISOString();
  const giveaway: Giveaway = { ...data, createdAt: now, updatedAt: now };
  await docClient.send(
    new PutCommand({ TableName: TableName.GIVEAWAYS, Item: giveaway })
  );
  return giveaway;
}

export async function updateGiveaway(id: string, data: Partial<Pick<Giveaway, "status" | "bannerUrl" | "participants" | "winnerNickname">>): Promise<Giveaway> {
  const updateExpr: string[] = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.status !== undefined) {
    updateExpr.push("#status = :status");
    exprValues[":status"] = data.status;
    exprNames["#status"] = "status";
  }
  if (data.bannerUrl !== undefined) {
    updateExpr.push("#bannerUrl = :bannerUrl");
    exprValues[":bannerUrl"] = data.bannerUrl;
    exprNames["#bannerUrl"] = "bannerUrl";
  }
  if (data.participants !== undefined) {
    updateExpr.push("#participants = :participants");
    exprValues[":participants"] = data.participants;
    exprNames["#participants"] = "participants";
  }
  if (data.winnerNickname !== undefined) {
    updateExpr.push("#winnerNickname = :winnerNickname");
    exprValues[":winnerNickname"] = data.winnerNickname;
    exprNames["#winnerNickname"] = "winnerNickname";
  }
  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.GIVEAWAYS,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames: Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );
  return result.Attributes as Giveaway;
}

export async function deleteGiveaway(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({ TableName: TableName.GIVEAWAYS, Key: { id } })
  );
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

export async function getGiveawayWinnerById(id: string): Promise<GiveawayWinner | null> {
  const result = await docClient.send(
    new GetCommand({ TableName: TableName.GIVEAWAY_WINNERS, Key: { id } })
  );
  return (result.Item as GiveawayWinner) ?? null;
}

export async function getAllGiveawayWinners(): Promise<GiveawayWinner[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: TableName.GIVEAWAY_WINNERS })
  );
  return (result.Items as GiveawayWinner[]) ?? [];
}

export async function createGiveawayWinner(data: Omit<GiveawayWinner, "wonAt">): Promise<GiveawayWinner> {
  const now = new Date().toISOString();
  const winner: GiveawayWinner = { ...data, wonAt: now };
  await docClient.send(
    new PutCommand({ TableName: TableName.GIVEAWAY_WINNERS, Item: winner })
  );
  return winner;
}

export async function deleteGiveawayWinner(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({ TableName: TableName.GIVEAWAY_WINNERS, Key: { id } })
  );
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export interface Settings {
  key: string;
  value: string;
  updatedAt: string;
}

export async function getSettingsByKey(key: string): Promise<Settings | null> {
  const result = await docClient.send(
    new GetCommand({ TableName: TableName.SETTINGS, Key: { key } })
  );
  return (result.Item as Settings) ?? null;
}

export async function getAllSettings(): Promise<Settings[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: TableName.SETTINGS })
  );
  return (result.Items as Settings[]) ?? [];
}

export async function createSettings(data: Omit<Settings, "updatedAt">): Promise<Settings> {
  const now = new Date().toISOString();
  const settings: Settings = { ...data, updatedAt: now };
  await docClient.send(
    new PutCommand({ TableName: TableName.SETTINGS, Item: settings })
  );
  return settings;
}

export async function updateSettings(key: string, value: string): Promise<Settings> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.SETTINGS,
      Key: { key },
      UpdateExpression: "set #value = :value, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#value": "value" },
      ExpressionAttributeValues: { ":value": value, ":updatedAt": new Date().toISOString() },
      ReturnValues: "ALL_NEW",
    })
  );
  return result.Attributes as Settings;
}

export async function deleteSettings(key: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({ TableName: TableName.SETTINGS, Key: { key } })
  );
}
