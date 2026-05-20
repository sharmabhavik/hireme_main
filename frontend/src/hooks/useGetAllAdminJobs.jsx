import { setAllAdminJobs } from "@/redux/jobSlice";
import { JOB_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllAdminJobs = (options = {}) => {
  const dispatch = useDispatch();
  const pollIntervalMs = options.pollIntervalMs;
  useEffect(() => {
    const canUseDOM = typeof document !== "undefined";
    const fetchAllAdminJobs = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/getadminjobs`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setAllAdminJobs(res.data.jobs));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchAllAdminJobs();
    if (typeof pollIntervalMs === "number" && pollIntervalMs > 0) {
      const tick = () => {
        if (canUseDOM && document.hidden) return;
        fetchAllAdminJobs();
      };
      const id = setInterval(tick, pollIntervalMs);

      const onVisibilityChange = () => {
        if (document.hidden) return;
        fetchAllAdminJobs();
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
  }, [dispatch, pollIntervalMs]);
};

export default useGetAllAdminJobs;
