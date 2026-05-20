import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import { Button } from "./ui/button";
import { INTERVIEW_API_END_POINT } from "../utils/constant";
import InterviewQuestionCard from "./InterviewQuestionCard";
import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BUCKET_LABELS = {
  outstanding: "Outstanding",
  average: "Average",
  underAverage: "Under Average",
  unscored: "Unscored",
};

const BUCKET_COLORS = {
  outstanding: "hsl(var(--chart-1))",
  average: "hsl(var(--chart-2))",
  underAverage: "hsl(var(--chart-3))",
  unscored: "hsl(var(--muted-foreground))",
};

function safeNum(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export default function InterviewAnalysisDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const pdfUrl = useMemo(() => {
    if (!id) return "";
    return `${INTERVIEW_API_END_POINT}/${id}/pdf`;
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const resp = await fetch(`${INTERVIEW_API_END_POINT}/${id}/analysis`, {
          credentials: "include",
        });
        const json = await resp.json();
        if (!resp.ok || !json?.success) {
          throw new Error(json?.message || "Failed to load analysis");
        }
        setData(json);
      } catch (e) {
        setError(e?.message || "Failed to load analysis");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const buckets = data?.buckets?.counts || {};

  const pieData = useMemo(() => {
    const order = ["outstanding", "average", "underAverage", "unscored"];
    return order
      .map((key) => ({
        key,
        name: BUCKET_LABELS[key] || key,
        value: safeNum(buckets[key]),
      }))
      .filter((d) => d.value > 0);
  }, [buckets]);

  const barBucketData = useMemo(() => {
    const order = ["outstanding", "average", "underAverage", "unscored"];
    return order.map((key) => ({
      bucket: BUCKET_LABELS[key] || key,
      value: safeNum(buckets[key]),
      key,
    }));
  }, [buckets]);

  const perQuestion = useMemo(() => {
    const arr = Array.isArray(data?.perQuestion) ? data.perQuestion : [];
    return arr.map((q) => ({
      index: q.index,
      question: q.question,
      score: typeof q.score === "number" ? q.score : null,
      bucket: q.bucket,
    }));
  }, [data]);

  const scoreBarData = useMemo(() => {
    return perQuestion.map((q) => ({
      name: `Q${q.index}`,
      score: q.score ?? 0,
      bucket: q.bucket,
    }));
  }, [perQuestion]);

  const summary = data?.summary || {};
  const session = data?.session || {};

  return (
    <div className="hire-page">
      <Navbar />
      <div className="hire-page-content hire-page-content-medium space-y-4 sm:space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:flex-wrap">
          <div>
            <h1 className="hire-title text-2xl sm:text-3xl">
              Mock Interview Results
            </h1>
            <div className="mt-1 text-sm text-muted-foreground">
              {session.targetRole ? `${session.targetRole}` : ""}
              {session.round ? ` · ${String(session.round).toUpperCase()}` : ""}
              {session.difficulty ? ` · ${session.difficulty}` : ""}
            </div>
            {session.endedEarly ? (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                Interview ended early — report includes answered questions only.
              </p>
            ) : null}
          </div>
          <div className="hire-toolbar-actions w-full sm:w-auto">
            <Button asChild className="w-full sm:w-auto gap-2">
              <a href={pdfUrl} target="_blank" rel="noreferrer" download>
                <Download className="size-4" />
                Download report (PDF)
              </a>
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => navigate("/practice")}
            >
              Start New Interview
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading analysis…</div>
        ) : null}
        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        {data ? (
          <>
            <div className="hire-grid-stats-4">
              <div className="hire-card p-4">
                <div className="text-xs text-muted-foreground">
                  Questions Answered
                </div>
                <div className="text-2xl font-semibold">
                  {safeNum(summary.answeredQuestions ?? summary.totalQuestions)}
                </div>
              </div>
              <div className="hire-card p-4">
                <div className="text-xs text-muted-foreground">
                  Average Score
                </div>
                <div className="text-2xl font-semibold">
                  {typeof summary.averageScore === "number"
                    ? summary.averageScore
                    : "—"}
                </div>
              </div>
              <div className="hire-card p-4">
                <div className="text-xs text-muted-foreground">Best Score</div>
                <div className="text-2xl font-semibold">
                  {typeof summary.bestScore === "number"
                    ? summary.bestScore
                    : "—"}
                </div>
              </div>
              <div className="hire-card p-4">
                <div className="text-xs text-muted-foreground">Worst Score</div>
                <div className="text-2xl font-semibold">
                  {typeof summary.worstScore === "number"
                    ? summary.worstScore
                    : "—"}
                </div>
              </div>
            </div>

            {perQuestion.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Questions &amp; scores
                </h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {perQuestion.map((q) => (
                    <div key={q.index} className="space-y-2">
                      <InterviewQuestionCard
                        question={q.question}
                        questionNumber={q.index}
                        round={session.round}
                        difficulty={session.difficulty}
                      />
                      {typeof q.score === "number" ? (
                        <p className="text-sm text-muted-foreground pl-1">
                          Score:{" "}
                          <span className="font-semibold text-foreground">
                            {q.score}/10
                          </span>
                          {" · "}
                          {BUCKET_LABELS[q.bucket] || q.bucket}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="hire-grid-charts">
              <div className="hire-card p-4">
                <div className="font-medium">Performance Distribution</div>
                <div className="text-xs text-muted-foreground">
                  Outstanding vs Average vs Under Average
                </div>
                <div className="h-72 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {pieData.map((entry) => (
                          <Cell
                            key={entry.key}
                            fill={
                              BUCKET_COLORS[entry.key] || "hsl(var(--muted))"
                            }
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="hire-card p-4">
                <div className="font-medium">Bucket Counts</div>
                <div className="text-xs text-muted-foreground">
                  How many questions fall in each bucket
                </div>
                <div className="h-72 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barBucketData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value">
                        {barBucketData.map((entry) => (
                          <Cell
                            key={entry.key}
                            fill={
                              BUCKET_COLORS[entry.key] || "hsl(var(--muted))"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="hire-card p-4 lg:col-span-2">
                <div className="font-medium">Score Per Question</div>
                <div className="text-xs text-muted-foreground">
                  Quickly spot where you performed best/worst
                </div>
                <div className="h-80 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreBarData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Bar dataKey="score">
                        {scoreBarData.map((entry, idx) => (
                          <Cell
                            key={`${entry.name}-${idx}`}
                            fill={
                              BUCKET_COLORS[entry.bucket] || "hsl(var(--muted))"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="hire-card p-4 lg:col-span-2">
                <div className="font-medium">Score Trend</div>
                <div className="text-xs text-muted-foreground">
                  See if you improved as the interview progressed
                </div>
                <div className="h-72 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={perQuestion}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="index" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--foreground))"
                        strokeWidth={2}
                        dot
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {session.overallFeedback ? (
              <div className="hire-card p-4">
                <div className="font-medium">Overall Feedback</div>
                <div className="text-sm whitespace-pre-wrap mt-2 text-muted-foreground">
                  {session.overallFeedback}
                </div>
              </div>
            ) : null}

            <div className="flex justify-center pt-2">
              <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
                <a href={pdfUrl} target="_blank" rel="noreferrer" download>
                  <Download className="size-4" />
                  Download full report (PDF)
                </a>
              </Button>
            </div>
          </>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}
