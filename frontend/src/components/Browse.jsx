import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
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
    <div className="hire-page">
      <Navbar />
      <div className="hire-page-content">
        <header className="hire-page-header">
          <h1 className="hire-title-lg">Browse jobs</h1>
          <p className="hire-subtitle">
            Search by role, skill, company, or location.
          </p>
          <div className="hire-search-bar mt-4 max-w-full sm:mt-6 md:max-w-2xl lg:max-w-3xl">
            <input
              type="text"
              placeholder='Try "Full Stack", "Pune", "Backend"…'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              className="hire-search-input"
            />
            <Button
              type="button"
              onClick={submitSearch}
              className="h-11 shrink-0 rounded-none rounded-r-full px-4 sm:h-12 sm:px-6"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {!hasCriteria ? (
          <div className="hire-empty-state">
            <p className="font-medium text-foreground">Start by searching</p>
            <p className="mt-1 text-sm">
              Enter a keyword and press Enter or click the search button.
            </p>
          </div>
        ) : allJobs.length <= 0 ? (
          <div className="hire-empty-state">
            <p className="font-medium text-foreground">No matching jobs</p>
            <p className="mt-1 text-sm">
              Try a different keyword or adjust filters.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground sm:mb-6 sm:text-base">
              {allJobs.length} {allJobs.length === 1 ? "role" : "roles"}{" "}
              matched.
            </p>
            <div className="hire-grid-jobs">
              {allJobs.map((job) => (
                <Job key={job._id} job={job} />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Browse;
