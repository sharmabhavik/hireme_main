export function sanitizeText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalize AI question text for display and storage. */
export function formatInterviewQuestion(text) {
  let q = sanitizeText(text);
  if (!q) return q;

  q = q.replace(/^["'`]+|["'`]+$/g, "");
  q = q.replace(/\s*\*+\s*/g, " ");
  q = q.replace(/^question\s*\d*\s*[:.\-]\s*/i, "");

  if (!/[.?!]$/.test(q)) {
    q = `${q}?`;
  }

  return q;
}

export function getAnsweredTurns(turns) {
  return (turns || []).filter((t) => sanitizeText(t?.answer));
}

/** Remove trailing turns that only have a question (not submitted yet). */
export function stripUnansweredTurns(turns) {
  const copy = [...(turns || [])];
  while (copy.length > 0 && !sanitizeText(copy[copy.length - 1]?.answer)) {
    copy.pop();
  }
  return copy;
}

export function formatFeedbackBullets(feedback) {
  const raw = String(feedback || "").trim();
  if (!raw) return [];
  return raw
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}
