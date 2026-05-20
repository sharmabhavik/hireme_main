import React, { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Footer from "./shared/Footer";
import { useParams } from "react-router-dom";
import axios from "axios";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from "@/utils/constant";
import { setSavedJobs, setSingleJob } from "@/redux/jobSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Navbar from "./shared/Navbar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { setUser } from "@/redux/authSlice";
import { USER_API_END_POINT } from "@/utils/constant";

const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const isIntiallyApplied =
    singleJob?.applications?.some(
      (application) => application.applicant === user?._id,
    ) || false;
  const [isApplied, setIsApplied] = useState(isIntiallyApplied);
  const [applyMenuOpen, setApplyMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editDetails, setEditDetails] = useState({
    experienceYears: user?.profile?.experienceYears ?? "",
    currentLocation: user?.profile?.currentLocation ?? "",
    designation: user?.profile?.designation ?? "",
    resumeFile: null,
  });

  const params = useParams();
  const jobId = params.id;
  const dispatch = useDispatch();

  const isSaved = (user?.savedJobs || []).some(
    (id) => id?.toString?.() === jobId?.toString?.(),
  );

  const applyJobHandler = async () => {
    try {
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/apply/${jobId}`,
        null,
        { withCredentials: true },
      );

      if (res.data.success) {
        setIsApplied(true);
        const updatedSingleJob = {
          ...singleJob,
          applications: [...singleJob.applications, { applicant: user?._id }],
        };
        dispatch(setSingleJob(updatedSingleJob));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to apply.");
    }
  };

  const saveProfileThenApply = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const formData = new FormData();
      formData.append("experienceYears", editDetails.experienceYears);
      formData.append("currentLocation", editDetails.currentLocation);
      formData.append("designation", editDetails.designation);
      if (editDetails.resumeFile) {
        formData.append("file", editDetails.resumeFile);
      }

      const res = await axios.post(
        `${USER_API_END_POINT}/profile/update`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      if (res.data.success) {
        dispatch(setUser(res.data.user));
      }

      setEditOpen(false);
      setApplyMenuOpen(false);
      await applyJobHandler();
      toast.success("Details saved and application submitted.");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save details.");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveForLaterHandler = async () => {
    try {
      if (!user) {
        toast.error("Please login first.");
        return;
      }
      const res = await axios.post(
        `${USER_API_END_POINT}/saved/${jobId}`,
        null,
        {
          withCredentials: true,
        },
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

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
          setIsApplied(
            res.data.job.applications.some(
              (application) => application.applicant === user?._id,
            ),
          );
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchSingleJob();
  }, [jobId, dispatch, user?._id]);

  return (
    <div className="min-h-screen bg-[oklch(0.99_0.005_165)]">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {singleJob?.title}
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {singleJob?.company?.name || ""}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge
                  className="border-0 bg-emerald-50 font-semibold text-emerald-800"
                  variant="secondary"
                >
                  {singleJob?.position} positions
                </Badge>
                <Badge
                  className="border-0 bg-amber-50 font-semibold text-amber-900"
                  variant="secondary"
                >
                  {singleJob?.jobType}
                </Badge>
                <Badge
                  className="border-0 bg-slate-100 font-semibold text-slate-800"
                  variant="secondary"
                >
                  {singleJob?.salary} LPA
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Popover open={applyMenuOpen} onOpenChange={setApplyMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    disabled={isApplied}
                    className={`shrink-0 rounded-xl px-8 ${isApplied ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
                  >
                    {isApplied ? "Already applied" : "Apply now"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={async () => {
                        setApplyMenuOpen(false);
                        await applyJobHandler();
                      }}
                    >
                      Apply with existing details
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setEditOpen(true);
                      }}
                    >
                      Edit details
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-slate-300"
                onClick={saveForLaterHandler}
                disabled={isSaved}
              >
                {isSaved ? "Saved" : "Save for later"}
              </Button>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-100 pt-8">
            <h2 className="text-lg font-semibold text-slate-900">
              About this role
            </h2>
            <dl className="mt-4 space-y-3 text-slate-700">
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="shrink-0 font-semibold text-slate-900 sm:w-48">
                  Role
                </dt>
                <dd>{singleJob?.title}</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="shrink-0 font-semibold text-slate-900 sm:w-48">
                  Location
                </dt>
                <dd>{singleJob?.location}</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="shrink-0 font-semibold text-slate-900 sm:w-48">
                  Description
                </dt>
                <dd className="leading-relaxed">{singleJob?.description}</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="shrink-0 font-semibold text-slate-900 sm:w-48">
                  Experience
                </dt>
                <dd>{singleJob?.experienceLevel} yrs</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="shrink-0 font-semibold text-slate-900 sm:w-48">
                  Salary
                </dt>
                <dd>{singleJob?.salary} LPA</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="shrink-0 font-semibold text-slate-900 sm:w-48">
                  Applicants
                </dt>
                <dd>{singleJob?.applications?.length ?? 0}</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="shrink-0 font-semibold text-slate-900 sm:w-48">
                  Posted
                </dt>
                <dd>{singleJob?.createdAt?.split?.("T")?.[0]}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit details for application</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveProfileThenApply} className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  min="0"
                  name="experienceYears"
                  value={editDetails.experienceYears}
                  onChange={(e) =>
                    setEditDetails((p) => ({
                      ...p,
                      experienceYears: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Current location</Label>
                <Input
                  type="text"
                  name="currentLocation"
                  value={editDetails.currentLocation}
                  onChange={(e) =>
                    setEditDetails((p) => ({
                      ...p,
                      currentLocation: e.target.value,
                    }))
                  }
                  placeholder="e.g. Pune"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Past job role / designation</Label>
                <Input
                  type="text"
                  name="designation"
                  value={editDetails.designation}
                  onChange={(e) =>
                    setEditDetails((p) => ({
                      ...p,
                      designation: e.target.value,
                    }))
                  }
                  placeholder="e.g. Junior Developer"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Resume (PDF)</Label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setEditDetails((p) => ({
                      ...p,
                      resumeFile: e.target.files?.[0] || null,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save & apply"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default JobDescription;
