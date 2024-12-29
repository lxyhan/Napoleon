'use client';

import { useEffect, useState } from 'react';
import GenericHeading from '@/components/GenericHeading';
import { Divider } from '@/components/catalyst/divider';

export default function Profile() {
  interface Task {
    task_id: string;
    name: string;
    priority: 'High' | 'Medium' | 'Low';
    timeSlot: string;
    description?: string;
  }

  const [tasks, setTasks] = useState<Task[]>([]); // State for today's tasks
  const [sortBy, setSortBy] = useState('priority'); // Sorting state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTodaysTasks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3400/api/today/'); // Call the backend API
        const data = await response.json();
  
        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks); // Update tasks only if it's an array
        } else {
          console.error('Invalid tasks format in API response:', data.tasks);
          setTasks([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error('Error fetching today’s tasks:', error);
        setTasks([]); // Fallback to an empty array
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTodaysTasks();
  }, []);
  

  // Sorting function
  const sortedTasks = Array.isArray(tasks) ? [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityMap = { High: 1, Medium: 2, Low: 3 }; // Priority mapping
      return priorityMap[a.priority] - priorityMap[b.priority];
    } else if (sortBy === 'time') {
      return a.timeSlot.localeCompare(b.timeSlot); // Compare time slots
    }
    return 0;
  }) : []; // Fallback to an empty array
  

  return (
    <div className="p-10">
    {/* Heading and Divider */}
    <GenericHeading Heading="Today's Tasks" />
    <Divider className="my-10" />

    {/* Two-Column Layout */}
    <div className="grid grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="col-span-2 space-y-8">
        {/* Todos Table */}
        <div>
            <h2 className="text-lg font-semibold mb-4">Todos</h2>
            <Divider className="mb-4" />
            {isLoading ? (
            <p className="text-gray-500">Loading...</p>
            ) : tasks.length === 0 ? (
            <p className="text-gray-500">No tasks scheduled for today.</p>
            ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-300">
                <thead className="text-left text-gray-900">
                    <tr>
                    <th className="py-3">Task Name</th>
                    <th className="py-3">Priority</th>
                    <th className="py-3">Scheduled Time</th>
                    <th className="py-3">Description</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {sortedTasks.map((task) => (
                    <tr key={task.task_id}>
                        <td className="py-4 text-gray-900">{task.name}</td>
                        <td className="py-4 text-gray-500">{task.priority}</td>
                        <td className="py-4 text-gray-500">{task.timeSlot}</td>
                        <td className="py-4 text-gray-500">{task.description || 'No description'}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}
        </div>


        {/* Message Section */}
        <div>
            <h2 className="text-lg font-semibold mb-4">Message</h2>
            <Divider className="mb-4" />
            <p className="text-gray-500 text-sm">This is a space for any additional information or notes.</p>
        </div>
        </div>

        {/* Divider Between Columns (For Mobile View) */}
        <Divider className="my-6 md:hidden" />

        {/* Right Column: Calendar Placeholder */}
        <div>
        <h2 className="text-lg font-semibold mb-4">Calendar</h2>
        <Divider className="mb-4" />
        <p className="text-gray-500 text-sm">This space is reserved for the calendar setup.</p>
        </div>
    </div>
    </div>

  
  );
}
