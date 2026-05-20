import mongoose from "mongoose";

const interviewTurnSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    feedback: { type: String, default: "" },
    score: { type: Number, min: 0, max: 10 },
    round: {
      type: String,
      enum: ["hr", "aptitude", "coding"],
      default: "hr",
    },
  },
  { timestamps: true },
);

const interviewSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetRole: { type: String, required: true },
    round: {
      type: String,
      enum: ["hr", "aptitude", "coding"],
      default: "hr",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    maxTurns: { type: Number, default: 8 },
    turns: { type: [interviewTurnSchema], default: [] },
    overallFeedback: { type: String, default: "" },
    finalScore: { type: Number, min: 0, max: 10 },
  },
  { timestamps: true },
);

export const InterviewSession = mongoose.model(
  "InterviewSession",
  interviewSessionSchema,
);
