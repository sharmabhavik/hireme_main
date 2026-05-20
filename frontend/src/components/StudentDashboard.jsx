import React from "react";
import Navbar from "./shared/Navbar";
import AppliedJobTable from "./AppliedJobTable";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import useGetSavedJobs from "@/hooks/useGetSavedJobs";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const StudentDashboard = () => {
  useGetAppliedJobs({ pollIntervalMs: 4000 });
  useGetSavedJobs({ pollIntervalMs: 4000 });

  const { allAppliedJobs, savedJobs } = useSelector((store) => store.job);

  const statusCounts = (allAppliedJobs || []).reduce((acc, application) => {
    const status = (application?.status || "pending").toString();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, /** @type {Record<string, number>} */ ({}));

  return (
    <div className="min-h-screen bg-[oklch(0.99_0.005_165)]">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Student dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Track your applications and saved jobs.
              </p>
            </div>
            <Button asChild>
              <Link to="/practice">Practice Mock Interview</Link>
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Applications
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {allAppliedJobs?.length || 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Saved jobs</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {savedJobs?.length || 0}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-700">Selected</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {statusCounts.selected || 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-700">
                Interviewing
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {statusCounts.interviewing || 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-700">Rejected</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {statusCounts.rejected || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">Applications</h2>
          <p className="mt-1 text-sm text-slate-600">
            Roles you&apos;ve applied to.
          </p>
          <AppliedJobTable />
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">Saved jobs</h2>
          <p className="mt-1 text-sm text-slate-600">
            Roles you saved for later.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4">
            {savedJobs?.length ? (
              savedJobs.map((job) => (
                <div
                  key={job._id}
                  className="rounded-xl border border-slate-200/90 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {job?.title}
                      </p>
                      <p className="text-sm text-slate-600">
                        {job?.company?.name || ""}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {job?.location}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
                No saved jobs yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
