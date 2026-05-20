import express from "express";
import {
  changePassword,
  getSavedJobs,
  login,
  logout,
  register,
  saveJob,
  unsaveJob,
  updateProfile,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { profileUploads, singleUpload } from "../middlewares/mutler.js";

const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router
  .route("/profile/update")
  .post(isAuthenticated, profileUploads, updateProfile);

router.route("/saved").get(isAuthenticated, getSavedJobs);
router.route("/saved/:jobId").post(isAuthenticated, saveJob);
router.route("/saved/:jobId").delete(isAuthenticated, unsaveJob);

router.route("/change-password").post(isAuthenticated, changePassword);

export default router;
