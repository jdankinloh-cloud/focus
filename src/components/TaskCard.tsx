import type { Task } from "../lib/types";
import { Clock, AlertTriangle, Play, ChevronRight, Trash2, MoreHorizontal, CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

interface TaskCardProps {
  task: Task;
  onReport: (taskId: string) => void;
  onStart: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  delay?: number;
}

const statusConfig: Record<
  Task["status"],
  { label: string; color: string; dot: string }
> = {
  pending: { label: "Ожидает", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  in_progress: { label: "В работе", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  reported: { label: "На проверке", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  completed: { label: "Готово", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  partial: { label: "Частично", color: "bg-orange-100 text-orange-700", dot: "bg-orange-400" },
  overdue: { label: "Просрочено", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

const priorityConfig: Record<Task["priority"], { icon: ReactNode; label: string; color: string }> = {
  low: { icon: <Clock className="w-3.5 h-3.5" />, label: "Низкий", color: "text-gray-400" },
  medium: { icon: <Clock className="w-3.5 h-3.5" />, label: "Средний", color: "text-yellow-500" },
  high: { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Срочно", color: "text-red-500" },
};

function formatDeadline(dl: string | null): { text: string; urgent: boolean } {
  if (!dl) return { text: "Без срока", urgent: false };
  const d = new Date(dl);
  if (isNaN(d.getTime())) return { text: "Неверная дата", urgent: false };
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) {
    const absDiff = Math.abs(diff);
    const hours = Math.round(absDiff / 3600000);
    const days = Math.round(absDiff / 86400000);
    if (days >= 1) return { text: `-${days}д`, urgent: true };
    return { text: `-${hours}ч`, urgent: true };
  }
  if (diff < 3600000) return { text: `${Math.ceil(diff / 60000)} мин`, urgent: true };
  if (diff < 86400000) return { text: `${Math.ceil(diff / 3600000)} ч`, urgent: diff < 7200000 };
  return { text: d.toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow", day: "numeric", month: "short" }), urgent: false };
}

export default function TaskCard({ task, onReport, onStart, onDelete, delay = 0 }: TaskCardProps) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const deadline = formatDeadline(task.deadline);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isDone = task.status === "completed";

  return (
    <div
      className={`bg-white rounded-[20px] sm:rounded-[28px] shadow-sm animate-fade-up overflow-hidden ${isDone ? "opacity-60" : ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
            <h3 className={`text-sm sm:text-base font-semibold text-gray-900 truncate ${isDone ? "line-through text-gray-400" : ""}`}>
              {task.title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>
              {status.label}
            </span>
            <div className="relative">
              <button
                onClick={() => { setMenuOpen(!menuOpen); setConfirmDelete(false); }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-36 z-10 animate-float-in">
                  {confirmDelete ? (
                    <div className="px-3 py-2">
                      <p className="text-xs text-gray-500 mb-2">Удалить задачу?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { onDelete(task.id); setMenuOpen(false); }}
                          className="flex-1 bg-red-500 text-white text-xs py-1.5 rounded-lg active:scale-95 transition-transform"
                        >
                          Да
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 bg-gray-100 text-gray-600 text-xs py-1.5 rounded-lg active:scale-95 transition-transform"
                        >
                          Нет
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Удалить
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className={`flex items-center gap-1 ${priority.color}`}>
            {priority.icon}
            {priority.label}
          </span>
          {task.category && task.category !== "general" && (
            <>
              <span className="text-gray-200">·</span>
              <span>{task.category}</span>
            </>
          )}
          <span className="text-gray-200">·</span>
          <span className={deadline.urgent ? "text-red-500 font-medium" : ""}>
            {deadline.text}
          </span>
          {task.estimatedMinutes && (
            <>
              <span className="text-gray-200">·</span>
              <span>~{task.estimatedMinutes} мин</span>
            </>
          )}
        </div>

        {task.report && (
          <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2.5">
            <p className="text-xs text-gray-500 mb-0.5">Отчёт</p>
            <p className="text-sm text-gray-700">{task.report}</p>
            {task.aiVerdict && (
              <div className="mt-1.5 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500">{task.aiVerdict}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {!isDone && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <div className="flex gap-2">
            {task.status === "pending" && (
              <button
                onClick={() => onStart(task.id)}
                className="flex-1 bg-gray-100 text-gray-700 text-xs sm:text-sm px-4 py-2 rounded-full flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform font-medium"
              >
                <Play className="w-3.5 h-3.5" />
                Начать
              </button>
            )}
            {(task.status === "in_progress" ||
              task.status === "reported" ||
              task.status === "partial" ||
              task.status === "overdue") && (
              <button
                onClick={() => onReport(task.id)}
                className="flex-1 bg-black text-white text-xs sm:text-sm px-4 py-2 rounded-full flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform font-medium"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                Написать отчёт
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
