/** Break long question text into readable paragraphs for the UI. */
export function formatQuestionBody(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";

  const normalized = raw.replace(/\s+/g, " ");
  const sentences = normalized.split(/(?<=[.?!])\s+(?=[A-Z])/);
  if (sentences.length <= 1) return normalized;

  return sentences.join("\n\n");
}

export function formatFeedbackDisplay(feedback) {
  const raw = String(feedback || "").trim();
  if (!raw) return [];

  return raw
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function roundLabel(round) {
  const r = String(round || "").toLowerCase();
  if (r === "hr") return "HR Round";
  if (r === "aptitude") return "Aptitude Round";
  if (r === "coding") return "Coding Round";
  return r ? r.toUpperCase() : "";
}
