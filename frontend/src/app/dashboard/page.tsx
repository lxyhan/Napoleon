"use client";

import { useState, useEffect } from "react";
import TodoTable from "@/components/TodoTable";

type Todo = {
  id: string;
  name: string;
  dueDate: string;
  description: string;
  estimatedTime: string;
  priority: string;
};

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<Todo>({
    id: "",
    name: "",
    dueDate: "",
    description: "",
    estimatedTime: "",
    priority: "Medium",
  });

  // Fetch todos from the backend
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch("http://localhost:3400/api/todos");
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error("Failed to fetch todos:", error);
      }
    };
    fetchTodos();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTodo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3400/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });

      const data = await response.json();
      setTodos((prev) => [...prev, data]); // Update the list with the new todo
      setNewTodo({
        id: "",
        name: "",
        dueDate: "",
        description: "",
        estimatedTime: "",
        priority: "Medium",
      }); // Reset the form
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  // Handle deleting a todo
  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:3400/api/todos/${id}`, {
        method: "DELETE",
      });
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Form to add a new todo */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            name="name"
            value={newTodo.name}
            onChange={handleInputChange}
            placeholder="Task Name"
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="date"
            name="dueDate"
            value={newTodo.dueDate}
            onChange={handleInputChange}
            placeholder="Due Date"
            className="border rounded px-3 py-2"
            required
          />
          <textarea
            name="description"
            value={newTodo.description}
            onChange={handleInputChange}
            placeholder="Task Description"
            className="border rounded px-3 py-2"
            rows={3}
            required
          />
          <input
            type="text"
            name="estimatedTime"
            value={newTodo.estimatedTime}
            onChange={handleInputChange}
            placeholder="Estimated Time (e.g., 2 hours)"
            className="border rounded px-3 py-2"
            required
          />
          <select
            name="priority"
            value={newTodo.priority}
            onChange={handleInputChange}
            className="border rounded px-3 py-2"
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Add Task
        </button>
      </form>

      {/* Todo Table */}
      <TodoTable todos={todos} onDelete={handleDelete} />
    </div>
  );
}

