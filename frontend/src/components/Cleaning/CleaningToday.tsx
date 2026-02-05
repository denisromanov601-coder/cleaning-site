// src/components/Cleaning/CleaningToday.tsx
"use client";
import { useState } from 'react';

export function CleaningToday() {
  const [isCompleted, setIsCompleted] = useState(false);

  const markDone = () => {
    setIsCompleted(true);
    setTimeout(() => setIsCompleted(false), 2000); // Сброс через 2 сек
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        🧹 Сегодняшние задачи
        <span className="ml-2 px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm">
          1 задача
        </span>
      </h2>
      
      <div className="space-y-4">
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Уборка ванной</h3>
            <span className="text-green-400 text-sm font-medium">18:00</span>
          </div>
          
          <button
            onClick={markDone}
            disabled={isCompleted}
            className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
              isCompleted
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isCompleted ? '✅ Выполнено!' : '✅ Отметить выполнено'}
          </button>
        </div>
      </div>
    </div>
  );
}
