import { useAuth } from '@/app/contexts/AuthContext';
import { Link } from 'react-router-dom';

export const HeaderDashBoard = () => {
  const { user, logout } = useAuth();

  return (
    <header className="px-4 pt-4 max-w-6xl mx-auto flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-white">Домашняя панель</h1>
        {user && (
          <p className="text-xs text-slate-300 mt-1">
            Всего уборок: <span className="font-semibold">{user.total_cleanings}</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <Link
            to="/profile"
            className="text-xs text-slate-300 hover:text-white border border-slate-700 rounded-xl px-3 py-1"
          >
            Профиль
          </Link>
        )}
        {user && (
          <button
            onClick={logout}
            className="text-xs text-slate-300 hover:text-white border border-slate-700 rounded-xl px-3 py-1"
          >
            Выйти
          </button>
        )}
      </div>
    </header>
  );
};
