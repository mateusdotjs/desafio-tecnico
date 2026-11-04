import { useState } from "react";
import { ApiError, getErrorMessage } from "../api/exceptionHandler.ts";
import AppointmentStepper from "../components/appointment/AppointmentStepper.tsx";
import DateStep from "../components/appointment/DateStep.tsx";
import DoctorAndTimeStep from "../components/appointment/DoctorAndTimeStep.tsx";
import ExamStep from "../components/appointment/ExamStep.tsx";
import IdentificationStep from "../components/appointment/IdentificationStep.tsx";
import { useCreateAppointment } from "../hooks/appointment.ts";
import type { AppointmentDraft } from "../types/appointment.ts";
import { isAppointmentDateSelected } from "../utils/date.ts";
import { isPatientNameFilled } from "../utils/patientName.ts";

const STEP_LABELS = ["Identificação", "Exame", "Data", "Médico e horário"] as const;
const TOTAL_STEPS = STEP_LABELS.length;

export default function AppointmentPage() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<AppointmentDraft>({});
  const createAppointment = useCreateAppointment();

  const step1Complete = isPatientNameFilled(draft.patientName);
  const step2Complete = draft.examId != null;
  const step3Complete = isAppointmentDateSelected(draft.date);
  const step4Complete =
    draft.doctorId != null &&
    draft.doctorId.length > 0 &&
    draft.startTime != null &&
    draft.startTime.length > 0;

  const submitError = createAppointment.isError
    ? getErrorMessage(
        createAppointment.error,
        "Não foi possível concluir o agendamento. Tente novamente.",
      )
    : undefined;

  function goBack() {
    setStep((step) => Math.max(1, step - 1));
  }

  function goNext() {
    if (step === 1 && !step1Complete) {
      return;
    }

    if (step === 2 && !step2Complete) {
      return;
    }

    if (step === 3 && !step3Complete) {
      return;
    }

    setStep((step) => Math.min(TOTAL_STEPS, step + 1));
  }

  function handleSubmitAppointment() {
    const patientName = draft.patientName?.trim();
    const { examId, date, doctorId, startTime } = draft;

    if (
      patientName == null ||
      patientName.length === 0 ||
      !isPatientNameFilled(patientName) ||
      examId == null ||
      date == null ||
      !isAppointmentDateSelected(date) ||
      doctorId == null ||
      doctorId.length === 0 ||
      startTime == null ||
      startTime.length === 0
    ) {
      return;
    }

    createAppointment.mutate(
      {
        patientName,
        examId,
        doctorId,
        date,
        startTime,
      },
      {
        onSuccess: () => {
          window.alert("Exame agendado com sucesso.");
          setDraft({});
          setStep(1);
        },
        onError: (error) => {
          if (
            error instanceof ApiError &&
            (error.statusCode === 400 || error.statusCode === 409)
          ) {
            setDraft((current) => ({ ...current, startTime: undefined }));
          }
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Agendar exame</h1>

      <AppointmentStepper currentStep={step} steps={STEP_LABELS} />

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <IdentificationStep
            patientName={draft.patientName}
            onPatientNameChange={(patientName) =>
              setDraft((current) => ({ ...current, patientName }))
            }
          />
        )}
        {step === 2 && (
          <ExamStep
            examId={draft.examId}
            onExamIdChange={(examId) =>
              setDraft((current) =>
                current.examId === examId
                  ? current
                  : {
                      ...current,
                      examId,
                      doctorId: undefined,
                      startTime: undefined,
                    },
              )
            }
          />
        )}
        {step === 3 && (
          <DateStep
            date={draft.date}
            onDateChange={(date) =>
              setDraft((current) =>
                current.date === date
                  ? current
                  : {
                      ...current,
                      date,
                      doctorId: undefined,
                      startTime: undefined,
                    },
              )
            }
          />
        )}
        {step === 4 && (
          <DoctorAndTimeStep
            examId={draft.examId}
            date={draft.date}
            doctorId={draft.doctorId}
            startTime={draft.startTime}
            onDoctorIdChange={(doctorId) => {
              createAppointment.reset();
              setDraft((current) => ({ ...current, doctorId }));
            }}
            onStartTimeChange={(startTime) => {
              createAppointment.reset();
              setDraft((current) => ({ ...current, startTime }));
            }}
          />
        )}
      </section>

      <div className="space-y-4">
        {step === TOTAL_STEPS && submitError != null ? (
          <p className="text-sm text-red-600">{submitError}</p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1 || createAppointment.isPending}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Voltar
          </button>
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={goNext}
              disabled={
                (step === 1 && !step1Complete) ||
                (step === 2 && !step2Complete) ||
                (step === 3 && !step3Complete)
              }
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próximo
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitAppointment}
              disabled={!step4Complete || createAppointment.isPending}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {createAppointment.isPending ? "Agendando…" : "Agendar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
