// src/entities/profile/page/components/header-profile.tsx
import { User } from '@/types/user';
import { Task } from '../../types/profile';

interface Props {
  user: User;
  myDayIndex: number | null;
  tasks: Task[];
  days: string[];
}

export const HeaderProfile = ({ user, myDayIndex , days }: Props) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">@{user.username}</h1>
        <p className="text-sm text-slate-300">{user.email}</p>
        <p className="text-xs text-slate-400 mt-1">
          Всего уборок: <span className="font-semibold">{user.total_cleanings}</span>
        </p>
      </div>
      <div className="text-sm text-slate-300">
        {myDayIndex !== null ? (
          <p>
            Твой день: <span className="font-semibold">{days[myDayIndex]}</span>
          </p>
        ) : (
          <p>У тебя пока нет закреплённого дня уборки</p>
        )}
      </div>
    </div>
  );
};
