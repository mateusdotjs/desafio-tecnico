import { request } from "../client.ts";
import type { Exam } from "../types.ts";

export function searchExams(name?: string): Promise<Exam[]> {
  const trimmed = name?.trim();
  const path =
    trimmed !== undefined && trimmed !== ""
      ? `/exams?${new URLSearchParams({ name: trimmed })}`
      : "/exams";

  return request<Exam[]>(path);
}
