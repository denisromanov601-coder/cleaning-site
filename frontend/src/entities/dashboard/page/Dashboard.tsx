import { useEffect, useState } from 'react';
import api from '@/api/client';
import { HeaderDashBoard } from './components/header-dashboard';
import { ContentDashboard } from '../content-dashboard/content-dashboard';
import { useAuth } from '@/app/contexts/AuthContext';

type Building = {
  id: number;
  code: string;
  name: string;
};

type Apartment = {
  id: number;
  number: number;
  building_code: string;
  current_residents: number;
  max_residents: number;
  use_default_tasks?: boolean;
};

type MyApartment = Apartment | null;

type ApartmentMember = {
  user_id: number;
  username: string;
  role: string;
};

type TaskTemplate = {
  id: number;
  name: string;
  description?: string | null;
};

export default function Dashboard() {
  const { user, setUser } = useAuth();

  const [isLoadingApartment, setIsLoadingApartment] = useState(true);
  const [myApartment, setMyApartment] = useState<MyApartment>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [members, setMembers] = useState<ApartmentMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // настройка задач
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [useDefaultTasks, setUseDefaultTasks] = useState<boolean | null>(null);

  const isManager = user?.apartment?.role === 'manager';

  const refreshUser = async () => {
    const res = await api.get('/users/me');
    setUser(res.data);
  };

  const loadMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const res = await api.get<ApartmentMember[]>('/housing/apartments/me/members');
      setMembers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const loadTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const res = await api.get<TaskTemplate[]>('/tasks/templates/me');
      setTemplates(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const loadMyApartment = async () => {
    const res = await api.get<Apartment>('/housing/apartments/me');
    setMyApartment(res.data);
    if (typeof res.data.use_default_tasks === 'boolean') {
      setUseDefaultTasks(res.data.use_default_tasks);
    } else {
      setUseDefaultTasks(true);
    }
  };

  useEffect(() => {
    const fetchMyApartment = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoadingApartment(false);
        return;
      }
      try {
        await loadMyApartment();
        await loadMembers();
        if (isManager) {
          await loadTemplates();
        }
      } catch {
        setMyApartment(null);
      } finally {
        setIsLoadingApartment(false);
      }
    };
    fetchMyApartment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBuildings = async () => {
    try {
      const res = await api.get<Building[]>('/housing/buildings');
      setBuildings(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadApartments = async (code: string) => {
    try {
      const res = await api.get<Apartment[]>(`/housing/buildings/${code}/apartments`);
      setApartments(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectBuilding = async (code: string) => {
    setSelectedBuilding(code);
    await loadApartments(code);
  };

  const handleJoinApartment = async (apartmentId: number) => {
    try {
      if (isMoving) {
        await api.post(`/housing/apartments/${apartmentId}/move`);
      } else {
        await api.post(`/housing/apartments/${apartmentId}/join`);
      }
      await loadMyApartment();
      await loadMembers();
      await refreshUser();
      setIsMoving(false);
      if (isManager) {
        await loadTemplates();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startSelectApartment = async (asMove: boolean) => {
    setIsMoving(asMove);
    setSelectedBuilding(null);
    setApartments([]);
    if (!buildings.length) {
      await loadBuildings();
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    try {
      const res = await api.post<TaskTemplate>('/tasks/templates/me', {
        name: newTemplateName.trim(),
        description: newTemplateDescription.trim() || null,
      });
      setTemplates((prev) => [...prev, res.data]);
      setNewTemplateName('');
      setNewTemplateDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      await api.delete(`/tasks/templates/me/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUseDefaultTasks = async () => {
    if (useDefaultTasks === null) return;
    try {
      const res = await api.post<{ use_default_tasks: boolean }>(
        '/housing/apartments/me/use-default-tasks',
        null,
        {
          params: { use_default: !useDefaultTasks },
        },
      );
      setUseDefaultTasks(res.data.use_default_tasks);
    } catch (err) {
      console.error(err);
    }
  };

  const renderApartmentSelector = () => (
    <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4">
      <p className="text-sm text-gray-200 mb-3">
        {isMoving ? 'Выберите новый дом и квартиру для переселения' : 'Выберите дом и квартиру'}
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {buildings.map((b) => (
          <button
            key={b.code}
            onClick={() => handleSelectBuilding(b.code)}
            className={`px-3 py-2 text-sm rounded-xl border ${
              selectedBuilding === b.code
                ? 'bg-sky-600 text-white border-sky-400'
                : 'bg-white/5 text-gray-100 border-white/20 hover:bg-white/10'
            }`}
          >
            {b.code}
          </button>
        ))}
      </div>
      {selectedBuilding && (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
          {apartments.map((apt) => (
            <button
              key={apt.id}
              onClick={() => handleJoinApartment(apt.id)}
              className="px-2 py-2 text-xs rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 text-gray-100 flex flex-col"
            >
              <span className="font-semibold">№{apt.number}</span>
              <span className="text-[10px] text-gray-300">
                {apt.current_residents}/{apt.max_residents}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <HeaderDashBoard />

      <div className="px-4 pt-4 max-w-6xl mx-auto">
        {/* Блок квартиры */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          {isLoadingApartment ? (
            <p className="text-sm text-gray-300">Загружаем вашу квартиру...</p>
          ) : myApartment ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-300">Ваша квартира</p>
                <p className="text-lg font-semibold">
                  Дом {myApartment.building_code}, кв. {myApartment.number}
                </p>
                <p className="text-xs text-gray-400">
                  Жильцов: {myApartment.current_residents}/{myApartment.max_residents}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startSelectApartment(false)}
                  className="px-4 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/15 border border-white/20"
                >
                  Изменить квартиру
                </button>
                <button
                  onClick={() => startSelectApartment(true)}
                  className="px-4 py-2 text-sm rounded-xl bg-sky-600 hover:bg-sky-700 border border-sky-500"
                >
                  Переселиться
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-300 mb-2">
                Вы ещё не выбрали квартиру. Сначала выберите дом и квартиру.
              </p>
              <button
                onClick={() => startSelectApartment(false)}
                className="px-4 py-2 text-sm rounded-xl bg-sky-600 hover:bg-sky-700 border border-sky-500"
              >
                Выбрать квартиру
              </button>
            </div>
          )}

          {(isMoving || (!myApartment && !isLoadingApartment)) &&
            buildings.length > 0 &&
            renderApartmentSelector()}
        </div>

        {/* Список жильцов */}
        {myApartment && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-300">
                Жильцы квартиры (дом {myApartment.building_code}, кв. {myApartment.number})
              </p>
            </div>
            {isLoadingMembers ? (
              <p className="text-sm text-gray-300">Загружаем жильцов...</p>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-400">Пока никого нет.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {members.map((m) => (
                  <div
                    key={m.user_id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-100">{m.username}</p>
                      <p className="text-xs text-gray-400">
                        {m.role === 'manager' ? 'Ответственный за уборку' : 'Житель'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Настройка задач — только для менеджера */}
        {myApartment && isManager && (
          <div className="bg-white/5 border border-slate-800 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-200">Настройка задач уборки</p>
                <p className="text-xs text-slate-400">
                  Выберите, использовать ли стандартный набор задач или свои шаблоны.
                </p>
              </div>
              {useDefaultTasks !== null && (
                <button
                  type="button"
                  onClick={toggleUseDefaultTasks}
                  className="text-xs rounded-lg border border-slate-600 px-3 py-1 text-slate-200 hover:border-sky-500"
                >
                  {useDefaultTasks ? 'Сейчас: стандартные' : 'Сейчас: свои шаблоны'}
                </button>
              )}
            </div>

            <form
              onSubmit={handleCreateTemplate}
              className="grid grid-cols-1 md:grid-cols-[2fr,3fr,auto] gap-2 mb-4"
            >
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="Название задачи (например, Помыть пол)"
                required
                disabled={useDefaultTasks === true}
              />
              <input
                type="text"
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="Краткое описание (необязательно)"
                disabled={useDefaultTasks === true}
              />
              <button
                type="submit"
                disabled={useDefaultTasks === true}
                className="rounded-lg bg-sky-600 hover:bg-sky-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                Добавить
              </button>
            </form>

            {useDefaultTasks === true ? (
              <p className="text-sm text-slate-400">
                Сейчас используется стандартный набор задач «Генеральная уборка». Чтобы использовать свои
                задачи, переключите режим выше.
              </p>
            ) : isLoadingTemplates ? (
              <p className="text-sm text-slate-300">Загружаем шаблоны задач...</p>
            ) : templates.length === 0 ? (
              <p className="text-sm text-slate-400">
                Пока нет своих шаблонов. Добавьте задачи выше, чтобы они создавались для каждого дня.
              </p>
            ) : (
              <ul className="space-y-2">
                {templates.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800"
                  >
                    <div>
                      <p className="text-sm text-slate-100">{t.name}</p>
                      {t.description && (
                        <p className="text-xs text-slate-400">{t.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(t.id)}
                      className="text-[11px] text-red-300 hover:text-red-200"
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <ContentDashboard />
    </div>
  );
}
