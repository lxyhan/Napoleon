import { useState } from "react";
import { ChevronRight, ChevronLeft, Clock, Target, Flag, BookOpen, Calendar } from "lucide-react";

export default function TaskForm({
  onSubmit,
  onCancel,
  disabled
}: {
  onSubmit: (newTodo: any) => void;
  onCancel: () => void;
  disabled?: boolean;  // Add this prop

}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    dueDate: "",
    description: "",
    estimatedTime: "",
    priority: "Medium",
    goals: [] as string[],
    taskType: "",
    notes: ""
  });

  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateStep = (currentStep: number) => {
    const newErrors: { [key: string]: string | null } = {};

    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = "Please give your task a name";
        }
        if (!formData.description.trim()) {
          newErrors.description = "Help yourself remember what this task involves";
        }
        break;
      case 2:
        if (!formData.dueDate) {
          newErrors.dueDate = "When do you need this done by?";
        }
        if (!formData.estimatedTime) {
          newErrors.estimatedTime = "How long do you think this will take?";
        }
        break;
      case 3:
        if (!formData.taskType) {
          newErrors.taskType = "What kind of task is this?";
        }
        break;
      case 4:
        if (formData.goals.length === 0) {
          newErrors.goals = "Which of your goals does this help with?";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 5));
    }
  };

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1));
  };

  const handleFinalSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    onSubmit({ id: "", ...formData });
  };

  const taskTypes = [
    { value: "Deep Work", label: "Deep Work", description: "Requires focused concentration and critical thinking" },
    { value: "Admin", label: "Administrative", description: "Routine tasks and organization" },
    { value: "Meeting", label: "Meeting", description: "Interaction with others" },
    { value: "Physical", label: "Physical", description: "Activities requiring physical effort" }
  ];

  const goalTypes = [
    { value: "Career", label: "Career Growth 💼", description: "Professional development and work goals" },
    { value: "Health", label: "Health & Wellness 🌱", description: "Physical and mental wellbeing" },
    { value: "Learning", label: "Learning 📚", description: "Education and skill development" },
    { value: "Hobbies", label: "Personal Interests 🎨", description: "Recreation and personal projects" }
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-gray-900">What would you like to accomplish?</h2>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 text-lg border-b border-gray-300 focus:border-indigo-500 focus:outline-none bg-transparent"
                    placeholder="Give your task a name..."
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-3 text-base border-b border-gray-300 focus:border-indigo-500 focus:outline-none bg-transparent resize-none"
                    placeholder="Describe what needs to be done..."
                    rows={3}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-gray-900">When do you need this done?</h2>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Calendar className="w-6 h-6 text-gray-400" />
                  <div className="flex-1">
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="w-full p-3 text-base border-b border-gray-300 focus:border-indigo-500 focus:outline-none bg-transparent"
                    />
                    {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Clock className="w-6 h-6 text-gray-400" />
                  <div className="flex-1">
                    <input
                      type="number"
                      name="estimatedTime"
                      value={formData.estimatedTime}
                      onChange={handleChange}
                      className="w-full p-3 text-base border-b border-gray-300 focus:border-indigo-500 focus:outline-none bg-transparent"
                      placeholder="Estimated minutes needed..."
                      min="1"
                      step="5"
                    />
                    <p className="mt-1 text-sm text-gray-500">Enter time in minutes (e.g., 90 for 1h 30m)</p>
                    {errors.estimatedTime && <p className="mt-1 text-sm text-red-600">{errors.estimatedTime}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-gray-900">What type of task is this?</h2>
              <div className="grid grid-cols-1 gap-3">
                {taskTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, taskType: type.value }))}
                    className={`p-4 text-left rounded-lg border ${
                      formData.taskType === type.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </button>
                ))}
              </div>
              {errors.taskType && <p className="mt-1 text-sm text-red-600">{errors.taskType}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-gray-900">Which goals does this support?</h2>
              <div className="grid grid-cols-1 gap-3">
                {goalTypes.map(goal => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => {
                      const newGoals = formData.goals.includes(goal.value)
                        ? formData.goals.filter(g => g !== goal.value)
                        : [...formData.goals, goal.value];
                      setFormData(prev => ({ ...prev, goals: newGoals }));
                    }}
                    className={`p-4 text-left rounded-lg border ${
                      formData.goals.includes(goal.value)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{goal.label}</div>
                    <div className="text-sm text-gray-500">{goal.description}</div>
                  </button>
                ))}
              </div>
              {errors.goals && <p className="mt-1 text-sm text-red-600">{errors.goals}</p>}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-gray-900">Almost done! Any final details?</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How important is this task?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Low", "Medium", "High"].map(priority => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority }))}
                        className={`p-3 text-center rounded-lg border ${
                          formData.priority === priority
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Any additional notes?</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full p-3 text-base border rounded-lg border-gray-300 focus:border-indigo-500 focus:outline-none bg-transparent resize-none"
                    placeholder="Add any extra context or dependencies..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    // Remove the onSubmit from the form element to prevent automatic submission
    <form className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i <= step ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-500">Step {step} of 5</div>
        </div>
        {renderStep()}
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={step === 1 ? onCancel : handleBack}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {step === 1 ? "Cancel" : "Back"}
        </button>
        {step < 5 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Create Task
          </button>
        )}
      </div>
    </form>
  );
}