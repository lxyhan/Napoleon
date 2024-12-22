type Todo = {
  id: string;
  name: string;
  dueDate: string;
  description: string;
  estimatedTime: string;
  priority: string;
};

type TodoTableProps = {
  todos: Todo[];
  onDelete: (id: string) => void; // Callback for deleting a todo
};

export default function TodoTable({ todos, onDelete }: TodoTableProps) {
  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
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
                <th className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {todos.map((todo) => (
                <tr key={todo.id}>
                  <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">
                    {todo.name}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                    {todo.dueDate}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                    {todo.description}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                    {todo.estimatedTime}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                    {todo.priority}
                  </td>
                  <td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                    <button
                      onClick={() => onDelete(todo.id)}
                      className="text-red-600 hover:text-red-900"
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
