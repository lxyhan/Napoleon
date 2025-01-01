'use client';

import React, { useState, useEffect } from "react";
import TodoTable from "@/components/TodoTable";
import Heading from "@/components/Heading";
import TaskForm from "@/components/TaskForm";
import Divider from "@/components/Divider";
import { ClipLoader } from "react-spinners";
import { Clock } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [completionTimes, setCompletionTimes] = useState({
    startTime: new Date(),
    endTime: new Date(Date.now() + 30 * 60000) // Default to 30 minutes later
  });

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

  // Modify other handlers to be disabled during scheduling
  const handleFormSubmit = async (newTodo: Todo) => {
    if (isScheduling) return; // Prevent submission during scheduling
    try {
      const response = await fetch("http://localhost:3400/api/todos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });

      const data = await response.json();
      setTodos((prev) => [...prev, data]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };


  // Handle deleting a todo
  const handleDelete = async (id: string) => {
    if (isScheduling) return; // Prevent deletion during scheduling
    try {
      await fetch(`http://localhost:3400/api/todos/delete/${id}`, {
        method: "DELETE",
      });
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };


  const handleReschedule = async () => {
    try {
      setIsScheduling(true); // Start loading
      const response = await fetch(`http://localhost:3400/api/todos/reschedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reschedule tasks. Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Fetch updated todos after rescheduling
      const updatedTodosResponse = await fetch("http://localhost:3400/api/todos/");
      const updatedTodos = await updatedTodosResponse.json();
      setTodos(updatedTodos);
      
    } catch (error) {
      console.error("Error rescheduling tasks:", error);
    } finally {
      setIsScheduling(false); // End loading
    }
  };

  // Enhanced complete modal opening handler
  const openCompleteModal = (id: string) => {
    if (isScheduling) return; // Prevent opening modal during scheduling
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setSelectedTodo(todo);
      setSelectedTodoId(id);
      
      const now = new Date();
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);
      
      setCompletionTimes({
        startTime: now,
        endTime: thirtyMinutesLater
      });
      
      setIsCompleteModalOpen(true);
    }
  };

  // Enhanced completion handler
  const handleComplete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!selectedTodoId) {
      alert("No task selected to mark as complete.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3400/api/todos/complete/${selectedTodoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startTime: completionTimes.startTime.toISOString(),
            endTime: completionTimes.endTime.toISOString()
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark todo as complete: ${response.statusText}`);
      }

      setTodos((prev) => prev.filter((todo) => todo.id !== selectedTodoId));
      setIsCompleteModalOpen(false);
      setSelectedTodoId(null);
      setSelectedTodo(null);
    } catch (error) {
      console.error(`Failed to mark todo as complete:`, error);
    }
  };

  // Helper for time adjustment
  const adjustTime = (type: 'start' | 'end', adjustment: number) => {
    setCompletionTimes(prev => {
      const newTimes = { ...prev };
      const timeToAdjust = type === 'start' ? 'startTime' : 'endTime';
      const currentTime = new Date(prev[timeToAdjust]);
      currentTime.setMinutes(currentTime.getMinutes() + adjustment);
      
      // If adjusting start time, ensure end time is still later
      if (type === 'start' && currentTime > prev.endTime) {
        newTimes.endTime = new Date(currentTime.getTime() + 30 * 60000);
      }
      
      // If adjusting end time, ensure it's after start time
      if (type === 'end' && currentTime < prev.startTime) {
        return prev;
      }
      
      newTimes[timeToAdjust] = currentTime;
      return newTimes;
    });
  };

  return (
    <div className={`p-10 grid grid-cols-1 md:grid-cols-1 gap-4 ${isScheduling ? 'pointer-events-none opacity-50' : ''}`}>
      <div className="flex flex-col space-y-4">
        <div className="pb-2 pointer-events-auto">
          <Heading 
            onScheduleAll={handleReschedule} 
            onOpenModal={() => !isScheduling && setIsModalOpen(true)}
            isScheduling={isScheduling}
          />
        </div>
        <Divider title="All Tasks" />

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <ClipLoader size={50} color="#4A90E2" loading={isLoading} />
          </div>
        ) : (
          <TodoTable 
            todos={todos} 
            onComplete={openCompleteModal} 
            onDelete={handleDelete}
            disabled={isScheduling}  // Add this prop to your TodoTable component
          />
        )}
      </div>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">New Task</h2>
            <TaskForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsModalOpen(false)}
              disabled={isScheduling}  // Add this prop to your TaskForm component
            />
          </div>
        </div>
      )}

    {/* Complete Task Modal */}
    {isCompleteModalOpen && selectedTodo && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Complete Task</h2>
            <p className="text-gray-600">{selectedTodo.name}</p>
          </div>

          <form onSubmit={handleComplete} className="space-y-6">
            {/* Start Time Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                When did you start?
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => adjustTime('start', -15)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  -15m
                </button>
                <div className="flex-1 text-center">
                  <div className="text-lg font-medium">
                    {completionTimes.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {completionTimes.startTime.toLocaleDateString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => adjustTime('start', 15)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  +15m
                </button>
              </div>
            </div>

            {/* End Time Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                When did you finish?
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => adjustTime('end', -15)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  -15m
                </button>
                <div className="flex-1 text-center">
                  <div className="text-lg font-medium">
                    {completionTimes.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {completionTimes.endTime.toLocaleDateString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => adjustTime('end', 15)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  +15m
                </button>
              </div>
            </div>

            {/* Duration Display */}
            <div className="text-center text-sm text-gray-500">
              Duration: {Math.round((completionTimes.endTime.getTime() - completionTimes.startTime.getTime()) / 60000)} minutes
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsCompleteModalOpen(false);
                  setSelectedTodo(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
              >
                Complete Task
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    </div>
  );
}
