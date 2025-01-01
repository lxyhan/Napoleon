import { 
  Calendar, 
  Clock, 
  FileText, 
  Tag, 
  Target, 
  Type, 
  CheckCircle2, 
  Trash2,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Todo = {
  id: string;
  name: string;
  dueDate: string;
  description: string;
  estimatedTime: string;
  priority: string;
  goals: string[];
  taskType: string;
  notes: string;
};

interface TodoTableProps {
  todos: Todo[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export default function TodoTable({ todos, onDelete, onComplete, disabled }: TodoTableProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDueDate = (date: string) => {
    const dueDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if overdue
    if (dueDate < today) {
      return {
        text: 'Overdue',
        date: dueDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        }),
        isOverdue: true
      };
    }
    
    // Check if due today
    if (dueDate.toDateString() === today.toDateString()) {
      return {
        text: 'Due',
        date: 'Today',
        isOverdue: false
      };
    }
    
    // Check if due tomorrow
    if (dueDate.toDateString() === tomorrow.toDateString()) {
      return {
        text: 'Due',
        date: 'Tomorrow',
        isOverdue: false
      };
    }
    
    // Default format for other dates
    return {
      text: 'Due',
      date: dueDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      }),
      isOverdue: false
    };
  };


  // Add this function inside your TodoTable component
  const formatEstimatedTime = (minutes: string | number) => {
    if (!minutes) return "Not estimated";
    
    const mins = Number(minutes);
    const hours = Math.floor(mins / 60);
    const remainingMinutes = mins % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  return (
    <div className="mt-8 flow-root">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Task Details
                </th>
                <th className="px-2 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Time & Priority
                </th>
                <th className="px-2 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Categories
                </th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {todos.map((todo) => {
                const dueDate = formatDueDate(todo.dueDate);
                return (
                <tr key={todo.id} className="group hover:bg-gray-50">
                  {/* Task Details Column */}
                  <td className="py-4 pl-4 pr-3 sm:pl-6">
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-gray-900">{todo.name}</div>
                      {todo.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {todo.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Time & Priority Column */}
                  <td className="px-2 py-4">
                    <div className="flex flex-col gap-2">
                      {/* Due Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className={`text-sm ${dueDate.isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {dueDate.text}: {dueDate.date}
                        </span>
                      </div>

                      {/* Estimated Time */}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatEstimatedTime(todo.estimatedTime)}
                        </span>
                      </div>

                      {/* Priority Badge */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                          {todo.priority === 'High' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {todo.priority}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Categories Column */}
                  <td className="px-2 py-4">
                    <div className="flex flex-col gap-2">
                      {/* Task Type */}
                      {todo.taskType && (
                        <div className="flex items-center gap-2">
                          <Type className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{todo.taskType}</span>
                        </div>
                      )}

                      {/* Goals */}
                      {todo.goals && todo.goals.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {todo.goals.map((goal, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                {goal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {todo.notes && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <span className="truncate max-w-[200px]">{todo.notes}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{todo.notes}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="relative py-4 pl-3 pr-4 text-right sm:pr-6">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onComplete(todo.id)}
                              disabled={disabled}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-full hover:bg-green-50"
                            >
                              <span className="sr-only">Complete task</span>
                              <CheckCircle2 className="h-5 w-5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mark as complete</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onDelete(todo.id)}
                              disabled={disabled}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                            >
                              <span className="sr-only">Delete task</span>
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete task</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}