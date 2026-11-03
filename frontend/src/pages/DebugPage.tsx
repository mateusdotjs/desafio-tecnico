import { useAppointments } from "../hooks/appointment.ts";

function formatAppointmentDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
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
                      {formatAppointmentDate(appointment.date)}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {appointment.startTime}
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
