import { setSavedJobs } from "@/redux/jobSlice";
import { USER_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetSavedJobs = (options = {}) => {
  const dispatch = useDispatch();
  const pollIntervalMs = options.pollIntervalMs;

  useEffect(() => {
    if (options.skip) {
      return;
    }
    const canUseDOM = typeof document !== "undefined";
    const fetchSaved = async () => {
      try {
        const res = await axios.get(`${USER_API_END_POINT}/saved`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setSavedJobs(res.data.savedJobs || []));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSaved();
    if (typeof pollIntervalMs === "number" && pollIntervalMs > 0) {
      const tick = () => {
        if (canUseDOM && document.hidden) return;
        fetchSaved();
      };
      const id = setInterval(tick, pollIntervalMs);

      const onVisibilityChange = () => {
        if (document.hidden) return;
        fetchSaved();
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

export default useGetSavedJobs;
