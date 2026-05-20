import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import { LogOut, User2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";
import BrandLogo from "./BrandLogo";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };
  const linkClass =
    "text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-300 dark:hover:text-orange-300";
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-4 sm:px-6">
        <BrandLogo />
        <div className="flex items-center gap-8 md:gap-12">
          <ul className="flex font-medium items-center gap-5 md:gap-6">
            {user && user.role === "recruiter" ? (
              <>
                <li>
                  <Link className={linkClass} to="/admin/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link className={linkClass} to="/admin/companies">
                    Companies
                  </Link>
                </li>
                <li>
                  <Link className={linkClass} to="/admin/jobs">
                    Jobs
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link className={linkClass} to="/">
                    Home
                  </Link>
                </li>
                {user && user.role === "student" && (
                  <li>
                    <Link className={linkClass} to="/dashboard">
                      Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <Link className={linkClass} to="/jobs">
                    Jobs
                  </Link>
                </li>
                <li>
                  <Link className={linkClass} to="/browse">
                    Browse
                  </Link>
                </li>
              </>
            )}
          </ul>
          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700">
                  Join HireMe
                </Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer ring-2 ring-emerald-100 ring-offset-2">
                  <AvatarImage
                    src={user?.profile?.profilePhoto}
                    alt={user?.fullname}
                  />
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="">
                  <div className="flex gap-2 space-y-2">
                    <Avatar className="cursor-pointer">
                      <AvatarImage
                        src={user?.profile?.profilePhoto}
                        alt={user?.fullname}
                      />
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{user?.fullname}</h4>
                      <p className="text-sm text-muted-foreground">
                        {user?.profile?.bio}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col my-2 text-gray-600">
                    {user && user.role === "student" && (
                      <>
                        <div className="flex w-fit items-center gap-2 cursor-pointer">
                          <User2 className="size-4" />
                          <Button variant="link">
                            <Link to="/dashboard">Dashboard</Link>
                          </Button>
                        </div>
                        <div className="flex w-fit items-center gap-2 cursor-pointer">
                          <User2 className="size-4" />
                          <Button variant="link">
                            <Link to="/profile">View Profile</Link>
                          </Button>
                        </div>
                      </>
                    )}

                    {user && user.role === "recruiter" && (
                      <>
                        <div className="flex w-fit items-center gap-2 cursor-pointer">
                          <User2 className="size-4" />
                          <Button variant="link">
                            <Link to="/admin/dashboard">Dashboard</Link>
                          </Button>
                        </div>
                        <div className="flex w-fit items-center gap-2 cursor-pointer">
                          <User2 className="size-4" />
                          <Button variant="link">
                            <Link to="/profile">Edit Profile</Link>
                          </Button>
                        </div>
                      </>
                    )}

                    <div className="flex w-fit items-center gap-2 cursor-pointer">
                      <LogOut className="size-4" />
                      <Button onClick={logoutHandler} variant="link">
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
