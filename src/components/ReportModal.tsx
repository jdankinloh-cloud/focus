import { useState } from "react";
import type { Task } from "../lib/types";
import { X, Send, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface ReportModalProps {
  task: Task;
  onSubmit: (taskId: string, report: string) => Promise<{ verdict: string; feedback: string } | null>;
  onClose: () => void;
}

type Stage = "writing" | "loading" | "result";

const verdictConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string; bg: string }> = {
  completed: { icon: CheckCircle2, color: "text-green-600", label: "Выполнено", bg: "bg-green-50 border-green-200" },
  partial: { icon: AlertCircle, color: "text-orange-600", label: "Частично выполнено", bg: "bg-orange-50 border-orange-200" },
  not_completed: { icon: XCircle, color: "text-red-600", label: "Не выполнено", bg: "bg-red-50 border-red-200" },
  reported: { icon: AlertCircle, color: "text-blue-600", label: "На рассмотрении", bg: "bg-blue-50 border-blue-200" },
};

export default function ReportModal({ task, onSubmit, onClose }: ReportModalProps) {
  const [report, setReport] = useState("");
  const [stage, setStage] = useState<Stage>("writing");
  const [result, setResult] = useState<{ verdict: string; feedback: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report.trim()) return;

    setStage("loading");
    const res = await onSubmit(task.id, report.trim());

    if (res) {
      setResult(res);
      setStage("result");
    } else {
      setStage("writing");
    }
  };

  const verdict = result ? verdictConfig[result.verdict] || verdictConfig.reported : null;
  const VerdictIcon = verdict?.icon || AlertCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full max-w-md p-6 shadow-xl animate-float-in max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif-display font-bold text-xl tracking-tight">
            {stage === "writing" ? "Отчёт по задаче" : "Оценка AI"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-700 mb-1 font-medium">{task.title}</p>
        {task.deadline && (
          <p className="text-xs text-gray-500 mb-4">
            Дедлайн: {new Date(task.deadline).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}
          </p>
        )}

        {stage === "writing" && (
          <form onSubmit={handleSubmit}>
            <textarea
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="Опиши что сделал..."
              className="w-full h-28 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none resize-none border border-gray-200 focus:border-gray-400 transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={!report.trim()}
              className="w-full mt-4 bg-black text-white rounded-full py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-30 active:scale-[0.98] transition-transform"
            >
              <Send className="w-4 h-4" />
              Отправить отчёт
            </button>
          </form>
        )}

        {stage === "loading" && (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
            <p className="text-sm text-gray-500">AI оценивает твой отчёт...</p>
            <div className="mt-3 bg-gray-50 rounded-xl px-4 py-3 max-w-xs">
              <p className="text-xs text-gray-400 mb-1">Твой отчёт:</p>
              <p className="text-sm text-gray-700">{report}</p>
            </div>
          </div>
        )}

        {stage === "result" && result && verdict && (
          <div>
            <div className={`rounded-xl border px-4 py-4 mb-4 ${verdict.bg}`}>
              <div className="flex items-center gap-2.5 mb-2">
                <VerdictIcon className={`w-6 h-6 ${verdict.color}`} />
                <span className={`text-base font-semibold ${verdict.color}`}>
                  {verdict.label}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.feedback}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-gray-400 mb-1">Твой отчёт:</p>
              <p className="text-sm text-gray-600">{report}</p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-black text-white rounded-full py-3 text-sm font-medium active:scale-[0.98] transition-transform"
            >
              Понятно
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
