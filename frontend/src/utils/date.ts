const saoPauloDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getSaoPauloDateParts(): Record<string, string> {
  return Object.fromEntries(
    saoPauloDateFormatter
      .formatToParts(new Date())
      .map(({ type, value }) => [type, value]),
  );
}

export function todayISO(): string {
  const dateParts = getSaoPauloDateParts();
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

export function appointmentDateError(date: string | undefined): string | undefined {
  if (date == null || date.length === 0) {
    return undefined;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "A data informada é inválida.";
  }

  if (date < todayISO()) {
    return "Escolha uma data de hoje em diante.";
  }

  return undefined;
}

export function isAppointmentDateSelected(date: string | undefined): boolean {
  return date != null && date.length > 0 && appointmentDateError(date) == null;
}
