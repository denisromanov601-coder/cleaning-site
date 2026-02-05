import { Schedule } from "../../types/profile";

interface Props {
  days: string[];
  myDayIndex: number | null;
  schedules: Schedule[];
}

export const InfoProfile = ({ days, myDayIndex, schedules }: Props) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 md:p-5">
      <p className="text-sm text-slate-300 mb-3">Ваш день уборки</p>
      <p className="text-lg font-semibold text-slate-100 mb-4">
        {myDayIndex !== null
          ? days[myDayIndex]
          : "Вы ещё не выбрали день в расписании"}
      </p>

      <p className="text-sm text-slate-300 mb-2">Занятость по дням</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {days.map((day, index) => {
          const schedule = schedules.find((s) => s.day_of_week === index);
          const label = schedule?.username ?? "Свободно";

          return (
            <div
              key={day}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700"
            >
              <span className="text-sm text-slate-100">{day}</span>
              <span className="text-xs text-slate-300">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
