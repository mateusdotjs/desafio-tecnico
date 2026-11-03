import { useAppointments } from "../hooks/appointment.ts";

function formatAppointmentDate(startAt: string): string {
  const date = new Date(startAt);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatAppointmentTime(startAt: string): string {
  const date = new Date(startAt);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function DebugPage() {
  const { data: appointments, isLoading, isError } = useAppointments();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Debug</h1>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <p className="text-sm text-slate-500">Carregando agendamentos…</p>
        ) : null}

        {isError ? (
          <p className="text-sm text-red-600">
            Não foi possível carregar os agendamentos.
          </p>
        ) : null}

        {!isLoading && !isError && appointments?.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum agendamento.</p>
        ) : null}

        {!isLoading && !isError && appointments != null && appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="px-3 py-3 font-medium">Paciente</th>
                  <th className="px-3 py-3 font-medium">Exame</th>
                  <th className="px-3 py-3 font-medium">Médico</th>
                  <th className="px-3 py-3 font-medium">Data</th>
                  <th className="px-3 py-3 font-medium">Horário</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {appointment.patientName}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {appointment.examName}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {appointment.doctorName}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {formatAppointmentDate(appointment.startAt)}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {formatAppointmentTime(appointment.startAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
