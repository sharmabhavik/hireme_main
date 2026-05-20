/**
 * One-time demo data: 10 users (5 recruiters + 5 students), one company, sample jobs.
 * Run from Backend folder: npm run seed
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";
import bcrypt from "bcryptjs";
import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Job } from "./models/job.model.js";
import { Application } from "./models/application.model.js";

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Must satisfy the backend password policy (min 8 chars, uppercase, number, special).
const DEMO_PASSWORD = "Password@123";

const DEMO_USERS = [
  {
    fullname: "Aarav Student",
    email: "student1@demo.local",
    phoneNumber: 9990001001,
    role: "student",
  },
  {
    fullname: "Diya Student",
    email: "student2@demo.local",
    phoneNumber: 9990001002,
    role: "student",
  },
  {
    fullname: "Kabir Student",
    email: "student3@demo.local",
    phoneNumber: 9990001003,
    role: "student",
  },
  {
    fullname: "Meera Student",
    email: "student4@demo.local",
    phoneNumber: 9990001004,
    role: "student",
  },
  {
    fullname: "Rohan Student",
    email: "student5@demo.local",
    phoneNumber: 9990001005,
    role: "student",
  },

  {
    fullname: "Ishaan Recruiter",
    email: "recruiter1@demo.local",
    phoneNumber: 9990002001,
    role: "recruiter",
  },
  {
    fullname: "Anaya Recruiter",
    email: "recruiter2@demo.local",
    phoneNumber: 9990002002,
    role: "recruiter",
  },
  {
    fullname: "Vivaan Recruiter",
    email: "recruiter3@demo.local",
    phoneNumber: 9990002003,
    role: "recruiter",
  },
  {
    fullname: "Sara Recruiter",
    email: "recruiter4@demo.local",
    phoneNumber: 9990002004,
    role: "recruiter",
  },
  {
    fullname: "Arjun Recruiter",
    email: "recruiter5@demo.local",
    phoneNumber: 9990002005,
    role: "recruiter",
  },
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set in .env");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const u of DEMO_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      await User.updateOne(
        { _id: existing._id },
        {
          $set: {
            fullname: u.fullname,
            phoneNumber: u.phoneNumber,
            role: u.role,
            password: hashed,
          },
        },
      );
      console.log("Updated demo user:", existing.email);
      continue;
    }
    await User.create({
      fullname: u.fullname,
      email: u.email,
      phoneNumber: u.phoneNumber,
      password: hashed,
      role: u.role,
    });
    console.log("Created user:", u.email);
  }

  const recruiter = await User.findOne({ email: "recruiter1@demo.local" });
  if (!recruiter) {
    console.error("Recruiter seed missing; cannot create company/jobs.");
    process.exit(1);
  }

  let company = await Company.findOne({ name: "Demo Tech Pvt Ltd" });
  if (!company) {
    company = await Company.create({
      name: "Demo Tech Pvt Ltd",
      description: "Demo company for Hire Me portal",
      website: "https://example.com",
      location: "Bangalore",
      userId: recruiter._id,
    });
    console.log("Created company:", company.name);
  } else {
    console.log("Company already exists:", company.name);
  }

  const locations = ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai"];
  const roleTemplates = [
    {
      title: "Frontend Developer",
      description: "Build pixel-perfect UI with React and modern CSS.",
      requirements: ["React", "JavaScript", "CSS"],
      jobType: "Full-time",
    },
    {
      title: "Backend Developer",
      description:
        "Design APIs, work with databases, and ship reliable services.",
      requirements: ["Node.js", "MongoDB", "REST"],
      jobType: "Full-time",
    },
    {
      title: "Full Stack Developer",
      description: "Own features end-to-end across frontend and backend.",
      requirements: ["React", "Node.js", "MongoDB"],
      jobType: "Full-time",
    },
    {
      title: "Data Science Intern",
      description:
        "Work on ML models, data cleaning, and analytics dashboards.",
      requirements: ["Python", "Pandas", "ML Basics"],
      jobType: "Internship",
    },
    {
      title: "Graphic Designer",
      description: "Create marketing creatives and product visuals.",
      requirements: ["Figma", "Photoshop", "Design"],
      jobType: "Full-time",
    },
  ];

  // Ensure we have ~40 jobs for this company created by recruiter1.
  const existingCount = await Job.countDocuments({
    company: company._id,
    created_by: recruiter._id,
  });
  const targetCount = 40;
  const toCreate = Math.max(0, targetCount - existingCount);

  if (toCreate > 0) {
    const docs = [];
    for (let i = 0; i < toCreate; i++) {
      const template = roleTemplates[i % roleTemplates.length];
      const location = locations[i % locations.length];
      const experienceLevel = (i % 4) + 1; // 1..4
      const salary = 4 + (i % 17); // 4..20 LPA
      const position = (i % 5) + 1; // 1..5

      docs.push({
        title: template.title,
        description: `${template.description} (Track ${i + 1})`,
        requirements: template.requirements,
        salary,
        experienceLevel,
        location,
        jobType: template.jobType,
        position,
        company: company._id,
        created_by: recruiter._id,
      });
    }
    await Job.create(docs);
    console.log(
      `Created ${toCreate} demo jobs (total target: ${targetCount}).`,
    );
  } else {
    console.log("Demo jobs already at target count, skipping job seed.");
  }

  // Create multiple applications for Aarav (student1) to show Applied Jobs + Applicants.
  const student = await User.findOne({ email: "student1@demo.local" });
  if (student) {
    const jobsForApply = await Job.find({ company: company._id })
      .sort({ createdAt: -1 })
      .limit(8);
    let applied = 0;
    for (const job of jobsForApply) {
      const exists = await Application.findOne({
        job: job._id,
        applicant: student._id,
      });
      if (exists) continue;
      const app = await Application.create({
        job: job._id,
        applicant: student._id,
      });
      job.applications.push(app._id);
      await job.save();
      applied++;
    }
    const totalApplications = await Application.countDocuments({
      applicant: student._id,
    });
    console.log(
      `Applications for student1@demo.local: created ${applied} this run, total ${totalApplications}.`,
    );
  } else {
    console.log(
      "Student student1@demo.local not found; skipping applications seed.",
    );
  }

  console.log("\nDemo logins (password for all):", DEMO_PASSWORD);
  console.log("  Recruiters:");
  console.log("    recruiter1@demo.local");
  console.log("    recruiter2@demo.local");
  console.log("    recruiter3@demo.local");
  console.log("    recruiter4@demo.local");
  console.log("    recruiter5@demo.local");
  console.log("  Students:");
  console.log("    student1@demo.local");
  console.log("    student2@demo.local");
  console.log("    student3@demo.local");
  console.log("    student4@demo.local");
  console.log("    student5@demo.local");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
