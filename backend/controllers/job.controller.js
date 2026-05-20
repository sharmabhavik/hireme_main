import { Job } from "../models/job.model.js";

// admin post krega job
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;
    const userId = req.id;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "Somethin is missing.",
        success: false,
      });
    }
    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      salary: Number(salary),
      location,
      jobType,
      experienceLevel: experience,
      position,
      company: companyId,
      created_by: userId,
    });
    return res.status(201).json({
      message: "New job created successfully.",
      job,
      success: true,
    });
  } catch (error) {
    console.error(error);
  }
};
// student k liye
export const getAllJobs = async (req, res) => {
  try {
    const keyword = (req.query.keyword || "").trim();
    const location = (req.query.location || "").trim();
    const industry = (req.query.industry || "").trim();

    const minSalary =
      req.query.minSalary !== undefined
        ? Number(req.query.minSalary)
        : undefined;
    const maxSalary =
      req.query.maxSalary !== undefined
        ? Number(req.query.maxSalary)
        : undefined;

    // Backwards compatible: older job docs may not have `isDeleted`.
    // Only hide jobs explicitly marked as deleted.
    const query = { isDeleted: { $ne: true } };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
        { jobType: { $regex: keyword, $options: "i" } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // In this project, "Industry" maps best to job role/title.
    if (industry) {
      query.title = { $regex: industry.replace(/\s+/g, "\\s*"), $options: "i" };
    }

    const hasMinSalary =
      typeof minSalary === "number" && !Number.isNaN(minSalary);
    const hasMaxSalary =
      typeof maxSalary === "number" && !Number.isNaN(maxSalary);
    if (hasMinSalary || hasMaxSalary) {
      query.salary = {};
      if (hasMinSalary) query.salary.$gte = minSalary;
      if (hasMaxSalary) query.salary.$lte = maxSalary;
    }

    const jobs = await Job.find(query)
      .populate({ path: "company" })
      .sort({ createdAt: -1 });
    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch jobs.",
      success: false,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const adminId = req.id;
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }
    if (job.created_by.toString() !== adminId) {
      return res.status(403).json({
        message: "You are not allowed to remove this job.",
        success: false,
      });
    }
    job.isDeleted = true;
    await job.save();
    return res.status(200).json({
      message: "Job removed successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to remove job.",
      success: false,
    });
  }
};
// student
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId)
      .populate({ path: "company" })
      .populate({
        path: "applications",
      });
    if (!job) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.error(error);
  }
};
// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId })
      .populate({ path: "company" })
      .sort({ createdAt: -1 });
    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch jobs."
      success: false,
    });
  }
};
