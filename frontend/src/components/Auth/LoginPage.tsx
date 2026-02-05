"use client";
import { useState } from 'react';
import { useNavigation } from '@/app/contexts/NavigationContext';
import { useAuth } from '@/app/contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const { navigate } = useNavigation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/login`, formData);
      login(response.data.token, response.data.user);
      navigate('home', response.data.user.id);
    } catch (error) {
      toast.error('Ошибка входа');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Cleaning App</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Логин</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white/30 transition-all"
              placeholder="Ваш логин"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Пароль</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white/30 transition-all"
              placeholder="Пароль"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Войти
          </button>
        </form>
        <p className="text-center mt-6 text-gray-300">
          Нет аккаунта?{' '}
          <button
            onClick={() => navigate('register')}
            className="text-green-400 hover:text-green-300 font-semibold"
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  );
}
