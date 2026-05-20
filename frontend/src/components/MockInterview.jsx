import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./shared/Navbar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { INTERVIEW_API_END_POINT } from "../utils/constant";

function getSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return SR ? new SR() : null;
}

function speak(text) {
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  } catch {
    // ignore
  }
}

export default function MockInterview() {
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [round, setRound] = useState(""); // hr | aptitude | coding

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [lastFeedback, setLastFeedback] = useState("");
  const [lastScore, setLastScore] = useState(null);
  const [done, setDone] = useState(false);
  const [pendingNextQuestion, setPendingNextQuestion] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pdfUrl = useMemo(() => {
    if (!sessionId) return "";
    return `${INTERVIEW_API_END_POINT}/${sessionId}/pdf`;
  }, [sessionId]);

  const startListening = () => {
    setError("");
    const recognition = getSpeechRecognition();
    if (!recognition) {
      setError(
        "SpeechRecognition not supported in this browser. Use Chrome/Edge.",
      );
      return;
    }

    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    let finalText = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      setAnswer((finalText + interim).trim());
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      setError(e?.error ? `Mic error: ${e.error}` : "Mic error");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  };

  const startInterview = async () => {
    setLoading(true);
    setError("");
    setDone(false);
    setLastFeedback("");
    setLastScore(null);
    setPendingNextQuestion("");
    try {
      const resp = await fetch(`${INTERVIEW_API_END_POINT}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetRole, difficulty, round }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        throw new Error(data?.message || "Failed to start");
      }

      setSessionId(data.sessionId);
      setQuestion(data.question);
      setAnswer("");
      speak(data.question);
    } catch (e) {
      setError(e?.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const canPickRound = Boolean(targetRole.trim()) && Boolean(difficulty);
  const canStart = canPickRound && Boolean(round) && !loading;

  const isTechnicalDomain = useMemo(() => {
    const lowered = String(targetRole || "").toLowerCase();
    if (!lowered.trim()) return false;
    const technicalHints = [
      "developer",
      "engineer",
      "qa",
      "test",
      "testing",
      "automation",
      "devops",
      "cloud",
      "data",
      "machine learning",
      "ml",
      "ai",
      "security",
      "cyber",
      "database",
      "dba",
    ];
    const nonTechnicalHints = [
      "graphic",
      "designer",
      "ui/ux",
      "ux",
      "product manager",
      "project manager",
      "business analyst",
      "marketing",
      "sales",
      "hr",
      "content",
      "customer support",
    ];
    if (nonTechnicalHints.some((k) => lowered.includes(k))) return false;
    return technicalHints.some((k) => lowered.includes(k));
  }, [targetRole]);

  const submitAnswer = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError("");

    try {
      const resp = await fetch(
        `${INTERVIEW_API_END_POINT}/${sessionId}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ answer }),
        },
      );
      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        throw new Error(data?.message || "Failed to submit");
      }

      setLastFeedback(data.feedback || "");
      setLastScore(typeof data.score === "number" ? data.score : null);

      if (data.done) {
        setDone(true);
        setPendingNextQuestion("");
        speak("Interview completed. You can download the PDF report.");
        // Take the user to the analysis dashboard immediately.
        navigate(`/interview/${sessionId}/analysis`);
        return;
      }

      setPendingNextQuestion(data.nextQuestion || "");
      setAnswer("");
    } catch (e) {
      setError(e?.message || "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const goToNextQuestion = () => {
    if (!pendingNextQuestion || done) return;
    setQuestion(pendingNextQuestion);
    setPendingNextQuestion("");
    setAnswer("");
    speak(pendingNextQuestion);
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">AI Mock Interview (Voice)</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm">Target Role</label>
            <Input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Frontend Developer"
              disabled={loading || Boolean(sessionId)}
              list="domain-options"
            />
            <datalist id="domain-options">
              <option value="Frontend Developer" />
              <option value="Backend Developer" />
              <option value="Full Stack Developer" />
              <option value="QA / Test Engineer" />
              <option value="Data Science" />
              <option value="Machine Learning Engineer" />
              <option value="Graphic Designer" />
              <option value="Business Analyst" />
              <option value="Product Manager" />
            </datalist>
          </div>
          <div>
            <label className="text-sm">Difficulty</label>
            <select
              className="w-full h-10 border rounded-md px-3 text-sm"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={loading || Boolean(sessionId)}
            >
              <option value="" disabled>
                Select difficulty
              </option>
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={round === "hr" ? "default" : "secondary"}
            onClick={() => setRound("hr")}
            disabled={!canPickRound || loading || Boolean(sessionId)}
          >
            HR Round
          </Button>
          <Button
            variant={round === "aptitude" ? "default" : "secondary"}
            onClick={() => setRound("aptitude")}
            disabled={!canPickRound || loading || Boolean(sessionId)}
          >
            Aptitude Round
          </Button>
          <Button
            variant={round === "coding" ? "default" : "secondary"}
            onClick={() => setRound("coding")}
            disabled={
              !canPickRound ||
              loading ||
              Boolean(sessionId) ||
              !isTechnicalDomain
            }
          >
            Coding Round
          </Button>
          {!isTechnicalDomain && canPickRound ? (
            <div className="text-xs text-muted-foreground self-center">
              Coding round is only for technical domains.
            </div>
          ) : null}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={startInterview}
            disabled={!canStart || Boolean(sessionId)}
          >
            Start Interview
          </Button>
          {question ? (
            <Button
              variant="secondary"
              onClick={() => speak(question)}
              disabled={loading}
            >
              Speak Question
            </Button>
          ) : null}
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        {question ? (
          <div className="border rounded-lg p-3 space-y-2">
            <div className="text-sm text-muted-foreground">Question</div>
            <div className="text-base">{question}</div>
          </div>
        ) : null}

        {question ? (
          <div className="border rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Your Answer</div>
              <div className="flex gap-2">
                {!isListening ? (
                  <Button
                    variant="secondary"
                    onClick={startListening}
                    disabled={loading}
                  >
                    Start Mic
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={stopListening}
                    disabled={loading}
                  >
                    Stop Mic
                  </Button>
                )}
              </div>
            </div>

            <textarea
              className="w-full min-h-32 border rounded-md p-2 text-sm"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type or speak your answer…"
              disabled={loading}
            />

            <div className="flex gap-2">
              <Button
                onClick={submitAnswer}
                disabled={
                  loading ||
                  !answer.trim() ||
                  done ||
                  Boolean(pendingNextQuestion)
                }
              >
                Submit Answer
              </Button>
              <Button
                variant="secondary"
                onClick={goToNextQuestion}
                disabled={loading || done || !pendingNextQuestion}
              >
                Next Question
              </Button>
              <Button
                variant="secondary"
                onClick={() => speak(answer)}
                disabled={loading || !answer.trim()}
              >
                Speak My Answer
              </Button>
            </div>
          </div>
        ) : null}

        {lastFeedback ? (
          <div className="border rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Feedback</div>
              {typeof lastScore === "number" ? (
                <div className="text-sm">Score: {lastScore}/10</div>
              ) : null}
            </div>
            <div className="text-sm whitespace-pre-wrap">{lastFeedback}</div>
          </div>
        ) : null}

        {sessionId ? (
          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              className={`text-sm underline ${done ? "" : "pointer-events-none opacity-50"}`}
              target="_blank"
              rel="noreferrer"
            >
              Download PDF report
            </a>
            {done ? (
              <Button
                variant="secondary"
                onClick={() => navigate(`/interview/${sessionId}/analysis`)}
              >
                View Analysis
              </Button>
            ) : null}
            {!done ? (
              <span className="text-xs text-muted-foreground">
                (available after completion)
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="text-xs text-muted-foreground">
          Tip: Use Chrome/Edge for best voice support.
        </div>
      </div>
    </div>
  );
}
