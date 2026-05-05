import { Plus } from "lucide-react";

interface QuickActionsProps {
  onAction: (text: string) => void;
}

const actions = [
  { label: "Добавь задачу на сегодня", icon: "📝" },
  { label: "Что мне сейчас делать?", icon: "🎯" },
  { label: "Режим работы 25/5", icon: "⏱" },
  { label: "Стань начальником", icon: "👔" },
  { label: "Стань напарником", icon: "🤝" },
  { label: "Мой прогресс", icon: "📊" },
];

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.5s" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs">
            ⚡
          </span>
          <h3 className="text-lg sm:text-xl tracking-[-0.04em] font-medium">
            Быстрые команды
          </h3>
        </div>
        <button className="text-xs text-gray-500 flex items-center gap-1">
          <Plus className="w-3 h-3" />
          Добавить
        </button>
      </div>

      <div className="bg-white rounded-[20px] sm:rounded-[28px] shadow-sm overflow-hidden">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={() => onAction(a.label)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 border-t border-black/10 first:border-t-0 active:bg-gray-50 transition-colors"
          >
            <span className="text-base">{a.icon}</span>
            <span className="flex-1">{a.label}</span>
            <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-l-[5px] border-l-white border-y-[3px] border-y-transparent ml-0.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
