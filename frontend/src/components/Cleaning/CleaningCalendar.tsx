"use client";
import { useState } from 'react';
import { DAYS } from '@/utils/constants';

interface DayProps {
  day: number;
  isToday: boolean;
  hasCleaning: boolean;
  onToggle: () => void;
}

export function CleaningCalendar() {
  const [week, setWeek] = useState(DAYS.map(() => false));

  const toggleCleaning = (dayIndex: number) => {
    const newWeek = [...week];
    newWeek[dayIndex] = !newWeek[dayIndex];
    setWeek(newWeek);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">📅 Расписание уборки</h2>
      <div className="grid grid-cols-7 gap-4">
        {DAYS.map((day, index) => (
          <CleaningDay
            key={day}
            day={index}
            isToday={index === 0} // Понедельник
            hasCleaning={week[index]}
            onToggle={() => toggleCleaning(index)}
          />
        ))}
      </div>
      <button className="mt-8 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all">
        Сохранить расписание
      </button>
    </div>
  );
}

function CleaningDay({ day, isToday, hasCleaning, onToggle }: DayProps) {
  return (
    <div className="text-center p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all group">
      <div className="text-sm font-medium text-gray-300 mb-1">{DAYS[day]}</div>
      <button
        onClick={onToggle}
        className={`w-12 h-12 mx-auto rounded-lg font-bold transition-all ${
          hasCleaning
            ? 'bg-green-500 text-white shadow-lg'
            : isToday
            ? 'bg-yellow-500/50 text-yellow-100'
            : 'bg-transparent border-2 border-white/30 text-gray-400 hover:border-green-500 hover:text-green-400'
        }`}
      >
        {hasCleaning ? '✅' : '○'}
      </button>
    </div>
  );
}
