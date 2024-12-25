'use client';

import React, { useState, useEffect } from "react";
import TodoTable from "@/components/TodoTable";
import Heading from "@/components/Heading";
import TaskForm from "@/components/TaskForm";
import Divider from "@/components/Divider";
import { Table } from "lucide-react";
import { ClipLoader } from "react-spinners"; // Spinner component

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

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

  // Fetch todos from the backend
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true); // Set loading state to true
        const response = await fetch("http://localhost:3400/api/todos/");
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error("Failed to fetch todos:", error);
      } finally {
        setIsLoading(false); // Set loading state to false
      }
    };
    fetchTodos();
  }, []);

  // Handle form submission inside the modal
  const handleFormSubmit = async (newTodo: Todo) => {
    try {
      const response = await fetch("http://localhost:3400/api/todos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });

      const data = await response.json();
      setTodos((prev) => [...prev, data]); // Update the list with the new todo
      setIsModalOpen(false); // Close the modal after submission
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  // Handle deleting a todo
  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:3400/api/todos/${id}/`, {
        method: "DELETE",
      });
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  return (
    <div className="p-10 grid grid-cols-1 md:grid-cols-1 gap-4">
      {/* Left Column: Two Stacked Divs */}
      <div className="flex flex-col space-y-4">
        <div className="pb-2">
          {/* Pass a prop to control the modal */}
          <Heading onOpenModal={() => setIsModalOpen(true)} />
        </div>
        <Divider title="All Tasks"></Divider>

        {isLoading ? (
          // Show spinner while loading
          <div className="flex justify-center items-center py-8">
            <ClipLoader size={50} color="#4A90E2" loading={isLoading} />
          </div>
        ) : (
          // Show TodoTable once loaded
          <TodoTable todos={todos} onDelete={handleDelete} />
        )}
      </div>

      {/* Right Column: Single Div */}
      <div></div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">New SMART Task</h2>
            <TaskForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
