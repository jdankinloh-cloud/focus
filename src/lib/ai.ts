import type { Task, AIMode } from "./types";

const API_KEY = import.meta.env.VITE_FIREWORKS_API_KEY;
const API_URL = "https://api.fireworks.ai/inference/v1/chat/completions";

function getTimeContext(): string {
  const now = new Date();
  const msk = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
  const hours = msk.getHours();
  const dayName = msk.toLocaleString("ru-RU", { timeZone: "Europe/Moscow", weekday: "long" });
  const dateStr = msk.toLocaleString("ru-RU", { timeZone: "Europe/Moscow", day: "numeric", month: "long" });
  const timeStr = msk.toLocaleString("ru-RU", { timeZone: "Europe/Moscow", hour: "2-digit", minute: "2-digit" });

  let period: string;
  if (hours >= 5 && hours < 9) period = "раннее утро — хорошее время для планирования";
  else if (hours >= 9 && hours < 12) period = "утро — пик продуктивности, время для сложных задач";
  else if (hours >= 12 && hours < 14) period = "полдень — можно доделать начатое, но скоро обед";
  else if (hours >= 14 && hours < 17) period = "после обеда — вторая волна, но может быть сонливость";
  else if (hours >= 17 && hours < 20) period = "вечер — подводи итоги дня, закрывай задачи";
  else if (hours >= 20 && hours < 23) period = "поздний вечер — время отдыха и лёгких дел";
  else period = "ночь — СПО! Пора спать, не работай!";

  const isWeekend = msk.getDay() === 0 || msk.getDay() === 6;

  return `${dayName}, ${dateStr}, ${timeStr} (МСК, UTC+3)\nПериод: ${period}${isWeekend ? "\nСегодня выходной" : "\nСегодня рабочий день"}`;
}

function buildSystemPrompt(mode: AIMode, tasks: Task[]): string {
  const timeContext = getTimeContext();
  const mskNow = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });

  const taskSummary = tasks
    .filter((t) => t.status !== "completed")
    .map((t) => {
      let line = `- [${t.status}] "${t.title}"`;
      if (t.deadline) {
        const dl = new Date(t.deadline);
        const diffMs = dl.getTime() - Date.now();
        const diffH = Math.round(diffMs / 3600000);
        const diffM = Math.round(diffMs / 60000);
        const dlMsk = dl.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
        if (diffMs < 0) line += ` (ПРОСРОЧЕНО на ${Math.abs(diffH)}ч)`;
        else if (diffH < 1) line += ` (через ${diffM} мин, дедлайн ${dlMsk})`;
        else line += ` (через ${diffH}ч, дедлайн ${dlMsk})`;
      }
      if (t.priority === "high") line += " ВАЖНО";
      if (t.estimatedMinutes) line += ` ~${t.estimatedMinutes}мин`;
      return line;
    })
    .join("\n");

  const completedCount = tasks.filter(t => t.status === "completed").length;

  const base = `Ты — AI-ассистент "Фокус", персональный помощник продуктивности.

⏰ ВРЕМЯ: ${timeContext}
Выполнено задач сегодня: ${completedCount}

📋 ТЕКУЩИЕ ЗАДАЧИ:
${taskSummary || "Нет активных задач."}

Ты можешь:
1. Создавать задачи — когда пользователь просит, создай задачу. Ответь в формате JSON блоком: \`\`\`json\n{"action":"create_task","task":{"title":"...","description":"...","deadline":"ISO date или null","priority":"low|medium|high","category":"...","estimatedMinutes":число или null}}\n\`\`\`
2. Оценивать отчёты — когда пользователь пишет отчёт о выполнении: \`\`\`json\n{"action":"evaluate_report","taskId":"id","verdict":"completed|partial|not_completed","feedback":"..."}\n\`\`\`
3. Давать советы по таймингу — когда спрашивают что делать, учитывай СЕЙЧАСШЕЕ ВРЕМЯ МСК, период дня, сколько осталось до дедлайнов
4. Мотивировать и дефомин — обычным текстом, давай советы по режиму работа/отдых
5. Просто общаться — если нет запроса на действие, общайся естественно

Важно: JSON блоки пиши ТОЛЬКО когда действительно нужно создать задачу или оценить отчёт. В остальных случаях отвечай обычным текстом на русском.

Важно: ВСЕГДА учитывай текущее московское время. Если ночь — говори спать. Если утро — подсказывай с чего начать. Если скоро дедлайн — предупреждай. Если день — проверяй прогресс.`;

  if (mode === "boss") {
    return `${base}

Ты сейчас в режиме "Начальник". Ты строгий, требовательный, как реальный руководитель. Ты:
- Требуешь отчёты в срок, без отговорок
- Жёстко спрашиваешь "Где результат?"
- Ставишь жёсткие дедлайны
- Говоришь прямо и без сантиментов
- Хвалишь ТОЛЬКО за реально выполненную работу
- Если задача просрочена — требуешь объяснений немедленно
- Используешь "ты" и говоришь как руководитель, а не как бот
- Дефомин: разрешаешь перерыв ТОЛЬКО после выполненной задачи, и то 5 минут максимум`;
  }

  return `${base}

Ты сейчас в режиме "Напарник". Ты дружелюбный, поддерживающий друг. Ты:
- Помогаешь разобраться и подумать вместе
- Поддерживаешь, когда тяжело
- Предлагаешь варианты, не давишь
- Хвалишь за прогресс, даже маленький
- Думаешь вместе, рассуждаешь
- Даёшь советы по отдыху и перерывам (помодоро 25/5 и тд)
- Общаешься как друг, на "ты"`;
}

export interface AIResponse {
  content: string;
  action?: {
    action: string;
    [key: string]: unknown;
  };
}

export async function sendMessage(
  userMessage: string,
  mode: AIMode,
  tasks: Task[],
  chatHistory: { role: string; content: string }[],
  modelId: string
): Promise<AIResponse> {
  const systemPrompt = buildSystemPrompt(mode, tasks);

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...chatHistory.slice(-20).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content: string =
    data.choices?.[0]?.message?.content || "Не удалось получить ответ";

  let action: AIResponse["action"];
  try {
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.action) {
        action = parsed;
        const textContent = content.replace(/```json[\s\S]*?```/, "").trim();
        return {
          content: textContent || parsed.feedback || `Действие: ${parsed.action}`,
          action,
        };
      }
    }
  } catch {}

  return { content };
}
