import React from "react";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
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
    <div className="hire-page">
      <Navbar />
      <div className="hire-page-content hire-page-content-medium">
        <div className="hire-card-padded">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="hire-title">
                Student dashboard
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Track your applications and saved jobs.
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/practice">Practice Mock Interview</Link>
            </Button>
          </div>
          <div className="hire-grid-stats-2 mt-6">
            <div className="hire-stat-box">
              <p className="text-sm font-semibold text-muted-foreground">
                Applications
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {allAppliedJobs?.length || 0}
              </p>
            </div>
            <div className="hire-stat-box">
              <p className="text-sm font-semibold text-muted-foreground">Saved jobs</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {savedJobs?.length || 0}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="hire-stat-box">
              <p className="text-sm font-semibold text-muted-foreground">Selected</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {statusCounts.selected || 0}
              </p>
            </div>
            <div className="hire-stat-box">
              <p className="text-sm font-semibold text-muted-foreground">
                Interviewing
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {statusCounts.interviewing || 0}
              </p>
            </div>
            <div className="hire-stat-box">
              <p className="text-sm font-semibold text-muted-foreground">Rejected</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {statusCounts.rejected || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10">
          <h2 className="text-lg font-bold text-foreground">Applications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Roles you&apos;ve applied to.
          </p>
          <AppliedJobTable />
        </div>

        <div className="mt-8 sm:mt-10">
          <h2 className="text-lg font-bold text-foreground">Saved jobs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Roles you saved for later.
          </p>
          <div className="hire-grid-jobs mt-4">
            {savedJobs?.length ? (
              savedJobs.map((job) => (
                <div
                  key={job._id}
                  className="hire-card p-4"
                >
                  <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {job?.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {job?.company?.name || ""}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {job?.location}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="hire-empty-state col-span-full py-8 text-sm">
                No saved jobs yet.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
