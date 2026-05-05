import { useState, useCallback, useEffect, useRef } from "react";
import type { Task, ChatMessage, AIMode } from "../lib/types";
import { DEFAULT_MODEL, AI_MODELS } from "../lib/types";
import { createTask, createChatMessage } from "../lib/state";
import { sendMessage } from "../lib/ai";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const USER_ID = "00000000-0000-0000-0000-000000000001";

function mapTaskFromDb(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    status: row.status as Task["status"],
    priority: row.priority as Task["priority"],
    deadline: (row.deadline as string) || null,
    startedAt: (row.started_at as string) || null,
    completedAt: (row.completed_at as string) || null,
    report: (row.report as string) || null,
    aiVerdict: (row.ai_verdict as string) || null,
    createdAt: row.created_at as string,
    category: (row.category as string) || "general",
    estimatedMinutes: (row.estimated_minutes as number) || null,
  };
}

function mapMsgFromDb(row: Record<string, unknown>): ChatMessage {
  return {
    id: row.id as string,
    role: row.role as ChatMessage["role"],
    content: row.content as string,
    timestamp: row.created_at as string,
  };
}

export function useAppState() {
  const localStored = (() => {
    try {
      const raw = localStorage.getItem("focus_state");
      if (raw) {
        const parsed = JSON.parse(raw);
        const validModelIds = new Set(AI_MODELS.map((m) => m.id));
        return {
          ...parsed,
          modelId: validModelIds.has(parsed.modelId) ? parsed.modelId : DEFAULT_MODEL,
        };
      }
    } catch {}
    return { authenticated: false, aiMode: "companion" as AIMode, modelId: DEFAULT_MODEL, tasks: [], chatMessages: [] };
  })();

  const [authenticated, setAuthenticated] = useState(localStored.authenticated);
  const [aiMode, setAiMode] = useState<AIMode>(localStored.aiMode);
  const [modelId, setModelId] = useState(localStored.modelId || DEFAULT_MODEL);
  const [tasks, setTasks] = useState<Task[]>(localStored.tasks);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(localStored.chatMessages);
  const [activeView, setActiveView] = useState<"dashboard" | "chat">("dashboard");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(
      "focus_state",
      JSON.stringify({ authenticated, aiMode, modelId, tasks, chatMessages })
    );
  }, [authenticated, aiMode, modelId, tasks, chatMessages]);

  useEffect(() => {
    if (!isSupabaseConfigured() || loadedRef.current) return;
    loadedRef.current = true;
    loadFromSupabase();
  }, []);

  const loadFromSupabase = useCallback(async () => {
    if (!supabase) return;
    setSyncing(true);
    try {
      const [tasksRes, msgsRes, settingsRes] = await Promise.all([
        supabase.from("tasks").select("*").order("created_at", { ascending: false }),
        supabase.from("chat_messages").select("*").order("created_at", { ascending: true }).limit(200),
        supabase.from("user_settings").select("*").eq("user_id", USER_ID).single(),
      ]);

      if (tasksRes.data) setTasks(tasksRes.data.map(mapTaskFromDb));
      if (msgsRes.data) setChatMessages(msgsRes.data.map(mapMsgFromDb));
      if (settingsRes.data) {
        setAiMode((settingsRes.data as Record<string, unknown>).ai_mode as AIMode || "companion");
        const mId = (settingsRes.data as Record<string, unknown>).model_id as string;
        if (mId && new Set(AI_MODELS.map((m) => m.id)).has(mId)) setModelId(mId);
      }
    } catch (e) {
      console.error("Supabase load error:", e);
    } finally {
      setSyncing(false);
    }
  }, []);

  const login = useCallback((pin: string) => {
    if (pin === "7579") {
      setAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuthenticated(false);
  }, []);

  const addTask = useCallback(
    async (partial: Partial<Task> & { title: string }) => {
      const task = createTask(partial);
      setTasks((prev) => [task, ...prev]);
      if (supabase) {
        supabase.from("tasks").insert({
          id: task.id,
          user_id: USER_ID,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
          category: task.category,
          estimated_minutes: task.estimatedMinutes,
        }).then(({ error }) => { if (error) console.error("Supabase insert task error:", error); });
      }
    },
    []
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
      if (supabase) {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
        if (updates.report !== undefined) dbUpdates.report = updates.report;
        if (updates.aiVerdict !== undefined) dbUpdates.ai_verdict = updates.aiVerdict;
        if (updates.startedAt !== undefined) dbUpdates.started_at = updates.startedAt;
        if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
        supabase.from("tasks").update(dbUpdates).eq("id", id)
          .then(({ error }) => { if (error) console.error("Supabase update task error:", error); });
      }
    },
    []
  );

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (supabase) {
      supabase.from("tasks").delete().eq("id", id)
        .then(({ error }) => { if (error) console.error("Supabase delete task error:", error); });
    }
  }, []);

  const sendChatMessage = useCallback(
    async (text: string) => {
      const userMsg = createChatMessage("user", text);
      setChatMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      if (supabase) {
        supabase.from("chat_messages").insert({
          id: userMsg.id,
          user_id: USER_ID,
          role: userMsg.role,
          content: userMsg.content,
        }).then(({ error }) => { if (error) console.error("Supabase insert msg error:", error); });
      }

      try {
        const history = chatMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await sendMessage(text, aiMode, tasks, history, modelId);

        const assistantMsg = createChatMessage("assistant", response.content);
        setChatMessages((prev) => [...prev, assistantMsg]);

        if (supabase) {
          supabase.from("chat_messages").insert({
            id: assistantMsg.id,
            user_id: USER_ID,
            role: assistantMsg.role,
            content: assistantMsg.content,
          }).then(({ error }) => { if (error) console.error("Supabase insert msg error:", error); });
        }

        if (response.action) {
          const a = response.action;
          switch (a.type || a.action) {
            case "create_task": {
              const t = a.task as Partial<Task> & { title: string };
              const task = createTask(t);
              setTasks((prev) => [task, ...prev]);
              if (supabase) {
                supabase.from("tasks").insert({
                  id: task.id, user_id: USER_ID, title: task.title,
                  description: task.description, status: task.status,
                  priority: task.priority, deadline: task.deadline,
                  category: task.category, estimated_minutes: task.estimatedMinutes,
                }).then(({ error }) => { if (error) console.error("Supabase insert error:", error); });
              }
              break;
            }
            case "update_task": {
              if (a.taskId && a.updates) {
                updateTask(a.taskId as string, a.updates as Partial<Task>);
              }
              break;
            }
            case "evaluate_report": {
              if (a.taskId) {
                updateTask(a.taskId as string, {
                  status: (a.verdict === "completed"
                    ? "completed"
                    : a.verdict === "partial"
                      ? "partial"
                      : "reported") as Task["status"],
                  aiVerdict: (a.feedback || a.verdict) as string,
                });
              }
              break;
            }
          }
        }
      } catch (err) {
        const errMsg = createChatMessage("assistant", "Ошибка при обращении к AI. Попробуй ещё раз.");
        setChatMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [aiMode, modelId, tasks, chatMessages, updateTask]
  );

  const reportTask = useCallback(
    async (taskId: string, report: string): Promise<{ verdict: string; feedback: string } | null> => {
      updateTask(taskId, { report, status: "reported" });

      const task = tasks.find((t) => t.id === taskId);
      const msg = `Отчёт по задаче "${task?.title}": ${report}`;

      const userMsg = createChatMessage("user", msg);
      setChatMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      if (supabase) {
        supabase.from("chat_messages").insert({
          id: userMsg.id, user_id: USER_ID, role: userMsg.role, content: userMsg.content,
        }).then(({ error }) => { if (error) console.error("Supabase insert msg error:", error); });
      }

      try {
        const history = chatMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const response = await sendMessage(msg, aiMode, tasks, history, modelId);

        const assistantMsg = createChatMessage("assistant", response.content);
        setChatMessages((prev) => [...prev, assistantMsg]);

        if (supabase) {
          supabase.from("chat_messages").insert({
            id: assistantMsg.id, user_id: USER_ID, role: assistantMsg.role, content: assistantMsg.content,
          }).then(({ error }) => { if (error) console.error("Supabase insert msg error:", error); });
        }

        if (response.action?.action === "evaluate_report") {
          const a = response.action;
          const verdict = (a.verdict as string) || "not_completed";
          const feedback = (a.feedback as string) || response.content;
          updateTask(taskId, {
            status: (verdict === "completed"
              ? "completed"
              : verdict === "partial"
                ? "partial"
                : "reported") as Task["status"],
            aiVerdict: feedback,
            completedAt: verdict === "completed" ? new Date().toISOString() : null,
          });
          return { verdict, feedback };
        }

        return { verdict: "reported", feedback: response.content };
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    [tasks, aiMode, modelId, chatMessages, updateTask]
  );

  const checkOverdue = useCallback(() => {
    const now = new Date();
    setTasks((prev) =>
      prev.map((t) => {
        if (
          t.status !== "completed" &&
          t.deadline &&
          new Date(t.deadline) < now
        ) {
          if (supabase) {
            supabase.from("tasks").update({ status: "overdue" }).eq("id", t.id)
              .then(({ error }) => { if (error) console.error("Supabase overdue error:", error); });
          }
          return { ...t, status: "overdue" as const };
        }
        return t;
      })
    );
  }, []);

  useEffect(() => {
    checkOverdue();
    const interval = setInterval(checkOverdue, 60000);
    return () => clearInterval(interval);
  }, [checkOverdue]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("user_settings").upsert({
      user_id: USER_ID,
      ai_mode: aiMode,
      model_id: modelId,
      updated_at: new Date().toISOString(),
    }).then(({ error }) => { if (error) console.error("Supabase settings error:", error); });
  }, [aiMode, modelId]);

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const completedToday = tasks.filter(
    (t) =>
      t.status === "completed" &&
      t.completedAt &&
      new Date(t.completedAt).toDateString() === new Date().toDateString()
  );
  const overdueTasks = tasks.filter((t) => t.status === "overdue");

  return {
    authenticated,
    aiMode,
    setAiMode,
    modelId,
    setModelId,
    tasks,
    activeTasks,
    completedToday,
    overdueTasks,
    chatMessages,
    activeView,
    setActiveView,
    loading,
    syncing,
    login,
    logout,
    addTask,
    updateTask,
    deleteTask,
    sendChatMessage,
    reportTask,
  };
}
