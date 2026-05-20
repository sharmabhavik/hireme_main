import { formatQuestionBody, roundLabel } from "@/utils/interviewFormat";

export default function InterviewQuestionCard({
  question,
  questionNumber,
  round,
  difficulty,
  className = "",
}) {
  const body = formatQuestionBody(question);

  return (
    <div className={`hire-card space-y-3 p-4 sm:p-5 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="hire-badge-primary">Question {questionNumber}</span>
        {round ? (
          <span className="hire-badge-muted text-xs">{roundLabel(round)}</span>
        ) : null}
        {difficulty ? (
          <span className="text-xs capitalize text-muted-foreground">
            {difficulty} difficulty
          </span>
        ) : null}
      </div>
      <p className="text-base font-medium leading-relaxed text-foreground whitespace-pre-wrap sm:text-lg">
        {body}
      </p>
    </div>
  );
}
