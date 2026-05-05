import type { AIMode } from "../lib/types";
import { User, Bell, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  aiMode: AIMode;
  onModeChange: (mode: AIMode) => void;
  onLogout: () => void;
  onSettings: () => void;
}

export default function Header({ aiMode, onModeChange, onLogout, onSettings }: HeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <>
      <div
        className="w-full bg-white rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-sm flex items-center justify-between animate-fade-up"
        style={{ animationDelay: "0s" }}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-black rounded-md flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full" />
              ))}
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-serif-display font-bold tracking-tight">фокус</span>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          <button className="text-gray-900 font-medium text-sm">Задачи</button>
          <button className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Чат</button>
          <button className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Аналитика</button>
        </div>

        <div className="hidden sm:flex items-center gap-4 sm:gap-5">
          <div className="bg-gray-100 rounded-full flex items-center p-0.5">
            <button
              onClick={() => onModeChange("companion")}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                aiMode === "companion"
                  ? "bg-black text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Напарник
            </button>
            <button
              onClick={() => onModeChange("boss")}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                aiMode === "boss"
                  ? "bg-black text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Начальник
            </button>
          </div>

          <div className="w-px h-5 bg-gray-200" />

          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="w-4 h-4 text-gray-500" />
          </button>

          <button
            onClick={onSettings}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-500" />
          </button>

          <button
            onClick={onLogout}
            className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <User className="w-4 h-4 text-white" />
          </button>
        </div>

        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          {mobileMenu ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
        </button>
      </div>

      {mobileMenu && (
        <div className="sm:hidden mt-2 bg-white rounded-2xl shadow-lg p-4 animate-float-in space-y-3">
          <div className="bg-gray-100 rounded-full flex items-center p-0.5">
            <button
              onClick={() => { onModeChange("companion"); setMobileMenu(false); }}
              className={`flex-1 px-3 py-2 rounded-full text-xs text-center transition-all ${
                aiMode === "companion" ? "bg-black text-white" : "text-gray-500"
              }`}
            >
              Напарник
            </button>
            <button
              onClick={() => { onModeChange("boss"); setMobileMenu(false); }}
              className={`flex-1 px-3 py-2 rounded-full text-xs text-center transition-all ${
                aiMode === "boss" ? "bg-black text-white" : "text-gray-500"
              }`}
            >
              Начальник
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { onSettings(); setMobileMenu(false); }}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-50 rounded-xl py-2.5 text-xs text-gray-700 active:bg-gray-100"
            >
              <Settings className="w-4 h-4" />
              Настройки
            </button>
            <button
              onClick={() => { onLogout(); setMobileMenu(false); }}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-50 rounded-xl py-2.5 text-xs text-gray-700 active:bg-gray-100"
            >
              <User className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>
      )}
    </>
  );
}
