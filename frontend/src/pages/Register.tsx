"use client";
import { useState } from 'react';
import api from '@/api/client';
import { useAuth } from '@/app/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/users/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      const ok = await login(formData.username, formData.password);
      if (ok) {
        toast.success('Аккаунт создан!');
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        'Не удалось зарегистрироваться, попробуйте ещё раз';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
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
            Создайте аккаунт, чтобы управлять уборками
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
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="you@example.com"
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
                placeholder="Минимум 6 символов"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-white transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Регистрируем...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-500 text-center">
            <p>
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-sky-300 hover:text-sky-200">
                Войти
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
