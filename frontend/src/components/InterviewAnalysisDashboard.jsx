import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./shared/Navbar";
import { Button } from "./ui/button";
import { INTERVIEW_API_END_POINT } from "../utils/constant";
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
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">
              Interview Analysis Dashboard
            </h1>
            <div className="text-sm text-muted-foreground">
              {session.targetRole ? `${session.targetRole} · ` : ""}
              {session.round ? `${String(session.round).toUpperCase()} · ` : ""}
              {session.difficulty ? `${session.difficulty}` : ""}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate("/practice")}>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="border rounded-lg p-4">
                <div className="text-xs text-muted-foreground">
                  Total Questions
                </div>
                <div className="text-2xl font-semibold">
                  {safeNum(summary.totalQuestions)}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-xs text-muted-foreground">
                  Average Score
                </div>
                <div className="text-2xl font-semibold">
                  {typeof summary.averageScore === "number"
                    ? summary.averageScore
                    : "—"}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-xs text-muted-foreground">Best Score</div>
                <div className="text-2xl font-semibold">
                  {typeof summary.bestScore === "number"
                    ? summary.bestScore
                    : "—"}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-xs text-muted-foreground">Worst Score</div>
                <div className="text-2xl font-semibold">
                  {typeof summary.worstScore === "number"
                    ? summary.worstScore
                    : "—"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="border rounded-lg p-4">
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

              <div className="border rounded-lg p-4">
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

              <div className="border rounded-lg p-4 lg:col-span-2">
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

              <div className="border rounded-lg p-4 lg:col-span-2">
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
              <div className="border rounded-lg p-4">
                <div className="font-medium">Overall Feedback</div>
                <div className="text-sm whitespace-pre-wrap mt-2">
                  {session.overallFeedback}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
