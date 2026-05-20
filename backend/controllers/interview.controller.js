// @ts-nocheck
import { InterviewSession } from "../models/interviewSession.model.js";
import { User } from "../models/user.model.js";
import { HfError, hfChatCompletions } from "../utils/hfChat.js";
import { basicFeedback, getFallbackQuestions } from "../utils/interviewBank.js";
import { buildInterviewPdfBuffer } from "../utils/pdfReport.js";
import {
  normalizeDomain,
  normalizeRound,
  ROUNDS,
} from "../utils/interviewDomains.js";

const MAX_ANSWER_CHARS = 4000;
const DEFAULT_MAX_TURNS = 5;

function sanitizeText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function roundRules(round, domainLabel) {
  if (round === ROUNDS.APTITUDE) {
    return `Round: Aptitude.
- Ask aptitude / reasoning questions only (math, logic, patterns, probability, time&work, etc.).
- Do NOT ask HR/behavioral questions.
- Do NOT ask coding questions.
- Feedback should focus on correctness, approach, and clarity of steps.`;
  }

  if (round === ROUNDS.CODING) {
    return `Round: Coding/Technical for domain: ${domainLabel}.
- Ask programming / technical questions only.
- Prefer questions that require explaining approach, trade-offs, and edge cases.
- Include at least 1 question that is a small coding task/pseudocode.
- Feedback should focus on correctness, completeness, complexity, and reasoning.`;
  }

  return `Round: HR.
- Ask behavioral/HR questions only (motivation, communication, teamwork, conflict, strengths/weaknesses).
- Do NOT ask coding questions.
- Feedback should focus on structure, clarity, and evidence/examples.`;
}

function interviewerSystemPrompt(targetRole, difficulty, round) {
  return `You are an experienced interviewer and interview coach.
You are conducting a mock interview for the role: ${targetRole}. Difficulty: ${difficulty}.

${roundRules(round, targetRole)}

Hard rules:
- You MUST ground feedback in the candidate's *current* answer. Do not reuse generic templates.
- If the answer is vague, short, or incoherent, explicitly say so and explain why that harms the response.
- Feedback must reference at least 1 concrete detail from the answer (quote a short phrase if possible).
- Ask ONE next question at a time. The next question should feel like a follow-up based on what they just said, or a natural progression.
- Be concise and professional.`;
}

function formatTurnsForPrompt(turns) {
  return (turns || [])
    .map((t, i) => {
      const q = sanitizeText(t.question);
      const a = sanitizeText(t.answer);
      return `Q${i + 1}: ${q}\nA${i + 1}: ${a}`;
    })
    .join("\n\n");
}

function clampScore0to10(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return undefined;
  return Math.max(0, Math.min(10, num));
}

async function generateFirstQuestion({ targetRole, difficulty, round }) {
  const messages = [
    {
      role: "system",
      content: interviewerSystemPrompt(targetRole, difficulty, round),
    },
    {
      role: "user",
      content:
        round === ROUNDS.HR
          ? "Start the HR interview. Ask a short intro question first (tell me about yourself)."
          : round === ROUNDS.APTITUDE
            ? "Start the aptitude round. Ask the first aptitude question appropriate for the difficulty."
            : "Start the coding/technical round. Ask the first domain-specific technical question appropriate for the difficulty.",
    },
  ];
  const content = await hfChatCompletions({
    messages,
    max_tokens: 200,
    temperature: 0.4,
  });
  return sanitizeText(content);
}

async function evaluateAndAskNext({
  targetRole,
  difficulty,
  round,
  turnsSoFar,
  currentQuestion,
  currentAnswer,
  remainingTurns,
}) {
  const messages = [
    {
      role: "system",
      content: interviewerSystemPrompt(targetRole, difficulty, round),
    },
    {
      role: "user",
      content: `You will evaluate the candidate's CURRENT answer and propose the next question.

Interview context (previous turns, for continuity):
${formatTurnsForPrompt(turnsSoFar)}

CURRENT QUESTION:
${sanitizeText(currentQuestion)}

CURRENT ANSWER:
${sanitizeText(currentAnswer)}

Remaining questions after this one: ${Math.max(0, Number(remainingTurns) || 0)}

Output STRICT JSON ONLY (no markdown, no extra text) in this shape:
{
  "score": number (0-10),
  "feedback": ["bullet1", "bullet2", ...] (2-4 items, grounded in the answer),
  "nextQuestion": string (empty if remainingTurns == 0)
}

Constraints for nextQuestion:
- If remainingTurns == 0, set nextQuestion to "".
- Otherwise, nextQuestion should be a follow-up that references something the candidate said, OR a natural next competency question for the role.
- Do NOT restart the interview or talk about 'introduction' unless the question was actually about introduction.`,
    },
  ];

  const content = await hfChatCompletions({
    messages,
    max_tokens: 450,
    temperature: 0.5,
  });
  return content;
}

