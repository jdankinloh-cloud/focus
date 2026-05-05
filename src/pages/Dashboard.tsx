import type { Task, AIMode } from "../lib/types";
import Header from "../components/Header";
import TaskCard from "../components/TaskCard";
import ChatPanel from "../components/ChatPanel";
import QuickActions from "../components/QuickActions";
import ReportModal from "../components/ReportModal";
import SettingsModal from "../components/SettingsModal";
import { useState } from "react";
import { MessageCircle, LayoutDashboard, Plus, CheckCircle2, Clock, AlertTriangle, ListFilter } from "lucide-react";

type TaskFilter = "active" | "completed" | "overdue" | "all";

interface DashboardProps {
  aiMode: AIMode;
  setAiMode: (m: AIMode) => void;
  modelId: string;
  setModelId: (id: string) => void;
  tasks: Task[];
  activeTasks: Task[];
  completedToday: Task[];
  overdueTasks: Task[];
  chatMessages: import("../lib/types").ChatMessage[];
  activeView: "dashboard" | "chat";
  setActiveView: (v: "dashboard" | "chat") => void;
  loading: boolean;
  onLogout: () => void;
  onSendChat: (text: string) => void;
  onReport: (taskId: string, report: string) => Promise<{ verdict: string; feedback: string } | null>;
  onStart: (taskId: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: () => void;
}

const filterConfig: Record<TaskFilter, { label: string; icon: typeof Clock }> = {
  active: { label: "Активные", icon: Clock },
  completed: { label: "Выполненные", icon: CheckCircle2 },
  overdue: { label: "Просроченные", icon: AlertTriangle },
  all: { label: "Все", icon: ListFilter },
};

export default function Dashboard({
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
  onLogout,
  onSendChat,
  onReport,
  onStart,
  onDeleteTask,
  onAddTask,
}: DashboardProps) {
  const [reportTaskId, setReportTaskId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("active");
  const reportTask = tasks.find((t) => t.id === reportTaskId) || null;

  const efficiency = tasks.length
    ? Math.round((completedToday.length / tasks.length) * 100)
    : 0;

  const completedAll = tasks.filter((t) => t.status === "completed");

  const filteredTasks: Task[] = (() => {
    switch (taskFilter) {
      case "active": return activeTasks;
      case "completed": return completedAll;
      case "overdue": return overdueTasks;
      case "all": return tasks;
    }
  })();

  return (
    <div className="min-h-screen relative p-4 sm:p-6 lg:p-8 overflow-x-hidden bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-[1800px] mx-auto">
        <Header aiMode={aiMode} onModeChange={setAiMode} onLogout={onLogout} onSettings={() => setShowSettings(true)} />

        {activeView === "dashboard" && (
          <div className="border-b border-black/10 pb-4 sm:pb-6 mb-4 sm:mb-6 mt-4 sm:mt-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h1 className="text-[22px] sm:text-[36px] lg:text-[42px] font-serif-display font-semibold tracking-tight leading-tight">
                  {aiMode === "boss" ? "Время работать." : "Привет! Что сегодня?"}
                </h1>
              </div>
              <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {filterConfig[taskFilter].label} · {filteredTasks.length}
              </span>
            </div>
          </div>
        )}

        {activeView === "dashboard" && (
          <div className="lg:hidden space-y-3 mb-4 animate-fade-up" style={{ animationDelay: "0.13s" }}>
            <div className="flex items-end gap-3">
              <p className="text-[48px] tracking-[-0.04em] leading-none">{efficiency}%</p>
              <p className="text-xs text-gray-500 pb-2">Текущая эффективность</p>
            </div>

            <div className="bg-white rounded-[16px] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-medium">Статистика дня</h4>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Сегодня</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-base font-medium">{completedToday.length}</p>
                  <p className="text-[10px] text-gray-500">Готово</p>
                </div>
                <div>
                  <p className="text-base font-medium">{overdueTasks.length}</p>
                  <p className="text-[10px] text-gray-500">Просрочено</p>
                </div>
                <div>
                  <p className="text-base font-medium">{efficiency}%</p>
                  <p className="text-[10px] text-gray-500">Эффект.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {(Object.keys(filterConfig) as TaskFilter[]).map((f) => {
                const cfg = filterConfig[f];
                const Icon = cfg.icon;
                const count = f === "active" ? activeTasks.length
                  : f === "completed" ? completedAll.length
                  : f === "overdue" ? overdueTasks.length
                  : activeTasks.length + completedAll.length + overdueTasks.length;
                return (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0 transition-all ${
                      taskFilter === f
                        ? "bg-black text-white"
                        : "bg-white text-gray-600 shadow-sm"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                    <span className={`text-[10px] ${taskFilter === f ? "text-gray-300" : "text-gray-400"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-7">
          <div className="hidden lg:block lg:col-span-3">
            <LeftColumn
              efficiency={efficiency}
              overdue={overdueTasks.length}
              completed={completedToday.length}
              totalCompleted={completedAll.length}
              totalActive={activeTasks.length}
              taskFilter={taskFilter}
              onFilterChange={setTaskFilter}
            />
          </div>

          <div className="lg:col-span-6">
            <div className="lg:w-[85%] xl:w-[85%] 2xl:w-[60%] mx-auto">
              {activeView === "dashboard" ? (
                <CenterColumn
                  tasks={filteredTasks}
                  onReport={(id) => setReportTaskId(id)}
                  onStart={onStart}
                  onDelete={onDeleteTask}
                  onAddTask={onAddTask}
                />
              ) : (
                <div className="h-[calc(100vh-140px)] bg-gray-50 rounded-[20px] sm:rounded-[28px] overflow-hidden shadow-sm">
                  <ChatPanel
                    messages={chatMessages}
                    onSend={onSendChat}
                    aiMode={aiMode}
                    loading={loading}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-3">
            <RightColumn onAction={onSendChat} />
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 px-6 py-2 flex items-center justify-around z-40">
          <button
            onClick={() => setActiveView("dashboard")}
            className={`flex flex-col items-center gap-0.5 py-1 px-6 rounded-xl transition-colors ${activeView === "dashboard" ? "text-black" : "text-gray-400"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">Задачи</span>
          </button>
          <button
            onClick={onAddTask}
            className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center -mt-4 shadow-lg active:scale-90 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveView("chat")}
            className={`flex flex-col items-center gap-0.5 py-1 px-6 rounded-xl transition-colors ${activeView === "chat" ? "text-black" : "text-gray-400"}`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px]">Чат</span>
          </button>
        </div>

        {reportTask && (
          <ReportModal
            task={reportTask}
            onSubmit={onReport}
            onClose={() => setReportTaskId(null)}
          />
        )}

        {showSettings && (
          <SettingsModal
            modelId={modelId}
            onModelChange={setModelId}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
}

function LeftColumn({
  efficiency,
  overdue,
  completed,
  totalCompleted,
  totalActive,
  taskFilter,
  onFilterChange,
}: {
  efficiency: number;
  overdue: number;
  completed: number;
  totalCompleted: number;
  totalActive: number;
  taskFilter: TaskFilter;
  onFilterChange: (f: TaskFilter) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="bg-[#DBECFC] rounded-full px-4 py-2.5 flex items-center gap-3">
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <line x1="2" y1="2" x2="10" y2="10" stroke="#EAB308" strokeWidth="2.5" />
                <line x1="10" y1="2" x2="2" y2="10" stroke="#EAB308" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Мой фокус</p>
            <p className="text-xs text-gray-500">Личные задачи</p>
          </div>
        </div>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <p className="text-[60px] sm:text-[80px] lg:text-[100px] tracking-[-0.04em] leading-none">
          {efficiency}%
        </p>
        <p className="text-sm text-gray-500 mt-1">Текущая эффективность</p>
      </div>

      <div
        className="bg-white rounded-[20px] sm:rounded-[28px] p-5 shadow-sm animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Статистика дня</h4>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
            Сегодня
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-medium">{completed}</p>
            <p className="text-xs text-gray-500">Готово</p>
          </div>
          <div>
            <p className="text-lg font-medium">{overdue}</p>
            <p className="text-xs text-gray-500">Просрочено</p>
          </div>
          <div>
            <p className="text-lg font-medium">{efficiency}%</p>
            <p className="text-xs text-gray-500">Эффект.</p>
          </div>
        </div>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
        <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Фильтр задач</h4>
        <div className="space-y-1">
          {(Object.keys(filterConfig) as TaskFilter[]).map((f) => {
            const cfg = filterConfig[f];
            const Icon = cfg.icon;
            const count = f === "active" ? totalActive
              : f === "completed" ? totalCompleted
              : f === "overdue" ? overdue
              : totalActive + totalCompleted + overdue;
            return (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                  taskFilter === f
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {cfg.label}
                </span>
                <span className={`text-xs ${taskFilter === f ? "text-gray-300" : "text-gray-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CenterColumn({
  tasks,
  onReport,
  onStart,
  onDelete,
  onAddTask,
}: {
  tasks: Task[];
  onReport: (id: string) => void;
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: () => void;
}) {
  return (
    <div className="space-y-4 pb-20">
      {tasks.length === 0 && (
        <div className="text-center py-12 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-gray-400 text-sm mb-4">Нет задач</p>
          <button
            onClick={onAddTask}
            className="bg-black text-white text-sm px-5 py-2.5 rounded-full flex items-center gap-2 mx-auto active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Добавить задачу
          </button>
        </div>
      )}
      {tasks.map((task, i) => (
        <TaskCard
          key={task.id}
          task={task}
          onReport={onReport}
          onStart={onStart}
          onDelete={onDelete}
          delay={0.15 + i * 0.05}
        />
      ))}
    </div>
  );
}

function RightColumn({ onAction }: { onAction: (text: string) => void }) {
  return <QuickActions onAction={onAction} />;
}
