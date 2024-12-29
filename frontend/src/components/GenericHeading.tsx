type Prop = {
    Heading: string;
  }

export default function Example({Heading}: Prop) {
    return (
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {Heading}
          </h2>
        </div>
      </div>
    )
  }
  