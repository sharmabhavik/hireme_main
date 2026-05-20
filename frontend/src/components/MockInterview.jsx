import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { INTERVIEW_API_END_POINT } from "../utils/constant";
import InterviewQuestionCard from "./InterviewQuestionCard";
import { formatFeedbackDisplay } from "@/utils/interviewFormat";

function getSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return SR ? new SR() : null;
}

const VOICE_STORAGE_KEY = "hireme-mock-interview-voice";

/** English voices from the browser — free, no API key (best on Chrome / Edge). */
function getEnglishVoices() {
  const all = window.speechSynthesis?.getVoices() || [];
  return all
    .filter((v) => v.lang?.toLowerCase().startsWith("en"))
    .sort((a, b) => {
      const score = (v) => {
        let s = 0;
        if (/google.*english/i.test(v.name)) s += 50;
        if (/microsoft.*natural/i.test(v.name)) s += 45;
        if (/natural|neural|premium/i.test(v.name)) s += 35;
        if (/samantha|karen|daniel|moira|tessa|zira|jenny|aria/i.test(v.name))
          s += 25;
        if (v.lang === "en-US") s += 10;
        if (v.default) s += 5;
        return s;
      };
      return score(b) - score(a);
    });
}

/** Auto-pick the smoothest free voice available on this device. */
function pickPreferredVoice(voices) {
  if (!voices?.length) return null;
  return voices[0];
}

function resolveVoice(voices, voiceURI) {
  if (!voices?.length) return null;
  if (voiceURI) {
    const found = voices.find((v) => v.voiceURI === voiceURI);
    if (found) return found;
  }
  return pickPreferredVoice(voices);
}

