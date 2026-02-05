import api from "@/api/client";
import { useAuth } from "@/app/contexts/AuthContext";
import { Schedule, Task } from "../types/profile";
import { InfoProfile } from "./components/content-profile-info";
import { TasksProfile } from "./components/tasks-profile";

interface Props {
  myDayIndex: number | null;
  schedules: Schedule[];
  loadingTasks: boolean;
  tasks: Task[];
  days: string[];
  loadTasksForDay: (dayIndex: number) => Promise<void>;
}

export const ContentProfile = ({
  myDayIndex,
  schedules,
  loadingTasks,
  tasks,
  days,
  loadTasksForDay,
}: Props) => {
  const { } = useAuth();

  const toggleTask = async (taskId: number) => {
    await api.post(`/tasks/${taskId}/toggle`);
    if (myDayIndex !== null) {
      await loadTasksForDay(myDayIndex);
    }
  };

  return (
    <div className="space-y-6">
      <InfoProfile days={days} myDayIndex={myDayIndex} schedules={schedules} />

      <TasksProfile
        tasks={tasks}
        loadingTasks={loadingTasks}
        onToggleTask={toggleTask}
      />
    </div>
  );
};
