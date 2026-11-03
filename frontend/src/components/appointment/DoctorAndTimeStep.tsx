import { useAvailability } from "../../hooks/appointment.ts";

type DoctorAndTimeStepProps = {
  examId: number | undefined;
  date: string | undefined;
  doctorId: string | undefined;
  startTime: string | undefined;
  onDoctorIdChange: (doctorId: string) => void;
  onStartTimeChange: (startTime: string | undefined) => void;
};

export default function DoctorAndTimeStep({
  examId,
  date,
  doctorId,
  startTime,
  onDoctorIdChange,
  onStartTimeChange,
}: DoctorAndTimeStepProps) {
  const { data: doctors, isLoading, isError } = useAvailability(examId, date);

  const availableDoctors =
    doctors?.filter((doctor) => doctor.availableSlots.length > 0) ?? [];

  function handleDoctorSelect(id: string) {
    if (id === doctorId) {
      return;
    }

    onDoctorIdChange(id);
    onStartTimeChange(undefined);
  }

  const showEmpty = !isLoading && !isError && availableDoctors.length === 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">
          Escolher médico e horário
        </h2>
        <p className="text-sm text-slate-500">
          Todas as datas e horários seguem o fuso horário de Brasília.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando médicos…</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600">
          Não foi possível carregar os horários.
        </p>
      ) : null}

      {showEmpty ? (
        <p className="text-sm text-slate-500">
          Nenhum médico disponível nesta data.
        </p>
      ) : null}

      {!isLoading && !isError && availableDoctors.length > 0 ? (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {availableDoctors.map((doctor) => {
            const isSelected = doctor.id === doctorId;

            return (
              <li key={doctor.id}>
                <button
                  type="button"
                  onClick={() => handleDoctorSelect(doctor.id)}
                  className={`flex w-full items-start px-3 py-3 text-left text-sm transition-colors hover:bg-slate-50 ${
                    isSelected
                      ? "border-l-4 border-sky-600 bg-sky-50 pl-2"
                      : "border-l-4 border-transparent"
                  }`}
                >
                  <span className="font-medium text-slate-900">
                    {doctor.name}
                  </span>
                </button>

                {isSelected ? (
                  <div className="flex flex-wrap gap-2 px-3 py-2">
                    {doctor.availableSlots.map((slot) => {
                      const isSlotSelected = slot === startTime;

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => onStartTimeChange(slot)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                            isSlotSelected
                              ? "border-sky-600 bg-sky-600 text-white"
                              : "border-slate-300 text-slate-800 hover:bg-slate-50"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
