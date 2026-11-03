import { useState, type FocusEvent, type KeyboardEvent } from "react";
import {
  appointmentDateError,
  maxDateISO,
  todayISO,
} from "../../utils/date.ts";
import FormField, { formControlClassName } from "./FormField.tsx";

type DateStepProps = {
  date: string | undefined;
  onDateChange: (date: string) => void;
};

export default function DateStep({ date, onDateChange }: DateStepProps) {
  const [errorVisible, setErrorVisible] = useState(false);
  const dateError = errorVisible ? appointmentDateError(date) : undefined;

  function handleChange(value: string) {
    onDateChange(value);
    setErrorVisible(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Tab") {
      return;
    }

    setErrorVisible(false);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setErrorVisible(appointmentDateError(event.currentTarget.value) != null);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Escolher data</h2>

      <FormField
        label="Data do exame"
        htmlFor="appointment-date"
        hint="De hoje até daqui a um ano."
        error={dateError}
      >
        <input
          id="appointment-date"
          type="date"
          min={todayISO()}
          max={maxDateISO()}
          value={date ?? ""}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          aria-invalid={dateError != null}
          className={`${formControlClassName} ${
            dateError != null
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : ""
          }`}
        />
      </FormField>
    </div>
  );
}
