// src/entities/profile/content-profile/components/tasks-profile.tsx
import { Task } from "../../types/profile";

interface TasksProfileProps {
  tasks: Task[];
  loadingTasks: boolean;
  onToggleTask: (taskId: number) => void; // ← добавили
}

export const TasksProfile = ({
  tasks,
  loadingTasks,
  onToggleTask,
}: TasksProfileProps) => {
  if (loadingTasks) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 md:p-5">
        <p className="text-sm text-slate-300">Загружаем задачи...</p>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 md:p-5">
        <p className="text-sm text-slate-400">На сегодня задач нет.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 md:p-5">
      <p className="text-sm text-slate-300 mb-3">Ваши задачи на день</p>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700"
          >
            <button
              onClick={() => onToggleTask(task.id)}
              className="flex items-center gap-3 text-left flex-1"
            >
              <span
                className={`h-4 w-4 rounded-full border ${
                  task.is_done
                    ? "bg-emerald-500 border-emerald-400"
                    : "border-slate-500"
                }`}
              />
              <span
                className={`text-sm ${
                  task.is_done
                    ? "line-through text-slate-400"
                    : "text-slate-100"
                }`}
              >
                {task.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
