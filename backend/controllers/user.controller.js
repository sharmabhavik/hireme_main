import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Job } from "../models/job.model.js";

const validatePassword = (password) => {
  if (typeof password !== "string") {
    return "Password is required.";
  }
  // Minimum 8 characters, must be alphanumeric, one capital letter, one special character.
  // Interpreting "alphanumeric" as: must contain at least one letter and one number.
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "Password must contain at least one letter.";
  }
  // Special character: anything that's not a letter/number/underscore.
  if (!/[^\w]/.test(password)) {
    return "Password must contain at least one special character.";
  }
  return null;
};

const validateEmail = (email) => {
  if (typeof email !== "string") return "Email is required.";
  const trimmed = email.trim();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  if (!ok) return "Please enter a valid email address.";
  return null;
};

const validatePhoneNumber = (phoneNumber) => {
  const value = String(phoneNumber ?? "").trim();
  const ok = /^[6-9]\d{9}$/.test(value);
  if (!ok) {
    return "Invalid Phone Number";
  }
  return null;
};

export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exist with this email.",
        success: false,
      });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({
        message: emailError,
        success: false,
      });
    }

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      return res.status(400).json({
        message: phoneError,
        success: false,
      });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({
        message: passwordError,
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePhoto = "";
    const file = req.file;
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      profilePhoto = cloudResponse.secure_url;
    }

    await User.create({
      fullname,
      email,
      phoneNumber: Number(phoneNumber),
      password: hashedPassword,
      role,
      profile: {
        profilePhoto,
      },
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Registration failed. Please try again.",
      success: false,
    });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }
    // check role is correct or not
    if (role !== user.role) {
      return res.status(400).json({
        message: "Account doesn't exist with current role.",
        success: false,
      });
    }

    const tokenData = {
      userId: user._id,
    };
    const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
      savedJobs: user.savedJobs || [],
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user,
        success: true,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Login failed. Please try again.",
      success: false,
    });
  }
};
export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error);
  }
};
export const updateProfile = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phoneNumber,
      bio,
      skills,
      experienceYears,
      currentLocation,
      designation,
      fileKind,
    } = req.body;

    let skillsArray;
    if (skills) {
      skillsArray = skills.split(",");
    }
    const userId = req.id; // middleware authentication
    let user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
      });
    }

    const legacyFile = req.file;
    const avatarFile = req.files?.avatar?.[0];
    const resumeFile = req.files?.resume?.[0];
    const compatFile = req.files?.file?.[0];

    const uploadToCloudinary = async (file) => {
      if (!file) return null;
      const fileUri = getDataUri(file);
      return cloudinary.uploader.upload(fileUri.content);
    };

    const avatarUpload = await uploadToCloudinary(avatarFile);
    const resumeUpload = await uploadToCloudinary(resumeFile);

    // Backwards compatibility: older clients still send single 'file'
    const legacyUpload = await uploadToCloudinary(legacyFile || compatFile);
    // updating data
    if (fullname) user.fullname = fullname;
    if (email) {
      const emailError = validateEmail(email);
      if (emailError) {
        return res.status(400).json({
          message: emailError,
          success: false,
        });
      }
      user.email = email.trim();
    }
    if (phoneNumber) {
      const phoneError = validatePhoneNumber(phoneNumber);
      if (phoneError) {
        return res.status(400).json({
          message: phoneError,
          success: false,
        });
      }
      user.phoneNumber = Number(String(phoneNumber).trim());
    }
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;
    if (experienceYears !== undefined && experienceYears !== "") {
      const exp = Number(experienceYears);
      if (!Number.isNaN(exp)) user.profile.experienceYears = exp;
    }
    if (currentLocation) user.profile.currentLocation = currentLocation;
    if (designation) user.profile.designation = designation;

    if (avatarUpload) {
      user.profile.profilePhoto = avatarUpload.secure_url;
    }
    if (resumeUpload) {
      user.profile.resume = resumeUpload.secure_url;
      user.profile.resumeOriginalName = resumeFile?.originalname;
    }

    // Legacy behavior (single file) still supported
    if (legacyUpload) {
      const shouldSaveAsAvatar =
        fileKind === "avatar" || user.role === "recruiter";
      if (shouldSaveAsAvatar) {
        user.profile.profilePhoto = legacyUpload.secure_url;
      } else {
        user.profile.resume = legacyUpload.secure_url;
        const name = (legacyFile || compatFile)?.originalname;
        if (name) user.profile.resumeOriginalName = name;
      }
    }

    await user.save();

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
      savedJobs: user.savedJobs || [],
    };

    return res.status(200).json({
      message: "Profile updated successfully.",
      user,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Profile update failed. Please try again.",
      success: false,
    });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).populate({
      path: "savedJobs",
      populate: { path: "company" },
      options: { sort: { createdAt: -1 } },
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
    }
    return res.status(200).json({
      success: true,
      savedJobs: user.savedJobs || [],
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to fetch saved jobs.", success: false });
  }
};

export const saveJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found.", success: false });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
    }
    const alreadySaved = (user.savedJobs || []).some(
      (id) => id.toString() === jobId,
    );
    if (!alreadySaved) {
      user.savedJobs = [...(user.savedJobs || []), job._id];
      await user.save();
    }
    return res.status(200).json({
      success: true,
      message: alreadySaved ? "Job already saved." : "Saved job.",
      savedJobs: user.savedJobs || [],
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to save job.", success: false });
  }
};

export const unsaveJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.jobId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
    }
    user.savedJobs = (user.savedJobs || []).filter(
      (id) => id.toString() !== jobId,
    );
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Removed saved job.",
      savedJobs: user.savedJobs || [],
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to remove saved job.", success: false });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "oldPassword and newPassword are required.",
        success: false,
      });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError, success: false });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
    }

    const matches = await bcrypt.compare(oldPassword, user.password);
    if (!matches) {
      return res.status(400).json({
        message: "Old password is incorrect.",
        success: false,
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to update password.", success: false });
  }
};