function parseEvalJson(text) {
  const raw = String(text || "").trim();
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Model did not return JSON");
  }
  const jsonText = raw.slice(firstBrace, lastBrace + 1);
  const parsed = JSON.parse(jsonText);

  const score = clampScore0to10(parsed?.score);
  const feedbackArr = Array.isArray(parsed?.feedback)
    ? parsed.feedback.map((f) => sanitizeText(f)).filter(Boolean)
    : [];
  const nextQuestion = sanitizeText(parsed?.nextQuestion);

  return {
    score,
    feedback: feedbackArr,
    nextQuestion,
  };
}

async function generateOverallAssessment({ targetRole, difficulty, turns }) {
  const messages = [
    {
      role: "system",
      content: `You are an interview coach summarizing performance for role: ${targetRole} (difficulty: ${difficulty}).`,
    },
    {
      role: "user",
      content: `Given this completed interview transcript, produce STRICT JSON ONLY:
{
  "overallFeedback": string (4-8 lines max),
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "finalScore": number (0-10)
}

Transcript:
${formatTurnsForPrompt(turns)}

Scoring guidance:
- finalScore should reflect overall performance.
- If answers are extremely short/incoherent, finalScore should be low (0-3).
- Keep it practical and actionable.`,
    },
  ];

  const content = await hfChatCompletions({
    messages,
    max_tokens: 500,
    temperature: 0.4,
  });

  const raw = String(content || "").trim();
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Overall assessment did not return JSON");
  }
  const parsed = JSON.parse(raw.slice(firstBrace, lastBrace + 1));

  const finalScore = clampScore0to10(parsed?.finalScore);
  const strengths = Array.isArray(parsed?.strengths)
    ? parsed.strengths.map((s) => sanitizeText(s)).filter(Boolean)
    : [];
  const improvements = Array.isArray(parsed?.improvements)
    ? parsed.improvements.map((s) => sanitizeText(s)).filter(Boolean)
    : [];

  const pieces = [];
  const overall = sanitizeText(parsed?.overallFeedback);
  if (overall) pieces.push(overall);
  if (strengths.length) pieces.push(`Strengths: ${strengths.join("; ")}`);
  if (improvements.length)
    pieces.push(`Improvements: ${improvements.join("; ")}`);

  return {
    overallFeedback: pieces.join("\n"),
    finalScore,
  };
}

function computeAverageTurnScore(turns) {
  const nums = (turns || [])
    .map((t) => t?.score)
    .filter((n) => typeof n === "number" && Number.isFinite(n));
  if (!nums.length) return undefined;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return Math.round(avg * 10) / 10;
}

function scoreToBucket(score) {
  if (typeof score !== "number" || !Number.isFinite(score)) return "unscored";
  if (score <= 3) return "underAverage";
  if (score <= 7) return "average";
  return "outstanding";
}

function round1(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return undefined;
  return Math.round(num * 10) / 10;
}

