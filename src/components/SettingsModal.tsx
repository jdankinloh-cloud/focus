import { X, Zap, Shield, Brain, Rocket } from "lucide-react";
import { AI_MODELS, type AIModel } from "../lib/types";

interface SettingsModalProps {
  modelId: string;
  onModelChange: (id: string) => void;
  onClose: () => void;
}

const speedIcon = {
  fast: <Zap className="w-3.5 h-3.5 text-green-500" />,
  medium: <Rocket className="w-3.5 h-3.5 text-yellow-500" />,
  slow: <Brain className="w-3.5 h-3.5 text-orange-500" />,
};

const speedLabel = {
  fast: "Быстрый",
  medium: "Средний",
  slow: "Медленный",
};

const qualityLabel = {
  basic: "Базовое",
  good: "Хорошее",
  best: "Лучшее",
};

const qualityDots = {
  basic: 1,
  good: 2,
  best: 3,
};

export default function SettingsModal({ modelId, onModelChange, onClose }: SettingsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full max-w-md p-6 shadow-xl animate-float-in max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif-display font-bold text-xl tracking-tight">Настройки</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-900">AI Модель</h4>
          </div>
          <p className="text-xs text-gray-400 mb-3">Быстрая = мгновенный ответ. Качественная = глубокий анализ</p>
        </div>

        <div className="space-y-2">
          {AI_MODELS.map((model: AIModel) => {
            const active = modelId === model.id;
            return (
              <button
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className={`w-full text-left rounded-[16px] px-4 py-3 transition-all ${
                  active
                    ? "bg-black text-white shadow-md"
                    : "bg-gray-50 text-gray-900 active:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{model.name}</span>
                  <div className="flex items-center gap-1">
                    {speedIcon[model.speed]}
                    <span className={`text-[10px] ${active ? "text-gray-300" : "text-gray-400"}`}>
                      {speedLabel[model.speed]}
                    </span>
                  </div>
                </div>
                <p className={`text-xs ${active ? "text-gray-400" : "text-gray-500"}`}>
                  {model.description}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className={`text-[10px] ${active ? "text-gray-400" : "text-gray-400"}`}>
                    Качество:
                  </span>
                  {[1, 2, 3].map((dot) => (
                    <div
                      key={dot}
                      className={`w-1.5 h-1.5 rounded-full ${
                        dot <= qualityDots[model.quality]
                          ? active ? "bg-white" : "bg-gray-900"
                          : active ? "bg-gray-600" : "bg-gray-200"
                      }`}
                    />
                  ))}
                  <span className={`text-[10px] ml-1 ${active ? "text-gray-400" : "text-gray-400"}`}>
                    {qualityLabel[model.quality]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">
            Смена модели применяется мгновенно к новым сообщениям
          </p>
        </div>
      </div>
    </div>
  );
}
