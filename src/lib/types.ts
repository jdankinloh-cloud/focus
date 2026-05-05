export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "reported" | "completed" | "partial" | "overdue";
  priority: "low" | "medium" | "high";
  deadline: string | null;
  startedAt: string | null;
  completedAt: string | null;
  report: string | null;
  aiVerdict: string | null;
  createdAt: string;
  category: string;
  estimatedMinutes: number | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export type AIMode = "companion" | "boss";

export interface AIModel {
  id: string;
  name: string;
  speed: "fast" | "medium" | "slow";
  quality: "basic" | "good" | "best";
  description: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: "accounts/fireworks/models/glm-5p1",
    name: "GLM 5.1",
    speed: "fast",
    quality: "good",
    description: "Быстрый и гибкий. Отличный русский, хороший для задач",
  },
  {
    id: "accounts/fireworks/models/glm-5",
    name: "GLM 5",
    speed: "fast",
    quality: "good",
    description: "Быстрый. Хорошая логика и русский язык",
  },
  {
    id: "accounts/fireworks/models/kimi-k2p6",
    name: "Kimi K2.6",
    speed: "medium",
    quality: "best",
    description: "Баланс скорости и глубины. Мультимодальный",
  },
  {
    id: "accounts/fireworks/models/kimi-k2p5",
    name: "Kimi K2.5",
    speed: "medium",
    quality: "best",
    description: "Глубокий анализ. Мультимодальный",
  },
  {
    id: "accounts/fireworks/models/deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    speed: "slow",
    quality: "best",
    description: "Максимум качества. 1M контекст, лучший анализ",
  },
  {
    id: "accounts/fireworks/models/minimax-m2p7",
    name: "MiniMax M2.7",
    speed: "medium",
    quality: "good",
    description: "Хороший баланс. 196K контекст",
  },
];

export const DEFAULT_MODEL = AI_MODELS[0].id;

export interface AppState {
  authenticated: boolean;
  aiMode: AIMode;
  modelId: string;
  tasks: Task[];
  chatMessages: ChatMessage[];
  activeView: "dashboard" | "chat";
}