export const getInterviewAnalysis = async (req, res) => {
  try {
    const userId = req.id;
    const { id } = req.params;

    const session = await InterviewSession.findById(id).lean();
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    if (String(session.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const turns = Array.isArray(session.turns) ? session.turns : [];
    const scoredTurns = turns.filter(
      (t) => typeof t?.score === "number" && Number.isFinite(t.score),
    );

    const byBucket = {
      underAverage: 0,
      average: 0,
      outstanding: 0,
      unscored: 0,
    };

    const perQuestion = turns.map((t, idx) => {
      const score =
        typeof t?.score === "number" && Number.isFinite(t.score)
          ? t.score
          : undefined;
      const bucket = scoreToBucket(score);
      byBucket[bucket] = (byBucket[bucket] || 0) + 1;
      return {
        index: idx + 1,
        question: sanitizeText(t?.question),
        score,
        bucket,
      };
    });

    const avg = computeAverageTurnScore(turns);
    const total = turns.length;
    const scored = scoredTurns.length;

    const max = scoredTurns.length
      ? Math.max(...scoredTurns.map((t) => t.score))
      : undefined;
    const min = scoredTurns.length
      ? Math.min(...scoredTurns.map((t) => t.score))
      : undefined;

    const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

    return res.status(200).json({
      success: true,
      session: {
        id: session._id,
        targetRole: session.targetRole,
        round: session.round,
        difficulty: session.difficulty,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        finalScore:
          typeof session.finalScore === "number" &&
          Number.isFinite(session.finalScore)
            ? session.finalScore
            : undefined,
        overallFeedback: sanitizeText(session.overallFeedback),
      },
      summary: {
        totalQuestions: total,
        scoredQuestions: scored,
        averageScore: typeof avg === "number" ? avg : undefined,
        bestScore: typeof max === "number" ? round1(max) : undefined,
        worstScore: typeof min === "number" ? round1(min) : undefined,
      },
      buckets: {
        counts: byBucket,
        percentages: {
          underAverage: pct(byBucket.underAverage),
          average: pct(byBucket.average),
          outstanding: pct(byBucket.outstanding),
          unscored: pct(byBucket.unscored),
        },
      },
      perQuestion,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch analysis" });
  }
};

export const startInterview = async (req, res) => {
  try {
    const userId = req.id;
    const { targetRole, difficulty = "medium", round } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can start interviews",
      });
    }

    const normalized = normalizeDomain(targetRole);
    const role = sanitizeText(normalized.domainLabel);
    if (!role) {
      return res
        .status(400)
        .json({ success: false, message: "targetRole is required" });
    }

    const selectedRound = normalizeRound(round);
    if (!selectedRound) {
      return res
        .status(400)
        .json({ success: false, message: "round is required" });
    }

    if (selectedRound === ROUNDS.CODING && !normalized.technical) {
      return res.status(400).json({
        success: false,
        message:
          "Coding round is only available for technical domains (e.g. Backend/Frontend/Full Stack/QA/Data/ML).",
      });
    }

    const session = await InterviewSession.create({
      user: userId,
      targetRole: role,
      round: selectedRound,
      difficulty,
      status: "active",
      maxTurns: DEFAULT_MAX_TURNS,
      turns: [],
    });

    let firstQuestion;
    try {
      firstQuestion = await generateFirstQuestion({
        targetRole: role,
        difficulty,
        round: selectedRound,
      });
    } catch (e) {
      // fallback mode
      const questions = getFallbackQuestions(role);
      firstQuestion = questions[0];
    }

    session.turns.push({ question: firstQuestion });
    await session.save();

    return res.status(201).json({
      success: true,
      sessionId: session._id,
      question: firstQuestion,
      status: session.status,
      turnIndex: session.turns.length - 1,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to start interview" });
  }
};

export const answerTurn = async (req, res) => {
  try {
    const userId = req.id;
    const { id } = req.params;
    const { answer } = req.body;

    const session = await InterviewSession.findById(id);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    if (session.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }
    if (session.status !== "active") {
      return res
        .status(400)
        .json({ success: false, message: "Session is not active" });
    }

    const safeAnswer = sanitizeText(answer);
    if (!safeAnswer) {
      return res
        .status(400)
        .json({ success: false, message: "answer is required" });
    }
    if (safeAnswer.length > MAX_ANSWER_CHARS) {
      return res.status(400).json({
        success: false,
        message: `answer too long (max ${MAX_ANSWER_CHARS} chars)`,
      });
    }

    const currentIndex = session.turns.length - 1;
    if (currentIndex < 0) {
      return res
        .status(400)
        .json({ success: false, message: "No question to answer" });
    }

    session.turns[currentIndex].answer = safeAnswer;

    let feedback = "";
    let score;
    let nextQuestion = "";

    try {
      const remainingTurns = Math.max(
        0,
        session.maxTurns - session.turns.length,
      );
      const evalText = await evaluateAndAskNext({
        targetRole: session.targetRole,
        difficulty: session.difficulty,
        round: session.round,
        turnsSoFar: session.turns,
        currentQuestion: session.turns[currentIndex].question,
        currentAnswer: safeAnswer,
        remainingTurns,
      });
      const parsed = parseEvalJson(evalText);
      score = parsed.score;
      feedback = parsed.feedback?.length
        ? parsed.feedback.map((b) => `- ${b}`).join("\n")
        : "";
      nextQuestion = parsed.nextQuestion;

      if (remainingTurns > 0 && !nextQuestion) {
        throw new Error("Missing nextQuestion in model response");
      }
    } catch (e) {
      const fb = basicFeedback(safeAnswer);
      score = fb.score;
      feedback = fb.feedback;

      const questions = getFallbackQuestions(session.targetRole);
      nextQuestion =
        questions[session.turns.length] || "Thank you. Interview complete.";
    }

    session.turns[currentIndex].feedback = feedback;
    if (typeof score === "number") session.turns[currentIndex].score = score;

    const reachedMax = session.turns.length >= session.maxTurns;
    const shouldComplete = reachedMax;

    if (shouldComplete) {
      session.status = "completed";

      const avgScore = computeAverageTurnScore(session.turns);
      if (typeof avgScore === "number") session.finalScore = avgScore;

      if (!session.overallFeedback) {
        try {
          const assessment = await generateOverallAssessment({
            targetRole: session.targetRole,
            difficulty: session.difficulty,
            turns: session.turns,
          });
          if (assessment?.overallFeedback) {
            session.overallFeedback = assessment.overallFeedback;
          }
          if (typeof assessment?.finalScore === "number") {
            session.finalScore = assessment.finalScore;
          }
        } catch {
          session.overallFeedback =
            "Interview completed. Review per-question feedback and focus on giving structured answers with specific examples and measurable outcomes.";
        }
      }
      await session.save();

      return res.status(200).json({
        success: true,
        status: session.status,
        feedback,
        score,
        finalScore:
          typeof session.finalScore === "number"
            ? session.finalScore
            : undefined,
        overallFeedback: session.overallFeedback || undefined,
        done: true,
      });
    }

    session.turns.push({ question: nextQuestion });
    await session.save();

    return res.status(200).json({
      success: true,
      status: session.status,
      feedback,
      score,
      nextQuestion,
      done: false,
      turnIndex: session.turns.length - 1,
    });
  } catch (error) {
    console.error(error);
    const status =
      error instanceof HfError && error.status ? error.status : 500;
    return res
      .status(status)
      .json({ success: false, message: "Failed to submit answer" });
  }
};

export const finalizeInterview = async (req, res) => {
  try {
    const userId = req.id;
    const { id } = req.params;

    const session = await InterviewSession.findById(id);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    if (session.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    session.status = "completed";

    const avgScore = computeAverageTurnScore(session.turns);
    if (typeof avgScore === "number") session.finalScore = avgScore;

    if (!session.overallFeedback) {
      try {
        const assessment = await generateOverallAssessment({
          targetRole: session.targetRole,
          difficulty: session.difficulty,
          turns: session.turns,
        });
        if (assessment?.overallFeedback)
          session.overallFeedback = assessment.overallFeedback;
        if (typeof assessment?.finalScore === "number")
          session.finalScore = assessment.finalScore;
      } catch {
        session.overallFeedback =
          "Overall: focus on structured answers (STAR), clarity, and quantifying results. Use specific examples and avoid vague one-liners.";
      }
    }
    await session.save();

    return res.status(200).json({
      success: true,
      status: session.status,
      overallFeedback: session.overallFeedback,
      finalScore:
        typeof session.finalScore === "number" ? session.finalScore : undefined,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to finalize interview" });
  }
};

export const getMyInterviewSessions = async (req, res) => {
  try {
    const userId = req.id;
    const sessions = await InterviewSession.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("targetRole difficulty status createdAt updatedAt");

    return res.status(200).json({ success: true, sessions });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch sessions" });
  }
};

export const downloadInterviewPdf = async (req, res) => {
  try {
    const userId = req.id;
    const { id } = req.params;

    const session = await InterviewSession.findById(id);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    if (session.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const pdf = await buildInterviewPdfBuffer(session);
    const filename = `interview-report-${session._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=\"${filename}\"`,
    );
    return res.status(200).send(pdf);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate PDF" });
  }
};
