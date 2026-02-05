// src/entities/profile/page/Profile.tsx
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { HeaderProfile } from '@/entities/profile/page/components/header-profile';
import { Schedule, Task } from '../types/profile';
import { ContentProfile } from '../content-profile/content-profile';

const DAYS = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
];

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-200 text-xl">Загружаем профиль...</div>
      </div>
    );
  }

  // индекс дня, который занят текущим пользователем (если есть)
  const myDayIndex = useMemo(() => {
    const mySchedule = schedules.find(
      (s) => s.is_taken && s.username && s.username === user.username,
    );
    return mySchedule ? mySchedule.day_of_week : null;
  }, [schedules, user.username]);

  const loadSchedules = async () => {
    const res = await api.get<Schedule[]>('/schedules/');
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

  // начальная загрузка расписания
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      await loadSchedules();
      setLoading(false);
    };
    load();
  }, []);

  // когда меняется мой день — подгружаем задачи
  useEffect(() => {
    if (myDayIndex === null) {
      setTasks([]);
      return;
    }
    loadTasksForDay(myDayIndex);
  }, [myDayIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-200 text-xl">Загружаем профиль...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 inline-flex items-center text-sm text-slate-300 hover:text-white transition-colors"
          >
            ← Назад к панели
          </button>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 md:p-10">
            <HeaderProfile user={user} myDayIndex={myDayIndex} tasks={tasks} days={DAYS} />

            <ContentProfile
              myDayIndex={myDayIndex}
              schedules={schedules}
              loadingTasks={loadingTasks}
              tasks={tasks}
              days={DAYS}
              loadTasksForDay={loadTasksForDay}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
