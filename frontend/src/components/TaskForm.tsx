import { useState } from "react";

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

export default function TaskForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (newTodo: Todo) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    dueDate: "",
    description: "",
    estimatedTime: "",
    priority: "Medium",
    goals: [] as string[],
    taskType: "",
    notes: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoalsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGoals = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, goals: selectedGoals }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string | null } = {};

    // Validate task name
    if (!formData.name.trim()) {
      newErrors.name = "Task name is required.";
    }

    // Validate due date
    if (!formData.dueDate.trim()) {
      newErrors.dueDate = "Due date is required.";
    }

    // Validate description
    if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters long.";
    }

    // Validate estimated time
    if (!formData.estimatedTime.trim()) {
      newErrors.estimatedTime = "Estimated time is required.";
    } else if (Number(formData.estimatedTime) <= 0) {
      newErrors.estimatedTime = "Estimated time must be greater than 0.";
    }

    // Validate priority
    if (!formData.priority.trim()) {
      newErrors.priority = "Priority is required.";
    }

    // Validate goals
    if (formData.goals.length === 0) {
      newErrors.goals = "Please select at least one goal.";
    }

    // Validate task type
    if (!formData.taskType.trim()) {
      newErrors.taskType = "Task type is required.";
    }

    setErrors(newErrors);

    // Return true if there are no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ id: "", ...formData }); // Pass the new todo to the parent
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 border-b border-gray-200 pb-4">
        <p className="text-sm text-gray-600">
          Fill out the details of the task you want to create.
        </p>
      </div>

      {/* Task Name */}
      <div className="sm:col-span-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Task Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="focus:outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter task name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Due Date */}
      <div className="sm:col-span-4">
        <label
          htmlFor="dueDate"
          className="block text-sm font-medium text-gray-700"
        >
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className="focus:outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
      </div>

      {/* Description */}
      <div className="col-span-full">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="focus:outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Write a short description of the task"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Estimated Time */}
      <div className="sm:col-span-4">
        <label
          htmlFor="estimatedTime"
          className="block text-sm font-medium text-gray-700"
        >
          Estimated Time (in hours)
        </label>
        <input
          type="number"
          id="estimatedTime"
          name="estimatedTime"
          value={formData.estimatedTime}
          onChange={handleChange}
          className="focus:outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., 2.5"
          min="0"
        />
        {errors.estimatedTime && (
          <p className="mt-1 text-sm text-red-600">{errors.estimatedTime}</p>
        )}
      </div>

      {/* Priority */}
      <div className="sm:col-span-4">
        <label
          htmlFor="priority"
          className="block text-sm font-medium text-gray-700"
        >
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Goals */}
      <div className="sm:col-span-4">
        <label
          htmlFor="goals"
          className="block text-sm font-medium text-gray-700"
        >
          Aligns with Goals
        </label>
        <select
          id="goals"
          name="goals"
          multiple
          value={formData.goals}
          onChange={handleGoalsChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="Career">Career</option>
          <option value="Health">Health</option>
          <option value="Learning">Learning</option>
          <option value="Hobbies">Hobbies</option>
        </select>
        {errors.goals && <p className="mt-1 text-sm text-red-600">{errors.goals}</p>}
      </div>

      {/* Task Type */}
      <div className="sm:col-span-4">
        <label
          htmlFor="taskType"
          className="block text-sm font-medium text-gray-700"
        >
          Task Type
        </label>
        <select
          id="taskType"
          name="taskType"
          value={formData.taskType}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select Type</option>
          <option value="Deep Work">Deep Work</option>
          <option value="Admin">Administrative</option>
          <option value="Meeting">Meeting</option>
          <option value="Physical">Physical</option>
        </select>
        {errors.taskType && (
          <p className="mt-1 text-sm text-red-600">{errors.taskType}</p>
        )}
      </div>

      {/* Notes */}
      <div className="col-span-full">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="focus:outline-none mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Add any extra context or dependencies for this task."
        />
      </div>

      {/* Buttons */}
      <div className="mt-6 flex items-center justify-end gap-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Save
        </button>
      </div>
    </form>
  );
}
