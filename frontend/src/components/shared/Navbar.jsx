import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import { LogOut, User2, Moon, Sun, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";
import BrandLogo from "./BrandLogo";

const navLinks = (user) => {
  if (user?.role === "recruiter") {
    return [
      { to: "/admin/dashboard", label: "Dashboard" },
      { to: "/admin/companies", label: "Companies" },
      { to: "/admin/jobs", label: "Jobs" },
    ];
  }
  const links = [
    { to: "/", label: "Home" },
    { to: "/jobs", label: "Jobs" },
    { to: "/browse", label: "Browse" },
  ];
  if (user?.role === "student") {
    links.splice(1, 0, { to: "/dashboard", label: "Dashboard" });
  }
  return links;
};

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark =
      savedTheme === "dark" || (savedTheme === "auto" && prefersDark);

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

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

  const links = navLinks(user);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/75">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <BrandLogo />

        <nav className="hidden items-center gap-6 md:flex lg:gap-8">
          <ul className="flex items-center gap-5 font-medium lg:gap-6">
            {links.map(({ to, label }) => (
              <li key={to}>
                <Link className="hire-nav-link" to={to}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
              type="button"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-primary" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {!user ? (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="sm:h-8">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="sm:h-8">
                    Join HireMe
                  </Button>
                </Link>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/25 ring-offset-2 ring-offset-background">
                    <AvatarImage
                      src={user?.profile?.profilePhoto}
                      alt={user?.fullname}
                    />
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div>
                    <div className="flex gap-2 space-y-2">
                      <Avatar className="cursor-pointer">
                        <AvatarImage
                          src={user?.profile?.profilePhoto}
                          alt={user?.fullname}
                        />
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {user?.fullname}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {user?.profile?.bio}
                        </p>
                      </div>
                    </div>
                    <div className="my-2 flex flex-col text-muted-foreground">
                      {user?.role === "student" && (
                        <>
                          <div className="flex w-fit cursor-pointer items-center gap-2">
                            <User2 className="size-4" />
                            <Button variant="link">
                              <Link to="/dashboard">Dashboard</Link>
                            </Button>
                          </div>
                          <div className="flex w-fit cursor-pointer items-center gap-2">
                            <User2 className="size-4" />
                            <Button variant="link">
                              <Link to="/profile">View Profile</Link>
                            </Button>
                          </div>
                        </>
                      )}
                      {user?.role === "recruiter" && (
                        <>
                          <div className="flex w-fit cursor-pointer items-center gap-2">
                            <User2 className="size-4" />
                            <Button variant="link">
                              <Link to="/admin/dashboard">Dashboard</Link>
                            </Button>
                          </div>
                          <div className="flex w-fit cursor-pointer items-center gap-2">
                            <User2 className="size-4" />
                            <Button variant="link">
                              <Link to="/profile">Edit Profile</Link>
                            </Button>
                          </div>
                        </>
                      )}
                      <div className="flex w-fit cursor-pointer items-center gap-2">
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
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label="Toggle theme"
            type="button"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-primary" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-foreground hover:bg-muted"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map(({ to, label }) => (
              <li key={to}>
                <Link
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  to={to}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          {!user ? (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Join HireMe</Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-1 border-t border-border pt-4">
              {user?.role === "student" && (
                <>
                  <Link
                    to="/dashboard"
                    className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={() => setMobileOpen(false)}
                  >
                    View Profile
                  </Link>
                </>
              )}
              {user?.role === "recruiter" && (
                <Link
                  to="/profile"
                  className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Edit Profile
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  logoutHandler();
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
