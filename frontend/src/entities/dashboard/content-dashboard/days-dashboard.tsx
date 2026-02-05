import { Schedule } from "../types/dashboard";

interface DaysDashboardProps {
  days: string[];
  schedules: Schedule[];
  selectedDayIndex: number | null;
  onDayClick: (dayIndex: number) => void;
  onTakeDay: (scheduleId: number) => void;
  onReleaseDay: (scheduleId: number) => void;
  currentUsername: string | undefined;
}

export const DaysDashboard = ({
  days,
  schedules,
  selectedDayIndex,
  onDayClick,
  onTakeDay,
  onReleaseDay,
  currentUsername,
}: DaysDashboardProps) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 md:p-5">
      <p className="text-sm text-slate-300 mb-3">День недели</p>
      <div className="flex flex-wrap gap-4">
        {days.map((day, index) => {
          const schedule = schedules.find((s) => s.day_of_week === index);
          const isSelected = selectedDayIndex === index;
          const isTaken = !!schedule?.is_taken;
          const isMine =
            isTaken && schedule?.username === currentUsername;

          const base =
            "px-4 py-2 rounded-xl border text-sm transition-colors w-full";
          let classes = "";

          if (isSelected) {
            classes = "bg-sky-600 border-sky-500 text-white";
          } else if (isTaken) {
            classes = isMine
              ? "bg-emerald-600/30 border-emerald-500 text-emerald-200"
              : "bg-slate-800/80 border-slate-700 text-slate-300";
          } else {
            classes =
              "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700/80";
          }

          return (
            <div key={day} className="w-32 flex flex-col items-stretch">
              <button
                onClick={() => onDayClick(index)}
                className={base + " " + classes}
              >
                {day}
              </button>
              <div className="mt-1 text-[11px] text-center text-slate-400">
                {schedule ? (
                  isTaken ? (
                    isMine ? (
                      <button
                        onClick={() => onReleaseDay(schedule.id)}
                        className="text-sky-300 hover:text-sky-200"
                      >
                        Освободить день
                      </button>
                    ) : (
                      <span>Занято ({schedule.username})</span>
                    )
                  ) : (
                    <button
                      onClick={() => onTakeDay(schedule.id)}
                      className="text-sky-300 hover:text-sky-200"
                    >
                      Занять день
                    </button>
                  )
                ) : (
                  <span>Нет слота</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
