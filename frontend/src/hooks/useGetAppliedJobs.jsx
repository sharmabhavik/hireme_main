import { setAllAppliedJobs } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAppliedJobs = (options = {}) => {
  const dispatch = useDispatch();
  const pollIntervalMs = options.pollIntervalMs;

  useEffect(() => {
    if (options.skip) {
      return;
    }
    const canUseDOM = typeof document !== "undefined";
    const fetchAppliedJobs = async () => {
      try {
        const res = await axios.get(`${APPLICATION_API_END_POINT}/get`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setAllAppliedJobs(res.data.application));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchAppliedJobs();

    if (typeof pollIntervalMs === "number" && pollIntervalMs > 0) {
      const tick = () => {
        if (canUseDOM && document.hidden) return;
        fetchAppliedJobs();
      };

      const id = setInterval(tick, pollIntervalMs);

      const onVisibilityChange = () => {
        if (document.hidden) return;
        fetchAppliedJobs();
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
  }, [dispatch, options.skip, pollIntervalMs]);
};
export default useGetAppliedJobs;
