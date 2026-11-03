import ExamSelectField from "./ExamSelectField.tsx";

type ExamStepProps = {
  examId: number | undefined;
  onExamIdChange: (id: number | undefined) => void;
};

export default function ExamStep({ examId, onExamIdChange }: ExamStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Escolher exame</h2>
      <ExamSelectField examId={examId} onExamIdChange={onExamIdChange} />
    </div>
  );
}
