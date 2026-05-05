import { useState, useRef, useEffect } from "react";
import type { ChatMessage, AIMode } from "../lib/types";
import { Send, Mic, User, Bot, Sparkles } from "lucide-react";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  aiMode: AIMode;
  loading: boolean;
}

export default function ChatPanel({ messages, onSend, aiMode, loading }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) return;
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    const recognition = new (SpeechRecognition as new () => SpeechRecognition)();
    recognition.lang = "ru-RU";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  };

  const waveHeights = [8,16,12,28,20,36,42,24,40,16,44,32,48,28,20,36,14,32,22,40,18,30,12,26,16,34,20,38,24,28,16,22,12,20,8];

  return (
    <div className="flex flex-col h-full animate-fade-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="bg-[#DBECFC] rounded-[20px] sm:rounded-[28px] p-6 sm:p-8 w-full max-w-sm">
              <span className="inline-block bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full mb-3">
                Голосовой ввод
              </span>
              <h2 className="text-xl sm:text-2xl font-serif-display font-semibold tracking-tight text-gray-900 mb-4">
                Скажи что нужно сделать!
              </h2>
              <div className="flex items-center justify-center gap-0.5 mb-4">
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    className={`w-0.5 bg-blue-400 rounded-full ${isListening ? "animate-wave" : ""}`}
                    style={{
                      height: `${h * 0.8}px`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
              <button
                onClick={handleVoice}
                className={`w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mx-auto active:scale-90 transition-transform ${isListening ? "ring-2 ring-blue-400" : ""}`}
              >
                <Mic className="w-5 h-5 text-blue-500" />
              </button>
            </div>

            <div className="mt-6 space-y-2 w-full max-w-sm">
              {[
                "Добавь задачу на завтра",
                "Что мне сейчас делать?",
                "Стань начальником",
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => onSend(cmd)}
                  className="w-full text-left bg-white rounded-xl px-4 py-3 shadow-sm text-sm text-gray-700 active:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-black text-white rounded-br-md"
                  : "bg-white text-gray-900 shadow-sm rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-black/10 bg-white p-3 sm:p-4 flex gap-2 items-end"
      >
        <div className="flex-1 flex items-end bg-gray-50 rounded-2xl px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={aiMode === "boss" ? "Отчёт на стол!" : "Что нужно сделать?"}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 py-1"
            disabled={loading}
          />
        </div>
        <button
          type="button"
          onClick={handleVoice}
          className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 active:scale-90 transition-transform ${isListening ? "bg-blue-100" : ""}`}
        >
          <Mic className={`w-4 h-4 ${isListening ? "text-blue-500" : "text-gray-500"}`} />
        </button>
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0 disabled:opacity-30 active:scale-90 transition-transform"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

interface SpeechRecognition {
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
}

interface SpeechRecognitionEvent {
  results: { transcript: string }[][];
}
