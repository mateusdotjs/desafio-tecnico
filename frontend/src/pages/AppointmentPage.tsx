import { useState } from "react";
import AppointmentStepper from "../components/appointment/FormStepper.tsx";
import ConfirmStep from "../components/appointment/ConfirmStep.tsx";
import ExamStep from "../components/appointment/ExamStep.tsx";
import ScheduleStep from "../components/appointment/ScheduleStep.tsx";

const STEP_LABELS = ["Exame", "Horário", "Confirmar"] as const;
const TOTAL_STEPS = STEP_LABELS.length;

export default function AppointmentPage() {
  const [step, setStep] = useState(1);

  function goBack() {
    setStep((step) => Math.max(1, step - 1));
  }

  function goNext() {
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
        {step === 1 && <ExamStep />}
        {step === 2 && <ScheduleStep />}
        {step === 3 && <ConfirmStep />}
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
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
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
