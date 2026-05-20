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
        <header className="hire-page-header">
          <h1 className="hire-title-lg">All jobs</h1>
          <p className="hire-subtitle">
            Explore openings and use the sidebar to filter by keyword.
          </p>
        </header>
        <div className="hire-layout-sidebar">
          <aside className="hire-sidebar">
            <FilterCard />
          </aside>
          {allJobs.length <= 0 ? (
            <div className="hire-empty-state hire-main-col flex items-center justify-center py-16 sm:py-20">
              No jobs match right now. Try another filter or check back later.
            </div>
          ) : (
            <div className="hire-jobs-scroll">
              <div className="hire-grid-jobs">
                {allJobs.map((job) => (
                  <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    key={job?._id}
                    className="min-w-0"
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