export default function MockInterview() {
  const recognitionRef = useRef(null);
  const listenIntentRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const voicesRef = useRef([]);
  const speakRetryRef = useRef(null);
  const navigate = useNavigate();

  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");

  const [targetRole, setTargetRole] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [round, setRound] = useState("");

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [lastFeedback, setLastFeedback] = useState("");
  const [lastScore, setLastScore] = useState(null);
  const [done, setDone] = useState(false);
  const [pendingNextQuestion, setPendingNextQuestion] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answeredCount, setAnsweredCount] = useState(0);
  const [maxTurns, setMaxTurns] = useState(5);

  useEffect(() => {
    const loadVoices = () => {
      const en = getEnglishVoices();
      voicesRef.current = en;
      setAvailableVoices(en);

      if (en.length === 0) return;

      const saved = localStorage.getItem(VOICE_STORAGE_KEY);
      const savedVoice = saved ? en.find((v) => v.voiceURI === saved) : null;
      const defaultVoice = savedVoice || pickPreferredVoice(en);

      setSelectedVoiceURI((current) => {
        if (current && en.some((v) => v.voiceURI === current)) return current;
        return defaultVoice?.voiceURI || en[0].voiceURI;
      });
    };

    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
      if (speakRetryRef.current) {
        clearTimeout(speakRetryRef.current);
      }
    };
  }, []);

  const activeVoice = useMemo(
    () => resolveVoice(availableVoices, selectedVoiceURI),
    [availableVoices, selectedVoiceURI],
  );

  const handleVoiceChange = (uri) => {
    setSelectedVoiceURI(uri);
    localStorage.setItem(VOICE_STORAGE_KEY, uri);
  };

  const stopSpeaking = useCallback(() => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      // ignore
    }
    setIsSpeaking(false);
  }, []);

  const speakWithVoice = useCallback(
    (text, voiceURI, isRetry = false) => {
      const trimmed = String(text || "").trim();
      if (!trimmed || !window.speechSynthesis) return;

      const voices =
        voicesRef.current.length > 0
          ? voicesRef.current
          : getEnglishVoices();
      voicesRef.current = voices;

      const voice = resolveVoice(voices, voiceURI || selectedVoiceURI);

      if (!voice && voices.length === 0 && !isRetry) {
        speakRetryRef.current = setTimeout(() => {
          const loaded = getEnglishVoices();
          if (loaded.length) {
            voicesRef.current = loaded;
            setAvailableVoices(loaded);
            speakWithVoice(text, voiceURI || selectedVoiceURI, true);
          } else {
            setError(
              "No AI voice found. Open this page in Chrome or Edge, then try Preview voice.",
            );
          }
        }, 300);
        return;
      }

      stopSpeaking();

      const utter = new SpeechSynthesisUtterance(trimmed);
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = "en-US";
      }
      utter.rate = 0.9;
      utter.pitch = 1;
      utter.volume = 1;

      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utter);
    },
    [selectedVoiceURI, stopSpeaking],
  );

  const speak = useCallback(
    (text) => speakWithVoice(text, selectedVoiceURI),
    [speakWithVoice, selectedVoiceURI],
  );

  const previewVoice = () => {
    speakWithVoice(
      "Hello. I will read your interview questions in this voice.",
      selectedVoiceURI,
    );
  };

  const stopListening = useCallback(() => {
    listenIntentRef.current = false;
    setIsListening(false);
    try {
      recognitionRef.current?.abort();
    } catch {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    }
    recognitionRef.current = null;
  }, []);

  const startListening = useCallback(() => {
    setError("");
    stopSpeaking();

    const recognition = getSpeechRecognition();
    if (!recognition) {
      setError(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
      );
      return;
    }

    stopListening();

    recognitionRef.current = recognition;
    listenIntentRef.current = true;
    finalTranscriptRef.current = answer.trim() ? `${answer.trim()} ` : "";

    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || "";
        if (result.isFinal) {
          finalTranscriptRef.current += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      setAnswer((finalTranscriptRef.current + interim).trim());
    };

    recognition.onerror = (e) => {
      if (e?.error === "aborted") return;
      listenIntentRef.current = false;
      setIsListening(false);
      if (e?.error === "not-allowed") {
        setError("Microphone permission denied. Allow mic access and try again.");
      } else if (e?.error === "no-speech") {
        setError("No speech detected. Speak clearly and try again.");
      } else {
        setError(e?.error ? `Mic error: ${e.error}` : "Mic error");
      }
    };

    recognition.onend = () => {
      if (!listenIntentRef.current) {
        setIsListening(false);
        return;
      }
      try {
        recognition.start();
      } catch {
        listenIntentRef.current = false;
        setIsListening(false);
      }
    };

    setIsListening(true);
    try {
      recognition.start();
    } catch {
      listenIntentRef.current = false;
      setIsListening(false);
      setError("Could not start microphone. Wait a moment and try again.");
    }
  }, [answer, stopListening, stopSpeaking]);

  const startInterview = async () => {
    stopListening();
    stopSpeaking();
    setLoading(true);
    setError("");
    setDone(false);
    setLastFeedback("");
    setLastScore(null);
    setPendingNextQuestion("");
    setAnsweredCount(0);
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
      setMaxTurns(data.maxTurns ?? 5);
      setAnsweredCount(data.answeredCount ?? 0);
      setAnswer("");
      finalTranscriptRef.current = "";
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
    stopListening();
    stopSpeaking();
    setLoading(true);
    setError("");

    try {
      const resp = await fetch(
        `${INTERVIEW_API_END_POINT}/${sessionId}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ answer: answer.trim() }),
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
        navigate(`/interview/${sessionId}/analysis`);
        return;
      }

      setPendingNextQuestion(data.nextQuestion || "");
      setAnswer("");
      finalTranscriptRef.current = "";
    } catch (e) {
      setError(e?.message || "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const goToNextQuestion = () => {
    if (!pendingNextQuestion || done) return;
    stopListening();
    setQuestion(pendingNextQuestion);
    setPendingNextQuestion("");
    setAnswer("");
    finalTranscriptRef.current = "";
    speak(pendingNextQuestion);
  };

  const endInterviewEarly = async () => {
    if (!sessionId || done) return;
    if (answeredCount < 1) {
      setError("Answer at least one question before ending the interview.");
      return;
    }

    const ok = window.confirm(
      `End mock interview now?\n\nYour report will include ${answeredCount} answered question${answeredCount === 1 ? "" : "s"} (up to ${maxTurns} max).`,
    );
    if (!ok) return;

    stopListening();
    stopSpeaking();
    setLoading(true);
    setError("");

    try {
      const resp = await fetch(
        `${INTERVIEW_API_END_POINT}/${sessionId}/finalize`,
        { method: "POST", credentials: "include" },
      );
      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        throw new Error(data?.message || "Failed to end interview");
      }

      setDone(true);
      setPendingNextQuestion("");
      setQuestion("");
      if (typeof data.answeredCount === "number") {
        setAnsweredCount(data.answeredCount);
      }
      navigate(`/interview/${sessionId}/analysis`);
    } catch (e) {
      setError(e?.message || "Failed to end interview");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestionNumber = pendingNextQuestion
    ? answeredCount + 1
    : answeredCount + (question ? 1 : 0);

  const feedbackBullets = formatFeedbackDisplay(lastFeedback);

  useEffect(() => {
    return () => {
      listenIntentRef.current = false;
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  return (
    <div className="hire-page">
      <Navbar />
      <div className="hire-page-content hire-page-content-compact space-y-4 sm:space-y-6">
        <h1 className="hire-title text-2xl sm:text-3xl">AI Mock Interview (Voice)</h1>

        <div className="hire-card space-y-3 p-3 sm:p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">AI interviewer voice</p>
              <p className="text-xs text-muted-foreground">
                Free browser voice (Chrome / Edge recommended). Pick a natural English voice below.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={previewVoice}
              disabled={isSpeaking || availableVoices.length === 0}
              className="w-full shrink-0 sm:w-auto"
            >
              Preview voice
            </Button>
          </div>
          {availableVoices.length > 0 ? (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground" htmlFor="ai-voice-select">
                Voice
              </label>
              <select
                id="ai-voice-select"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={selectedVoiceURI}
                onChange={(e) => handleVoiceChange(e.target.value)}
                disabled={isSpeaking}
              >
                {availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
              {activeVoice ? (
                <p className="text-xs text-muted-foreground">
                  Using: <span className="font-medium text-foreground">{activeVoice.name}</span>
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Voices still loading — use Chrome or Edge, or click Preview voice in a moment.
            </p>
          )}
        </div>

        <div className="hire-form-grid lg:grid-cols-3">
          <div className="lg:col-span-2">
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
              className="w-full h-10 border rounded-md px-3 text-sm bg-background text-foreground"
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

        <div className="hire-stack-sm flex-wrap">
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

        {sessionId && !done ? (
          <div className="hire-card flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                Progress: {answeredCount} answered
              </span>
              {" · "}
              Up to {maxTurns} questions
              {!pendingNextQuestion && question
                ? ` · On question ${currentQuestionNumber}`
                : null}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={endInterviewEarly}
              disabled={loading || answeredCount < 1}
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 sm:w-auto"
            >
              End mock interview
            </Button>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            onClick={startInterview}
            disabled={!canStart || Boolean(sessionId)}
            className="w-full sm:w-auto"
          >
            Start Interview
          </Button>
          {question && !pendingNextQuestion ? (
            <>
              <Button
                variant="secondary"
                onClick={() => speak(question)}
                disabled={loading || isSpeaking}
                className="w-full sm:w-auto"
              >
                Speak Question
              </Button>
              <Button
                variant="destructive"
                onClick={stopSpeaking}
                disabled={!isSpeaking}
                className="w-full sm:w-auto"
              >
                Stop Speaking
              </Button>
            </>
          ) : null}
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        {isSpeaking ? (
          <p className="text-xs text-muted-foreground">
            AI is reading the question — use Stop Speaking before using the mic so your answer is not mixed with the question audio.
          </p>
        ) : null}

        {pendingNextQuestion ? (
          <div className="hire-card border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-foreground">
              Answer submitted — review feedback below, then continue.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Next question is ready when you click &quot;Next Question&quot;.
            </p>
          </div>
        ) : null}

        {question && !pendingNextQuestion ? (
          <InterviewQuestionCard
            question={question}
            questionNumber={currentQuestionNumber}
            round={round}
            difficulty={difficulty}
          />
        ) : null}

        {question && !pendingNextQuestion ? (
          <div className="hire-card space-y-3 p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">Your Answer</div>
              <div className="flex flex-wrap gap-2">
                {!isListening ? (
                  <Button
                    variant="secondary"
                    onClick={startListening}
                    disabled={loading || isSpeaking}
                    className="w-full sm:w-auto"
                  >
                    Start Mic
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={stopListening}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    Stop Mic
                  </Button>
                )}
                {isSpeaking ? (
                  <Button
                    variant="destructive"
                    onClick={stopSpeaking}
                    className="w-full sm:w-auto"
                  >
                    Stop Speaking
                  </Button>
                ) : null}
              </div>
            </div>

            <textarea
              className="w-full min-h-32 rounded-md border border-input bg-background p-2 text-sm text-foreground"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                finalTranscriptRef.current = e.target.value.trim()
                  ? `${e.target.value.trim()} `
                  : "";
              }}
              placeholder="Type your answer, or use Start Mic after the question finishes speaking…"
              disabled={loading}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                onClick={submitAnswer}
                disabled={
                  loading ||
                  !answer.trim() ||
                  done ||
                  Boolean(pendingNextQuestion) ||
                  isListening
                }
                className="w-full sm:w-auto"
              >
                Submit Answer
              </Button>
              <Button
                variant="secondary"
                onClick={goToNextQuestion}
                disabled={loading || done || !pendingNextQuestion}
                className="w-full sm:w-auto"
              >
                Next Question
              </Button>
              <Button
                variant="secondary"
                onClick={() => speak(answer)}
                disabled={loading || !answer.trim() || isSpeaking}
                className="w-full sm:w-auto"
              >
                Hear My Answer
              </Button>
            </div>
          </div>
        ) : null}

        {lastFeedback ? (
          <div className="hire-card space-y-2 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium text-foreground">
                Feedback on question {answeredCount}
              </div>
              {typeof lastScore === "number" ? (
                <span className="hire-badge-primary text-xs">
                  Score: {lastScore}/10
                </span>
              ) : null}
            </div>
            {feedbackBullets.length > 0 ? (
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground/90">
                {feedbackBullets.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {lastFeedback}
              </p>
            )}
          </div>
        ) : null}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong className="text-foreground">AI voice:</strong> built into your browser (no extra cost).
            For the smoothest sound, use Edge or Chrome and choose a voice labeled Google English or Microsoft Natural.
          </p>
          <p>Best experience: quiet room, headphones, Stop Speaking before Start Mic.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
