import { setAllJobs } from "@/redux/jobSlice";
import { JOB_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const parseSalaryRangeToMinMax = (salaryRange) => {
  // Salary is displayed/stored as LPA in this project.
  // We support a few common ranges used by the FilterCard.
  switch (salaryRange) {
    case "0-5 LPA":
      return { minSalary: 0, maxSalary: 5 };
    case "5-10 LPA":
      return { minSalary: 5, maxSalary: 10 };
    case "10-20 LPA":
      return { minSalary: 10, maxSalary: 20 };
    case "20+ LPA":
      return { minSalary: 20 };
    default:
      return {};
  }
};

const useGetAllJobs = (options = {}) => {
  const dispatch = useDispatch();
  const { searchedQuery, filters } = useSelector((store) => store.job);
  const pollIntervalMs = options.pollIntervalMs;
  useEffect(() => {
    if (options.skip) {
      return;
    }
    const canUseDOM = typeof document !== "undefined";
    const fetchAllJobs = async () => {
      try {
        const { minSalary, maxSalary } = parseSalaryRangeToMinMax(
          filters?.salaryRange,
        );
        const res = await axios.get(`${JOB_API_END_POINT}/get`, {
          withCredentials: true,
          params: {
            keyword: searchedQuery || "",
            location: filters?.location || "",
            industry: filters?.industry || "",
            ...(minSalary !== undefined ? { minSalary } : {}),
            ...(maxSalary !== undefined ? { maxSalary } : {}),
          },
        });
        if (res.data.success) {
          dispatch(setAllJobs(res.data.jobs));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchAllJobs();

    if (typeof pollIntervalMs === "number" && pollIntervalMs > 0) {
      const tick = () => {
        if (canUseDOM && document.hidden) return;
        fetchAllJobs();
      };
      const id = setInterval(tick, pollIntervalMs);

      const onVisibilityChange = () => {
        if (document.hidden) return;
        fetchAllJobs();
      };
      if (canUseDOM) {
        document.addEventListener("visibilitychange", onVisibilityChange);
      }

      return () => {
        clearInterval(id);
        if (canUseDOM) {
          document.removeEventListener("visibilitychange", onVisibilityChange);
        }
      };
    }
  }, [
    searchedQuery,
    filters?.location,
    filters?.industry,
    filters?.salaryRange,
    dispatch,
    options.skip,
    pollIntervalMs,
  ]);
};

export default useGetAllJobs;
