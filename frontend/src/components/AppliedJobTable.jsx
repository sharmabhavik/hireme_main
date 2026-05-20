import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useSelector } from "react-redux";

const formatStatusLabel = (status) => {
  const normalized = (status || "pending").toString();
  if (normalized === "seenByHR") return "SEEN BY HR";
  return normalized.replace(/_/g, " ").toUpperCase();
};

const statusBadgeClass = (status) => {
  switch ((status || "pending").toString()) {
    case "pending":
      return "border-0 bg-orange-100 text-orange-900 dark:bg-orange-500/15 dark:text-orange-200";
    case "seenByHR":
      return "border-0 bg-orange-200 text-orange-950 dark:bg-orange-500/20 dark:text-orange-100";
    case "undergoing":
      return "border-0 bg-orange-300 text-orange-950 dark:bg-orange-500/25 dark:text-orange-100";
    case "interviewing":
      return "border-0 bg-orange-400 text-orange-950 dark:bg-orange-500/30 dark:text-orange-50";
    case "selected":
      return "border-0 bg-orange-600 text-white dark:bg-orange-400 dark:text-slate-950";
    case "rejected":
      return "border-0 bg-red-500 text-white dark:bg-red-500/30 dark:text-red-100";
    default:
      return "border-0 bg-orange-200 text-orange-950 dark:bg-orange-500/20 dark:text-orange-100";
  }
};

const AppliedJobTable = () => {
  const { allAppliedJobs } = useSelector((store) => store.job);
  return (
    <div>
      <Table>
        <TableCaption>A list of your applied jobs</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Job Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allAppliedJobs.length <= 0 ? (
            <span>You haven't applied any job yet.</span>
          ) : (
            allAppliedJobs.map((appliedJob) => (
              <TableRow key={appliedJob._id}>
                <TableCell>{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                <TableCell>{appliedJob.job?.title}</TableCell>
                <TableCell>{appliedJob.job?.company?.name}</TableCell>
                <TableCell className="text-right">
                  <Badge className={statusBadgeClass(appliedJob?.status)}>
                    {formatStatusLabel(appliedJob?.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppliedJobTable;
