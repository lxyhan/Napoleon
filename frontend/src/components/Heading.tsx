import { ClipLoader } from "react-spinners";

export default function Heading({
  onOpenModal,
  onScheduleAll,
  isScheduling
}: {
  isScheduling?: boolean;
  onOpenModal: () => void;
  onScheduleAll: () => void;
}) {
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Planner
        </h2>
      </div>
      <div className="mt-4 flex md:ml-4 md:mt-0">
        {/* Schedule all tasks button */}
        <button
          type="button"
          disabled={isScheduling}
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onScheduleAll}
        >
          <div className="flex items-center space-x-2">
            {isScheduling ? (
              <>
                <ClipLoader size={16} color="#4A90E2" loading={true} />
                <span>Scheduling...</span>
              </>
            ) : (
              <span>Schedule all tasks</span>
            )}
          </div>
        </button>

        {/* New Task button */}
        <button
          type="button"
          className="ml-3 inline-flex items-center !rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={onOpenModal}
        >
          New Task
        </button>
      </div>
    </div>
  );
}