import { useState, type FocusEvent, type KeyboardEvent } from "react";
import { patientNameError } from "../../utils/patientName.ts";
import FormField, { formControlClassName } from "./FormField.tsx";

type IdentificationStepProps = {
  patientName: string | undefined;
  onPatientNameChange: (patientName: string) => void;
};

export default function IdentificationStep({
  patientName,
  onPatientNameChange,
}: IdentificationStepProps) {
  const [errorVisible, setErrorVisible] = useState(false);
  const nameError = errorVisible ? patientNameError(patientName) : undefined;

  function handleChange(value: string) {
    onPatientNameChange(value);
    setErrorVisible(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Tab") {
      return;
    }

    setErrorVisible(false);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setErrorVisible(patientNameError(event.currentTarget.value) != null);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Identificação</h2>

      <FormField label="Nome do paciente" htmlFor="patient-name" error={nameError}>
        <input
          id="patient-name"
          type="text"
          value={patientName ?? ""}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoComplete="name"
          aria-invalid={nameError != null}
          className={`${formControlClassName} ${
            nameError != null
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : ""
          }`}
        />
      </FormField>
    </div>
  );
}
