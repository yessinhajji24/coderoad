// Les "interfaces" décrivent la forme des données échangées avec l'API.
// TypeScript s'en sert pour détecter les fautes de frappe avant même de lancer le site.

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type LevelStatus = 'done' | 'available' | 'locked';

export interface Level {
  id: number;
  position: number;
  title: string;
  description: string;
  total: number;
  solved: number;
  status: LevelStatus;
}

export interface Exercise {
  id: number;
  levelId: number;
  question: string;
  options: string[];
}

export interface AttemptResult {
  correct: boolean;
  correctIndex: number;
  explanation: string;
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  earned: boolean;
}

export interface Profile {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  attempts: number;
  correct: number;
  solved: number;
  successRate: number;
  points: number;
  levels: Level[];
  badges: Badge[];
}
