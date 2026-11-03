function formatISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return formatISO(new Date());
}

export function maxDateISO(): string {
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  return formatISO(maxDate);
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

  if (date > maxDateISO()) {
    return "A data não pode passar de um ano.";
  }

  return undefined;
}

export function isAppointmentDateSelected(date: string | undefined): boolean {
  return date != null && date.length > 0 && appointmentDateError(date) == null;
}
