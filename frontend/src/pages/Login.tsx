"use client";
import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(formData.username, formData.password);
    if (ok) {
      toast.success('Добро пожаловать!');
      navigate('/dashboard');
    } else {
      toast.error('Ошибка входа');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Заголовок */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
            Cleaning App
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Войдите в аккаунт, чтобы управлять уборками
          </p>
        </div>

        {/* Карточка формы */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Логин
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="Ваш логин"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="Пароль"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-white transition-colors"
            >
              Войти
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-500 text-center">
            <p className="mt-4 text-xs text-slate-500 text-center">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-sky-300 hover:text-sky-200">
                Зарегистрироваться
              </Link>
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-3 py-1.5 text-[11px] text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              В начало
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
