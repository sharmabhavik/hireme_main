import React from "react";
import Navbar from "./shared/Navbar";
import FilterCard from "./FilterCard";
import Job from "./Job";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import useGetAllJobs from "@/hooks/useGetAllJobs";

const Jobs = () => {
  useGetAllJobs({ pollIntervalMs: 4000 });
  const { allJobs } = useSelector((store) => store.job);

  return (
    <div className="min-h-screen bg-[oklch(0.99_0.005_165)]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            All jobs
          </h1>
          <p className="mt-2 text-slate-600">
            Explore openings and use the sidebar to filter by keyword.
          </p>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-72">
            <FilterCard />
          </aside>
          {allJobs.length <= 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/80 py-20 text-slate-500">
              No jobs match right now. Try another filter or check back later.
            </div>
          ) : (
            <div className="flex-1 h-[88vh] overflow-y-auto pb-8">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {allJobs.map((job) => (
                  <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    key={job?._id}
                  >
                    <Job job={job} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
