import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";
import BrandLogo from "../shared/BrandLogo";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";

const validatePassword = (password) => {
  if (typeof password !== "string") return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must include 1 capital letter.";
  if (!/[0-9]/.test(password)) return "Password must include 1 number.";
  if (!/[a-zA-Z]/.test(password)) return "Password must include letters.";
  if (!/[^\w]/.test(password))
    return "Password must include 1 special character.";
  return null;
};

const Signup = () => {
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    file: "",
  });
  const { loading, user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] });
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    if (
      !input.fullname?.trim() ||
      !input.email?.trim() ||
      !input.phoneNumber ||
      !input.password
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!input.role) {
      toast.error("Please select Student or Recruiter.");
      return;
    }

    const passwordError = validatePassword(input.password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("password", input.password);
    formData.append("role", input.role);
    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Could not reach the server. Is the API running on port 8000?";
      toast.error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    dispatch(setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  return (
    <div className="hire-page hire-auth-bg">
      <Navbar />
      <div className="mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6 text-center sm:mb-8">
          <BrandLogo size="lg" />
          <p className="mt-3 text-muted-foreground">
            Create your account in a minute.
          </p>
        </div>
        <form
          onSubmit={submitHandler}
          className="hire-card w-full max-w-md p-6 shadow-lg sm:p-8"
        >
          <h1 className="font-bold text-xl text-foreground">Create account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Students apply to jobs; recruiters post and manage roles.
          </p>
          <div className="my-3">
            <Label>Full name</Label>
            <Input
              type="text"
              value={input.fullname}
              name="fullname"
              onChange={changeEventHandler}
              placeholder="Alex Johnson"
              className="mt-1.5"
            />
          </div>
          <div className="my-3">
            <Label>Email</Label>
            <Input
              type="email"
              value={input.email}
              name="email"
              onChange={changeEventHandler}
              placeholder="you@example.com"
              className="mt-1.5"
            />
          </div>
          <div className="my-3">
            <Label>Phone number</Label>
            <Input
              type="text"
              value={input.phoneNumber}
              name="phoneNumber"
              onChange={changeEventHandler}
              placeholder="9876543210"
              className="mt-1.5"
            />
          </div>
          <div className="my-3">
            <Label>Password</Label>
            <Input
              type="password"
              value={input.password}
              name="password"
              onChange={changeEventHandler}
              placeholder="••••••••"
              className="mt-1.5"
            />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="my-4" role="radiogroup" aria-label="Account type">
              <p className="mb-3 text-sm font-medium text-foreground">I am a</p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Input
                    id="signup-role-student"
                    type="radio"
                    name="role"
                    value="student"
                    checked={input.role === "student"}
                    onChange={changeEventHandler}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="signup-role-student">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    id="signup-role-recruiter"
                    type="radio"
                    name="role"
                    value="recruiter"
                    checked={input.role === "recruiter"}
                    onChange={changeEventHandler}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="signup-role-recruiter">Recruiter</Label>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Label>Profile photo</Label>
              <Input
                accept="image/*"
                type="file"
                onChange={changeFileHandler}
                className="cursor-pointer text-sm"
              />
            </div>
          </div>
          {loading ? (
            <Button
              className="w-full my-2"
              type="button"
            >
              {" "}
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait{" "}
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full my-2"
            >
              Create account
            </Button>
          )}
          <p className="text-sm text-center text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="hire-link"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
