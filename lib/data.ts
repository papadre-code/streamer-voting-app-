export interface Participant {
  id: string;
  nickname: string;
  server: string;
  telegram: string;
  discord: string;
  supportId: string;
}

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
  allowMultiple?: boolean;
}

export interface VoteDetail {
  participantId: string;
  participantNickname: string;
  optionId: string;
  optionText: string;
}

export interface StreamerSettings {
  title: string;
  description: string;
  backgroundImageUrl: string;
}

export const DEFAULT_SETTINGS: StreamerSettings = {
  title: "Streamer Voting",
  description: "Проводите голосования на стримах в реальном времени. Регистрируйте участников, создавайте опросы и смотрите результаты.",
  backgroundImageUrl: "",
};
