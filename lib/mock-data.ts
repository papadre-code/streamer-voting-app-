import { Voting, VoteDetail, StreamerSettings, DEFAULT_SETTINGS } from "./data";

export const mockParticipants = [
  { id: "p1", login: "shadow", nickname: "ShadowStriker", server: "5", telegram: "@shadow", discord: "shadow#1234", supportId: "SUP-001", role: "user" as const },
  { id: "p2", login: "fire", nickname: "FireMage", server: "12", telegram: "@firemage", discord: "firemage#5678", supportId: "SUP-002", role: "user" as const },
  { id: "p3", login: "night", nickname: "NightWolf", server: "3", telegram: "@nightwolf", discord: "nightwolf#9012", supportId: "SUP-003", role: "user" as const },
  { id: "p4", login: "ice", nickname: "IceQueen", server: "8", telegram: "@icequeen", discord: "icequeen#3456", supportId: "SUP-004", role: "user" as const },
];

export const mockVotings: Voting[] = [
  {
    id: "v1",
    question: "Какой режим играть дальше?",
    imageUrl: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=80",
    options: [
      { id: "o1", text: "Захват флага", votes: 12, iconUrl: "https://cdn-icons-png.flaticon.com/64/616/616516.png" },
      { id: "o2", text: "Командный бой", votes: 8, iconUrl: "https://cdn-icons-png.flaticon.com/64/616/616408.png" },
      { id: "o3", text: "Королевская битва", votes: 5, iconUrl: "https://cdn-icons-png.flaticon.com/64/616/616430.png" },
    ],
    status: "active" as const,
    totalVotes: 25,
    allowMultiple: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "v2",
    question: "Лучший карт-пул сезона?",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80",
    options: [
      { id: "h1", text: "Забытые руины", votes: 15, iconUrl: "https://cdn-icons-png.flaticon.com/64/3163/3163505.png" },
      { id: "h2", text: "Ледяные пики", votes: 10, iconUrl: "https://cdn-icons-png.flaticon.com/64/3163/3163478.png" },
      { id: "h3", text: "Огненная пропасть", votes: 7, iconUrl: "https://cdn-icons-png.flaticon.com/64/3163/3163490.png" },
    ],
    status: "archived" as const,
    totalVotes: 32,
    allowMultiple: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockVoteDetails: VoteDetail[] = [
  { participantId: "p1", participantNickname: "ShadowStriker", optionId: "o1", optionText: "Захват флага" },
  { participantId: "p2", participantNickname: "FireMage", optionId: "o2", optionText: "Командный бой" },
  { participantId: "p3", participantNickname: "NightWolf", optionId: "o1", optionText: "Захват флага" },
  { participantId: "p4", participantNickname: "IceQueen", optionId: "o3", optionText: "Королевская битва" },
];

export const mockGiveaways = [
  { id: "g1", status: "idle" as const, bannerUrl: "", participants: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const mockSettings: Record<string, string> = {
  title: "Streamer Voting",
  description: "Проводите голосования на стримах в реальном времени.",
  backgroundImageUrl: "",
};
