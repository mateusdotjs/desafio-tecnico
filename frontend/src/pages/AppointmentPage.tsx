import { useState } from "react";
import AppointmentStepper from "../components/appointment/AppointmentStepper.tsx";
import DateStep from "../components/appointment/DateStep.tsx";
import DoctorAndTimeStep from "../components/appointment/DoctorAndTimeStep.tsx";
import ExamStep from "../components/appointment/ExamStep.tsx";
import type { AppointmentDraft } from "../types/appointment.ts";

const STEP_LABELS = ["Exame", "Data", "Médico e horário"] as const;
const TOTAL_STEPS = STEP_LABELS.length;

export default function AppointmentPage() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<AppointmentDraft>({});

  const step1Complete = draft.examId != null;

  function goBack() {
    setStep((step) => Math.max(1, step - 1));
  }

  function goNext() {
    if (step === 1 && !step1Complete) {
      return;
    }

    setStep((step) => Math.min(TOTAL_STEPS, step + 1));
  }

  function handleAgendar() {
    // TODO: useCreateAppointment(draft) — integração em commit seguinte
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Agendar exame</h1>

      <AppointmentStepper currentStep={step} steps={STEP_LABELS} />

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <ExamStep
            examId={draft.examId}
            onExamIdChange={(examId) =>
              setDraft((current) => ({ ...current, examId }))
            }
          />
        )}
        {step === 2 && <DateStep />}
        {step === 3 && <DoctorAndTimeStep />}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Voltar
        </button>
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={goNext}
            disabled={step === 1 && !step1Complete}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próximo
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAgendar}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Agendar
          </button>
        )}
      </div>
    </div>
  );
}
