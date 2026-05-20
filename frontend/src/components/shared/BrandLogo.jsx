import { Link } from "react-router-dom";

/**
 * Shared HireMe wordmark — use across nav, footer, auth.
 */
const BrandLogo = ({
  to = "/",
  className = "",
  size = "default",
  variant = "default",
}) => {
  const sizes = {
    sm: "text-lg",
    default: "text-2xl",
    lg: "text-3xl",
  };
  const hireClass =
    variant === "light"
      ? "text-white transition-colors group-hover:text-slate-200"
      : "text-slate-900 transition-colors group-hover:text-slate-700";
  const meClass =
    variant === "light"
      ? "bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
      : "bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent";
  return (
    <Link
      to={to}
      className={`group inline-flex items-baseline gap-0 font-bold tracking-tight ${sizes[size]} ${className}`}
    >
      <span className={hireClass}>Hire</span>
      <span className={meClass}>Me</span>
    </Link>
  );
};

export default BrandLogo;
