import React from "react";
import Navbar from "../shared/Navbar";
import { useSelector } from "react-redux";
import useGetAllAdminJobs from "@/hooks/useGetAllAdminJobs";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const RecruiterDashboard = () => {
  useGetAllAdminJobs({ pollIntervalMs: 4000 });
  const { allAdminJobs } = useSelector((store) => store.job);
  const navigate = useNavigate();

  const activeJobs = (allAdminJobs || []).filter((j) => !j?.isDeleted);

  return (
    <div className="min-h-screen bg-[oklch(0.99_0.005_165)]">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Recruiter dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Overview of your postings.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Total jobs</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {allAdminJobs?.length || 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Active jobs
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {activeJobs.length}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Quick links</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                className="text-sm font-medium text-emerald-700 hover:underline"
                onClick={() => navigate("/admin/companies")}
              >
                Manage companies
              </button>
              <button
                type="button"
                className="text-sm font-medium text-emerald-700 hover:underline"
                onClick={() => navigate("/admin/jobs")}
              >
                Manage jobs
              </button>
              <button
                type="button"
                className="text-sm font-medium text-emerald-700 hover:underline"
                onClick={() => navigate("/admin/jobs/create")}
              >
                Post a job
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Posted jobs</h2>
          <p className="mt-1 text-sm text-slate-600">
            Click a job to view applicants.
          </p>

          <div className="mt-6">
            <Table>
              <TableCaption>Your posted jobs (latest first)</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(allAdminJobs || []).length ? (
                  (allAdminJobs || []).map((job) => (
                    <TableRow
                      key={job._id}
                      className="cursor-pointer"
                      onClick={() =>
                        navigate(`/admin/jobs/${job._id}/applicants`)
                      }
                    >
                      <TableCell className="font-medium text-slate-900">
                        {job?.title}
                      </TableCell>
                      <TableCell>{job?.company?.name}</TableCell>
                      <TableCell>{job?.location}</TableCell>
                      <TableCell>{job?.applications?.length ?? 0}</TableCell>
                      <TableCell>{job?.createdAt?.split?.("T")?.[0]}</TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-300"
                          onClick={() =>
                            navigate(`/admin/jobs/${job._id}/applicants`)
                          }
                        >
                          View applicants
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-slate-600">
                      No jobs posted yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
