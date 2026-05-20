import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";

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

const ChangePasswordDialog = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    const err = validatePassword(input.newPassword);
    if (err) {
      toast.error(err);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `${USER_API_END_POINT}/change-password`,
        {
          oldPassword: input.oldPassword,
          newPassword: input.newPassword,
        },
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setOpen(false);
        setInput({ oldPassword: "", newPassword: "" });
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to change password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
        </DialogHeader>
        <form onSubmit={submitHandler} className="grid gap-4">
          <div>
            <Label>Old password</Label>
            <Input
              type="password"
              value={input.oldPassword}
              onChange={(e) =>
                setInput((p) => ({ ...p, oldPassword: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>New password</Label>
            <Input
              type="password"
              value={input.newPassword}
              onChange={(e) =>
                setInput((p) => ({ ...p, newPassword: e.target.value }))
              }
              placeholder="Min 8 chars, 1 capital, 1 number, 1 special"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
