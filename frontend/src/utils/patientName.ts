export function patientNameError(name: string | undefined): string | undefined {
  if (name == null || name.length === 0) {
    return undefined;
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return "O nome do paciente é obrigatório.";
  }

  if (trimmed.length > 255) {
    return "O nome do paciente deve ter no máximo 255 caracteres.";
  }

  return undefined;
}

export function isPatientNameFilled(name: string | undefined): boolean {
  const trimmed = name?.trim() ?? "";
  return trimmed.length > 0 && patientNameError(name) == null;
}
