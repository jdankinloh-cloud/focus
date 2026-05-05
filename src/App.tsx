import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import { useAppState } from "./hooks/useAppState";
import AddTaskModal from "./components/AddTaskModal";

export default function App() {
  const state = useAppState();
  const [showAddTask, setShowAddTask] = useState(false);

  if (!state.authenticated) {
    return <Login onLogin={state.login} />;
  }

  return (
    <>
      <Dashboard
        aiMode={state.aiMode}
        setAiMode={state.setAiMode}
        modelId={state.modelId}
        setModelId={state.setModelId}
        tasks={state.tasks}
        activeTasks={state.activeTasks}
        completedToday={state.completedToday}
        overdueTasks={state.overdueTasks}
        chatMessages={state.chatMessages}
        activeView={state.activeView}
        setActiveView={state.setActiveView}
        loading={state.loading}
        onLogout={state.logout}
        onSendChat={state.sendChatMessage}
        onReport={state.reportTask}
        onStart={(id) => state.updateTask(id, { status: "in_progress", startedAt: new Date().toISOString() })}
        onDeleteTask={state.deleteTask}
        onAddTask={() => setShowAddTask(true)}
      />
      {showAddTask && (
        <AddTaskModal
          onAdd={state.addTask}
          onClose={() => setShowAddTask(false)}
        />
      )}
    </>
  );
}
