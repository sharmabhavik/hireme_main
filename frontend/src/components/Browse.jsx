import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { Button } from "./ui/button";
import { Search } from "lucide-react";

const Browse = () => {
  const { allJobs, searchedQuery, filters } = useSelector((store) => store.job);
  const dispatch = useDispatch();
  const [query, setQuery] = useState(searchedQuery || "");

  const hasCriteria = useMemo(() => {
    return Boolean(
      (searchedQuery && searchedQuery.trim()) ||
      filters?.location ||
      filters?.industry ||
      filters?.salaryRange,
    );
  }, [
    searchedQuery,
    filters?.location,
    filters?.industry,
    filters?.salaryRange,
  ]);

  useGetAllJobs({ skip: !hasCriteria });

  useEffect(() => {
    return () => {
      dispatch(setSearchedQuery(""));
    };
  }, []);

  const submitSearch = () => {
    dispatch(setSearchedQuery(query));
  };

  return (
    <div className="min-h-screen bg-[oklch(0.99_0.005_165)]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Browse jobs
          </h1>
          <p className="mt-2 text-slate-600">
            Search by role, skill, company, or location.
          </p>
          <div className="mt-6 flex w-full max-w-2xl items-center gap-0 overflow-hidden rounded-full border border-slate-200/90 bg-white pl-4 shadow-sm">
            <input
              type="text"
              placeholder='Try "Full Stack", "Pune", "Backend"…'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              className="min-w-0 flex-1 border-none bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            <Button
              type="button"
              onClick={submitSearch}
              className="h-12 shrink-0 rounded-none rounded-r-full bg-emerald-600 px-6 text-white hover:bg-emerald-700"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {!hasCriteria ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 py-16 text-center text-slate-500">
            <p className="font-medium text-slate-700">Start by searching</p>
            <p className="mt-1 text-sm">
              Enter a keyword and press Enter or click the search button.
            </p>
          </div>
        ) : allJobs.length <= 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 py-16 text-center text-slate-500">
            <p className="font-medium text-slate-700">No matching jobs</p>
            <p className="mt-1 text-sm">
              Try a different keyword or adjust filters.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-slate-600">
              {allJobs.length} {allJobs.length === 1 ? "role" : "roles"}{" "}
              matched.
            </p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {allJobs.map((job) => (
                <Job key={job._id} job={job} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Browse;
