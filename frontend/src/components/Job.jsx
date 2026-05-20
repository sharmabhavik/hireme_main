import React from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { USER_API_END_POINT } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { setSavedJobs } from "@/redux/jobSlice";
import { setUser } from "@/redux/authSlice";

const Job = ({ job }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  const isSaved = (user?.savedJobs || []).some(
    (id) => id?.toString?.() === job?._id,
  );

  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
  };

  const saveForLaterHandler = async () => {
    try {
      if (!user) {
        toast.error("Please login first.");
        return;
      }
      const res = await axios.post(
        `${USER_API_END_POINT}/saved/${job?._id}`,
        null,
        { withCredentials: true },
      );
      if (res.data.success) {
        dispatch(setSavedJobs(res.data.savedJobs || []));
        dispatch(setUser({ ...user, savedJobs: res.data.savedJobs || [] }));
        toast.success(res.data.message || "Saved job.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save job");
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {daysAgoFunction(job?.createdAt) === 0
            ? "Posted today"
            : `${daysAgoFunction(job?.createdAt)} days ago`}
        </p>
        <Button
          variant="outline"
          className="rounded-full border-slate-200"
          size="icon"
          type="button"
        >
          <Bookmark className="size-4" />
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Button
          className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 p-0"
          variant="outline"
          size="icon"
        >
          <Avatar className="h-full w-full rounded-xl">
            <AvatarImage src={job?.company?.logo} alt={job?.company?.name} />
          </Avatar>
        </Button>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">
            {job?.company?.name}
          </h3>
          <p className="text-sm text-slate-500">{job?.location || "India"}</p>
        </div>
      </div>

      <div className="mt-4 flex-1">
        <h4 className="text-lg font-bold text-slate-900">{job?.title}</h4>
        <p className="mt-2 line-clamp-3 text-sm text-slate-600">
          {job?.description}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge
          className="border-0 bg-emerald-50 font-semibold text-emerald-800"
          variant="secondary"
        >
          {job?.position} open
        </Badge>
        <Badge
          className="border-0 bg-amber-50 font-semibold text-amber-900"
          variant="secondary"
        >
          {job?.jobType}
        </Badge>
        <Badge
          className="border-0 bg-slate-100 font-semibold text-slate-800"
          variant="secondary"
        >
          {job?.salary} LPA
        </Badge>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => navigate(`/description/${job?._id}`)}
          variant="outline"
          className="border-slate-300"
        >
          View details
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          type="button"
          onClick={saveForLaterHandler}
          disabled={isSaved}
        >
          {isSaved ? "Saved" : "Save for later"}
        </Button>
      </div>
    </div>
  );
};

export default Job;
