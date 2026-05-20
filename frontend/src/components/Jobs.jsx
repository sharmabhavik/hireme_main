import React from "react";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import FilterCard from "./FilterCard";
import Job from "./Job";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import useGetAllJobs from "@/hooks/useGetAllJobs";

const Jobs = () => {
  useGetAllJobs({ pollIntervalMs: 4000 });
  const { allJobs } = useSelector((store) => store.job);

  return (
    <div className="hire-page">
      <Navbar />
      <div className="hire-page-content">
        <div className="mb-6 sm:mb-8">
          <h1 className="hire-title-lg">All jobs</h1>
          <p className="hire-subtitle">
            Explore openings and use the sidebar to filter by keyword.
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-72 lg:self-start">
            <FilterCard />
          </aside>
          {allJobs.length <= 0 ? (
            <div className="hire-empty-state flex flex-1 items-center justify-center py-16 sm:py-20">
              No jobs match right now. Try another filter or check back later.
            </div>
          ) : (
            <div className="hire-jobs-scroll min-h-0 flex-1">
              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
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
      <Footer />
    </div>
  );
};

export default Jobs;
