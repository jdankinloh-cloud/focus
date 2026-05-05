import { v4 as uuidv4 } from "uuid";
import type { Task, ChatMessage, AIMode } from "./types";
import { DEFAULT_MODEL, AI_MODELS } from "./types";

const STORAGE_KEY = "focus_state";

const validModelIds = new Set(AI_MODELS.map((m) => m.id));

interface StoredState {
  authenticated: boolean;
  aiMode: AIMode;
  modelId: string;
  tasks: Task[];
  chatMessages: ChatMessage[];
}

export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const modelId = validModelIds.has(parsed.modelId) ? parsed.modelId : DEFAULT_MODEL;
      return { ...parsed, modelId };
    }
  } catch {}
  return {
    authenticated: false,
    aiMode: "companion",
    modelId: DEFAULT_MODEL,
    tasks: [],
    chatMessages: [],
  };
}

export function saveState(state: StoredState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createTask(partial: Partial<Task> & { title: string }): Task {
  let deadline = partial.deadline || null;
  if (deadline && !deadline.includes("+") && !deadline.endsWith("Z") && deadline.includes("T")) {
    deadline = new Date(deadline).toISOString();
  }
  return {
    id: uuidv4(),
    title: partial.title,
    description: partial.description || "",
    status: partial.status || "pending",
    priority: partial.priority || "medium",
    deadline,
    startedAt: partial.startedAt || null,
    completedAt: partial.completedAt || null,
    report: partial.report || null,
    aiVerdict: partial.aiVerdict || null,
    createdAt: new Date().toISOString(),
    category: partial.category || "general",
    estimatedMinutes: partial.estimatedMinutes || null,
  };
}

export function createChatMessage(
  role: ChatMessage["role"],
  content: string
): ChatMessage {
  return {
    id: uuidv4(),
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}
