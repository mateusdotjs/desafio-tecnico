import { useState } from "react";
import type { Exam } from "../../api/types.ts";
import { useExams } from "../../hooks/exam.ts";
import FormField, { formControlClassName } from "./FormField.tsx";

type ExamSelectFieldProps = {
  examId: number | undefined;
  onExamIdChange: (examId: number | undefined) => void;
};

export default function ExamSelectField({
  examId,
  onExamIdChange,
}: ExamSelectFieldProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: exams, isLoading, isError } = useExams();

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const visibleExams =
    exams?.filter((exam) =>
      exam.name.toLocaleLowerCase().includes(normalizedQuery),
    ) ?? [];

  function handleSelect(exam: Exam) {
    onExamIdChange(exam.id);
  }

  const showEmpty =
    !isLoading && !isError && exams != null && visibleExams.length === 0;

  return (
    <FormField
      label="Exame"
      htmlFor="exam-search"
      hint="Busque pelo nome ou selecione um exame da lista."
    >
      <input
        id="exam-search"
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Buscar exame por nome…"
        className={formControlClassName}
        autoComplete="off"
      />

      <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-200">
        {isLoading ? (
          <p className="px-3 py-4 text-sm text-slate-500">Carregando exames…</p>
        ) : null}

        {showEmpty ? (
          <p className="px-3 py-4 text-sm text-slate-500">
            Nenhum exame encontrado para essa busca.
          </p>
        ) : null}

        {!isLoading && !isError && visibleExams.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {visibleExams.map((exam) => {
              const isSelected = exam.id === examId;

              return (
                <li key={exam.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(exam)}
                    className={`flex w-full items-start justify-between gap-3 px-3 py-3 text-left text-sm transition-colors hover:bg-slate-50 ${
                      isSelected
                        ? "border-l-4 border-sky-600 bg-sky-50 pl-2"
                        : "border-l-4 border-transparent"
                    }`}
                  >
                    <span className="font-medium text-slate-900">{exam.name}</span>
                    <span className="shrink-0 text-slate-600">
                      {exam.durationMinutes} min
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </FormField>
  );
}
