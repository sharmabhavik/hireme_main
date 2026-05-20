import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
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
    <div className="hire-page">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="hire-card-padded">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 ring-2 ring-primary/25 ring-offset-2 ring-offset-background sm:h-24 sm:w-24">
                <AvatarImage
                  src={user?.profile?.profilePhoto || ""}
                  alt={user?.fullname || "Profile"}
                />
                <AvatarFallback className="text-base font-semibold">
                  {fallbackText}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold text-xl text-foreground">
                  {user?.fullname}
                </h1>
                <p className="text-muted-foreground">{user?.profile?.bio}</p>
              </div>
            </div>
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              className="shrink-0"
              aria-label="Edit profile"
            >
              <Pen className="size-4" />
            </Button>
          </div>
          <div className="my-6 space-y-3 border-t border-border pt-6">
            <div className="flex items-center gap-3 text-foreground/90">
              <Mail className="size-4 text-primary" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/90">
              <Contact className="size-4 text-primary" />
              <span>{user?.phoneNumber}</span>
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordOpen(true)}
              >
                Change password
              </Button>
            </div>
          </div>
          <div className="my-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Skills
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {user?.profile?.skills?.length ? (
                user?.profile?.skills.map((item, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="hire-badge-primary"
                  >
                    {item}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">Not added yet</span>
              )}
            </div>
          </div>
          {isStudent && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label className="text-sm font-semibold text-foreground">
                Resume
              </Label>
              {user?.profile?.resume ? (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={user?.profile?.resume}
                  className="hire-link cursor-pointer"
                >
                  {user?.profile?.resumeOriginalName || "View resume"}
                </a>
              ) : (
                <span className="text-muted-foreground">Not uploaded</span>
              )}
            </div>
          )}
        </div>
        {isStudent && (
          <>
            <div className="mt-8 sm:mt-10">
              <h2 className="font-bold text-lg text-foreground">Applications</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Roles you&apos;ve applied to on HireMe.
              </p>
              <AppliedJobTable />
            </div>

            <div className="mt-8 sm:mt-10">
              <h2 className="font-bold text-lg text-foreground">Saved jobs</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Roles you saved for later.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4">
                {savedJobs?.length ? (
                  savedJobs.map((job) => (
                    <div
                      key={job._id}
                      className="hire-card p-4"
                    >
                      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {job?.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {job?.company?.name || ""}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {job?.location}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="hire-empty-state py-8 text-sm">
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
      <Footer />
    </div>
  );
};

export default Profile;
