import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, Mail, Pen } from "lucide-react";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import useGetSavedJobs from "@/hooks/useGetSavedJobs";
import ChangePasswordDialog from "./ChangePasswordDialog";

const Profile = () => {
  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { savedJobs } = useSelector((store) => store.job);

  const isStudent = user?.role === "student";

  useGetAppliedJobs({ skip: !isStudent });
  useGetSavedJobs({ skip: !isStudent });

  const fallbackText = (user?.fullname || user?.email || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-[oklch(0.99_0.005_165)]">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24 ring-2 ring-emerald-100 ring-offset-2">
                <AvatarImage
                  src={user?.profile?.profilePhoto || ""}
                  alt={user?.fullname || "Profile"}
                />
                <AvatarFallback className="text-base font-semibold">
                  {fallbackText}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold text-xl text-slate-900">
                  {user?.fullname}
                </h1>
                <p className="text-slate-600">{user?.profile?.bio}</p>
              </div>
            </div>
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              className="shrink-0 border-slate-300"
              aria-label="Edit profile"
            >
              <Pen className="size-4" />
            </Button>
          </div>
          <div className="my-6 space-y-3 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3 text-slate-700">
              <Mail className="size-4 text-emerald-600" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Contact className="size-4 text-emerald-600" />
              <span>{user?.phoneNumber}</span>
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                className="border-slate-300"
                onClick={() => setPasswordOpen(true)}
              >
                Change password
              </Button>
            </div>
          </div>
          <div className="my-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Skills
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {user?.profile?.skills?.length ? (
                user?.profile?.skills.map((item, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-900"
                  >
                    {item}
                  </Badge>
                ))
              ) : (
                <span className="text-slate-500">Not added yet</span>
              )}
            </div>
          </div>
          {isStudent && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label className="text-sm font-semibold text-slate-900">
                Resume
              </Label>
              {user?.profile?.resume ? (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={user?.profile?.resume}
                  className="text-emerald-700 hover:underline cursor-pointer"
                >
                  {user?.profile?.resumeOriginalName || "View resume"}
                </a>
              ) : (
                <span className="text-slate-500">Not uploaded</span>
              )}
            </div>
          )}
        </div>
        {isStudent && (
          <>
            <div className="mt-10">
              <h2 className="font-bold text-lg text-slate-900">Applications</h2>
              <p className="mt-1 text-sm text-slate-600">
                Roles you&apos;ve applied to on HireMe.
              </p>
              <AppliedJobTable />
            </div>

            <div className="mt-10">
              <h2 className="font-bold text-lg text-slate-900">Saved jobs</h2>
              <p className="mt-1 text-sm text-slate-600">
                Roles you saved for later.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4">
                {savedJobs?.length ? (
                  savedJobs.map((job) => (
                    <div
                      key={job._id}
                      className="rounded-xl border border-slate-200/90 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {job?.title}
                          </p>
                          <p className="text-sm text-slate-600">
                            {job?.company?.name || ""}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {job?.location}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
                    No saved jobs yet.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <UpdateProfileDialog open={open} setOpen={setOpen} />
      <ChangePasswordDialog open={passwordOpen} setOpen={setPasswordOpen} />
    </div>
  );
};

export default Profile;
