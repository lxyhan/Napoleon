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


type TodoTableProps = {
  todos: Todo[];
  onDelete: (id: string) => void; // Callback for deleting a todo
};

export default function TodoTable({ todos, onDelete }: TodoTableProps) {
  return (
<div className="mt-8 flow-root">
  <div className="overflow-x-auto">
    <div className="inline-block min-w-full py-2 align-middle">
      <table className="min-w-full divide-y divide-gray-300">
      <thead>
        <tr>
          <th className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
            Task Name
          </th>
          <th className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900">
            Due Date
          </th>
          <th className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900">
            Description
          </th>
          <th className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900">
            Estimated Time
          </th>
          <th className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900">
            Priority
          </th>
          <th className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900">
            Goals
          </th>
          <th className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900">
            Task Type
          </th>
          <th className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900">
            Notes
          </th>
          <th className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-gray-900">
            Remove
          </th>
        </tr>
      </thead>

        <tbody className="divide-y divide-gray-200 bg-white">
          {todos.map((todo) => (
            <tr key={todo.id} className="bg-white hover:bg-gray-50">
              {/* Task Name */}
              <td className="whitespace-normal break-words py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {todo.name}
              </td>

              {/* Due Date */}
              <td className="whitespace-normal break-words px-2 py-4 text-sm text-gray-500">
                {new Date(todo.dueDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>

              {/* Description */}
              <td className="whitespace-normal break-words px-2 py-4 text-sm text-gray-500">
                {todo.description || "No description provided"}
              </td>

              {/* Estimated Time */}
              <td className="whitespace-normal break-words px-2 py-4 text-sm text-gray-500">
                {todo.estimatedTime ? `${todo.estimatedTime} hrs` : "Not estimated"}
              </td>

              {/* Priority */}
              <td className="whitespace-normal break-words px-2 py-4 text-sm font-semibold">
                <span
                  className={`px-2 py-1 rounded-full ${
                    todo.priority === "High"
                      ? "bg-red-100 text-red-800"
                      : todo.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {todo.priority}
                </span>
              </td>

              {/* Goals */}
              <td className="whitespace-normal break-words px-2 py-4 text-sm text-gray-500">
                {todo.goals && todo.goals.length > 0
                  ? todo.goals.join(", ")
                  : "No goals assigned"}
              </td>

              {/* Task Type */}
              <td className="whitespace-normal break-words px-2 py-4 text-sm text-gray-500">
                {todo.taskType || "No type specified"}
              </td>

              {/* Notes */}
              <td className="whitespace-normal break-words px-2 py-4 text-sm text-gray-500">
                {todo.notes || "No additional notes"}
              </td>

              {/* Remove Button */}
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button
                  onClick={() => onDelete(todo.id)}
                  className="inline-flex items-center rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Remove
                </button>
              </td>
            </tr>

          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

  );
}
