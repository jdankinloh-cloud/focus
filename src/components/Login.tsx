import { useState } from "react";

interface LoginProps {
  onLogin: (pin: string) => boolean;
}

export default function Login({ onLogin }: LoginProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(pin)) {
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      const next = pin + d;
      setPin(next);
      setError(false);
      if (next.length === 4) {
        setTimeout(() => {
          if (!onLogin(next)) {
            setError(true);
            setShake(true);
            setTimeout(() => {
              setShake(false);
              setPin("");
            }, 500);
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const dots = Array.from({ length: 4 }, (_, i) => (
    <div
      key={i}
      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
        i < pin.length
          ? error
            ? "bg-red-500 border-red-500"
            : "bg-gray-900 border-gray-900"
          : "border-gray-300"
      }`}
    />
  ));

  const digits = ["1","2","3","4","5","6","7","8","9","","0","del"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div
        className={`w-full max-w-xs animate-fade-up ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
        style={{ animationDelay: "0s" }}
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-white rounded-full" />
                ))}
              </div>
            </div>
            <span className="text-3xl font-serif-display font-bold tracking-tight">фокус</span>
          </div>
          <p className="text-gray-500 text-sm">Введите PIN для входа</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">{dots}</div>

        {error && (
          <p className="text-red-500 text-center text-sm mb-4">Неверный PIN</p>
        )}

        <div className="grid grid-cols-3 gap-3">
          {digits.map((d, i) => {
            if (d === "") return <div key={i} />;
            if (d === "del") {
              return (
                <button
                  key={i}
                  onClick={handleDelete}
                  className="h-14 rounded-full text-gray-500 text-sm flex items-center justify-center active:bg-gray-200 transition-colors"
                >
                  ⌫
                </button>
              );
            }
            return (
              <button
                key={i}
                onClick={() => handleDigit(d)}
                className="h-14 rounded-full bg-white text-gray-900 text-xl font-medium shadow-sm flex items-center justify-center active:bg-gray-100 active:scale-95 transition-all"
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
