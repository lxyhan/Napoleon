export default function Heading({
  onOpenModal,
  onScheduleAll, // Add the new method prop
}: {
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
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onClick={onScheduleAll} // Call the new method when clicked
        >
          Schedule all tasks
        </button>

        {/* New Task button */}
        <button
          type="button"
          className="ml-3 inline-flex items-center !rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={onOpenModal} // Open the modal
        >
          New Task
        </button>
      </div>
    </div>
  );
}
