// src/entities/dashboard/content-dashboard/content-dashboard.tsx
import api from "@/api/client";
import { useAuth } from "@/app/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Schedule, Task } from "../types/dashboard";
import { DaysDashboard } from "./days-dashboard";
import { TasksDashboard } from "./tasks-dashboard";

const DAYS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

export const ContentDashboard = () => {
  const { user } = useAuth();
  const currentUsername = user?.username;

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const loadSchedules = async () => {
    const res = await api.get<Schedule[]>("/schedules/");
    setSchedules(res.data);
  };

  const loadTasksForDay = async (dayIndex: number) => {
    setLoadingTasks(true);
    try {
      const res = await api.get<{ day_of_week: number; tasks: Task[] }>(
        `/tasks/${dayIndex}`,
      );
      setTasks(res.data.tasks);
    } finally {
      setLoadingTasks(false);
    }
  };

  const toggleTask = async (taskId: number) => {
    await api.post(`/tasks/${taskId}/toggle`);
    if (selectedDayIndex !== null) {
      await loadTasksForDay(selectedDayIndex);
    }
  };

  const takeDay = async (scheduleId: number) => {
    await api.post(`/schedules/${scheduleId}/take`);
    await loadSchedules();
    if (selectedDayIndex !== null) {
      await loadTasksForDay(selectedDayIndex);
    }
  };

  const releaseDay = async (scheduleId: number) => {
    await api.post(`/schedules/${scheduleId}/release`);
    await loadSchedules();
    setSelectedDayIndex(null);
    setTasks([]);
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      await loadSchedules();
      setLoading(false);
    };
    init();
  }, []);

  const handleDayClick = async (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    await loadTasksForDay(dayIndex);
  };

  if (loading) {
    return (
      <div className="px-4 max-w-6xl mx-auto pb-10">
        <div className="text-sm text-gray-300">Загружаем данные...</div>
      </div>
    );
  }

  return (
    <div className="px-4 max-w-6xl mx-auto pb-10">
      <DaysDashboard
        days={DAYS}
        schedules={schedules}
        selectedDayIndex={selectedDayIndex}
        onDayClick={handleDayClick}
        onTakeDay={takeDay}
        onReleaseDay={releaseDay}
        currentUsername={currentUsername}
      />

      <TasksDashboard
        tasks={tasks}
        loadingTasks={loadingTasks}
        selectedDayIndex={selectedDayIndex}
        days={DAYS}
        onToggleTask={toggleTask}
      />
    </div>
  );
};
