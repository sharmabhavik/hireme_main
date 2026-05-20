export function getFallbackQuestions(targetRole) {
  const role = String(targetRole || "").toLowerCase();

  const common = [
    "Tell me about yourself in 60 seconds.",
    "Why are you interested in this role?",
    "Describe a challenge you faced and how you solved it (STAR).",
    "What is your biggest strength and biggest weakness?",
    "Where do you see yourself in 2 years?",
  ];

  if (role.includes("frontend") || role.includes("react")) {
    return common.concat([
      "Explain the difference between state and props in React.",
      "How do you optimize a React app performance?",
      "What are common causes of re-renders and how do you reduce them?",
    ]);
  }

  if (role.includes("backend") || role.includes("node")) {
    return common.concat([
      "Explain REST vs GraphQL and when you choose each.",
      "How do you handle authentication and authorization in an API?",
      "What is a database index and why does it matter?",
    ]);
  }

  if (role.includes("data") || role.includes("ml") || role.includes("ai")) {
    return common.concat([
      "Explain bias-variance tradeoff.",
      "How do you evaluate a classification model?",
      "Describe a project where you used data to make a decision.",
    ]);
  }

  return common.concat([
    "Describe a project you are proud of.",
    "How do you prioritize tasks when deadlines are tight?",
    "Tell me about a time you received critical feedback.",
  ]);
}

export function basicFeedback(answer) {
  const a = String(answer || "").trim();
  if (!a) {
    return {
      score: 0,
      feedback:
        "No answer captured. Try again with a clear, complete response.",
    };
  }

  const wordCount = a.split(/\s+/).filter(Boolean).length;
  const hasStar = /(situation|task|action|result)/i.test(a);

  let score = 5;
  if (wordCount < 20) score -= 2;
  if (wordCount > 200) score -= 1;
  if (hasStar) score += 2;

  score = Math.max(0, Math.min(10, score));

  const feedbackParts = [];
  if (wordCount < 20)
    feedbackParts.push("Answer is too short; add more detail.");
  if (!hasStar)
    feedbackParts.push(
      "Consider using STAR (Situation, Task, Action, Result).",
    );
  if (wordCount > 200) feedbackParts.push("Answer is long; be more concise.");

  return {
    score,
    feedback: feedbackParts.length
      ? feedbackParts.join(" ")
      : "Good structure. Add one measurable result to make it stronger.",
  };
}
