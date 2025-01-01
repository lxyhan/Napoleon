type ScheduleTask = {
  id: string;
  name: string;
  dueDate: string;
  description?: string;
};

type ScheduleEvent = {
  id: string;
  summary: string;
  start: { dateTime: string };
  description?: string;
};

interface ScheduleTableProps {
  tasks: ScheduleTask[];
  events: ScheduleEvent[];
  onCompleteTask?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
  disabled?: boolean;
}

export default function ScheduleTable({ 
  tasks, 
  events, 
  onCompleteTask, 
  onDeleteTask,
  disabled 
}: ScheduleTableProps) {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Combine and sort schedule items
  const scheduleItems = [
    ...tasks.map(task => ({
      id: task.id,
      title: task.name,
      time: task.dueDate,
      description: task.description,
      isTask: true as const
    })),
    ...events.map(event => ({
      id: event.id,
      title: event.summary,
      time: event.start.dateTime,
      description: event.description,
      isTask: false as const
    }))
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div className="mt-4 flow-root">
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Time</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Title</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
            <th className="relative py-3.5 pl-3 pr-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {scheduleItems.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                {formatTime(item.time)}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                {item.title}
              </td>
              <td className="px-3 py-4 text-sm text-gray-500 max-w-md truncate">
                {item.description || 'No description'}
              </td>
              <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium">
                {item.isTask && (
                  <div className="space-x-2">
                    <button
                      onClick={() => onCompleteTask?.(item.id)}
                      disabled={disabled}
                      className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-sm font-medium text-green-800 hover:bg-green-200 disabled:opacity-50"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => onDeleteTask?.(item.id)}
                      disabled={disabled}
                      className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-sm font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}