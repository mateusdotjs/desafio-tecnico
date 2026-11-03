type BookingStepperProps = {
  currentStep: number;
  steps: readonly string[];
};

export default function BookingStepper({
  currentStep,
  steps,
}: BookingStepperProps) {
  return (
    <ol className="flex flex-wrap gap-2 sm:gap-4">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isPast = stepNumber < currentStep;

        return (
          <li
            key={label}
            className={`flex items-center gap-2 text-sm ${
              isActive
                ? "font-semibold text-sky-600"
                : isPast
                  ? "text-slate-700"
                  : "text-slate-400"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                isActive
                  ? "border-sky-600 bg-sky-600 text-white"
                  : isPast
                    ? "border-slate-400 bg-slate-100 text-slate-700"
                    : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              {stepNumber}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
