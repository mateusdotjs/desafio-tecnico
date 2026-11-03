import { useQuery } from "@tanstack/react-query";
import { searchExams } from "../api/requests/exams.ts";

export function useExams(name?: string) {
  return useQuery({
    queryKey: ["exams", name ?? ""],
    queryFn: () => searchExams(name),
  });
}
