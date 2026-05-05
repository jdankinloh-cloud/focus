import { useState } from "react";
import type { Task } from "../lib/types";
import { X, Plus } from "lucide-react";

interface AddTaskModalProps {
  onAdd: (task: Partial<Task> & { title: string }) => void;
  onClose: () => void;
}

export default function AddTaskModal({ onAdd, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [category, setCategory] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      deadline: deadline || null,
      priority,
      category: category || "general",
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full max-w-md p-6 shadow-xl animate-float-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif-display font-bold text-xl tracking-tight">Новая задача</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название задачи"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-200 focus:border-gray-400 transition-colors"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Дедлайн</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-gray-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Время (мин)</label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="30"
                className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-gray-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Категория</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="работа, учёба, личное..."
              className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-gray-200 focus:border-gray-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Приоритет</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-full text-xs font-medium transition-all ${
                    priority === p
                      ? p === "high"
                        ? "bg-red-500 text-white"
                        : p === "medium"
                          ? "bg-yellow-400 text-gray-900"
                          : "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {p === "low" ? "Низкий" : p === "medium" ? "Средний" : "Высокий"}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full bg-black text-white rounded-full py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-30 active:scale-[0.98] transition-transform"
          >
            <Plus className="w-4 h-4" />
            Создать задачу
          </button>
        </form>
      </div>
    </div>
  );
}
