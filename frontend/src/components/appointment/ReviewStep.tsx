import { useAvailability } from "../../hooks/appointment.ts";
import { useExams } from "../../hooks/exam.ts";

type ReviewStepProps = {
  patientName: string | undefined;
  examId: number | undefined;
  date: string | undefined;
  doctorId: string | undefined;
  startTime: string | undefined;
};

function formatAppointmentDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function displayName(
  isLoading: boolean,
  isError: boolean,
  name: string | undefined,
): string {
  if (isLoading) {
    return "Carregando…";
  }

  if (isError || name == null || name.length === 0) {
    return "—";
  }

  return name;
}

export default function ReviewStep({
  patientName,
  examId,
  date,
  doctorId,
  startTime,
}: ReviewStepProps) {
  const exams = useExams();
  const availability = useAvailability(examId, date);

  const examName = exams.data?.find((exam) => exam.id === examId)?.name;
  const doctorName = availability.data?.find((doctor) => doctor.id === doctorId)
    ?.name;

  const namesFailed = exams.isError || availability.isError;

  const rows = [
    { label: "Paciente", value: patientName?.trim() || "—" },
    {
      label: "Exame",
      value: displayName(exams.isLoading, exams.isError, examName),
    },
    {
      label: "Data",
      value: date != null && date.length > 0 ? formatAppointmentDate(date) : "—",
    },
    {
      label: "Médico",
      value: displayName(
        availability.isLoading,
        availability.isError,
        doctorName,
      ),
    },
    ...(startTime != null && startTime.length > 0
      ? [{ label: "Horário", value: startTime }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Conferência</h2>

      <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 px-3 py-3"
          >
            <dt className="text-slate-500">{row.label}</dt>
            <dd className="text-right font-medium text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      {namesFailed ? (
        <p className="text-sm text-red-600">
          Não foi possível carregar os nomes.
        </p>
      ) : null}
    </div>
  );
}
