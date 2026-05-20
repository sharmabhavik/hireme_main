import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  answerTurn,
  downloadInterviewPdf,
  finalizeInterview,
  getInterviewAnalysis,
  getMyInterviewSessions,
  startInterview,
} from "../controllers/interview.controller.js";

const router = express.Router();

router.post("/start", isAuthenticated, startInterview);
router.post("/:id/answer", isAuthenticated, answerTurn);
router.post("/:id/finalize", isAuthenticated, finalizeInterview);
router.get("/:id/analysis", isAuthenticated, getInterviewAnalysis);
router.get("/:id/pdf", isAuthenticated, downloadInterviewPdf);
router.get("/me", isAuthenticated, getMyInterviewSessions);

export default router;
