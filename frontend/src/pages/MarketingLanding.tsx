// src/pages/MarketingLanding.tsx
"use client";
import { useNavigate } from "react-router-dom";

export function MarketingLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white flex items-center justify-center px-4">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Левая колонка: текст и CTA */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Уборка в общаге <span className="text-sky-300">без конфликтов</span>
          </h1>
          <p className="text-lg text-gray-200 mb-6">
            Cleaning App помогает честно распределять дежурства, следить за выполнением задач
            и сохранять порядок в общем пространстве.
          </p>

          <ul className="space-y-3 mb-8 text-gray-100">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              <span>Автоматическое расписание по дням недели для всей комнаты или квартиры.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              <span>Готовый чек‑лист задач: пол, кухня, ванная, мусор и многое другое.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              <span>Прозрачная история уборок — видно, кто и когда дежурил.</span>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/login")} // пока ведём на /login
              className="inline-flex justify-center items-center px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              Начать бесплатно
            </button>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex justify-center items-center px-6 py-3 rounded-xl border border-white/40 bg-white/5 hover:bg-white/10 transition-all font-semibold text-gray-100"
            >
              Уже с нами? Войти
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-300">
            Не нужно ничего устанавливать — работает прямо в браузере.
          </p>
        </div>

        {/* Правая колонка: превью приложения */}
        <div className="relative">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-sky-700/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-6 w-40 h-40 bg-sky-600/25 rounded-full blur-3xl" />

          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-200">Текущая неделя</p>
                <p className="text-lg font-semibold">Расписание дежурств</p>
              </div>
              <span className="px-3 py-1 text-xs rounded-full bg-sky-700/30 text-sky-200 border border-sky-500/60">
                Демо
              </span>
            </div>

            <div className="space-y-2 mb-6">
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day, index) => (
                <div
                  key={day}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10"
                >
                  <span className="text-sm text-gray-100">{day}</span>
                  <span className="text-sm text-sky-200">
                    {index === 1 ? "Вы" : index === 3 ? "Сосед" : "Свободно"}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-sm font-semibold mb-2 text-gray-100">Задачи на сегодня</p>
              <ul className="space-y-1 text-sm text-gray-200">
                <li>• Убрать пол</li>
                <li>• Выкинуть мусор</li>
                <li>• Помыть посуду</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
