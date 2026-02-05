import { useEffect, useState } from 'react';
import { Notification } from '@/types/api';
import toast from 'react-hot-toast';

export function useNotifications(userId?: number) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket(`ws://localhost:8000/api/v1/users/ws/${userId}`);

    ws.onopen = () => {
      console.log('🔔 WebSocket подключен');
      toast.success('Подключено к уведомлениям');
    };

    ws.onmessage = (event) => {
      try {
        const data: Notification = JSON.parse(event.data);
        setNotifications((prev) => [data, ...prev.slice(0, 9)]);
        const t = (toast as any)[data.type] || toast;
        t(data.message);
      } catch {
        console.log('Получено не-JSON сообщение:', event.data);
      }
    };

    ws.onclose = () => console.log('🔔 WebSocket отключен');

    return () => ws.close();
  }, [userId]);

  return { notifications, notificationCount: notifications.length };
}
