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
    default: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  };
  const hireClass =
    variant === "light"
      ? "text-[color:var(--footer-fg)] transition-colors group-hover:opacity-90"
      : "text-foreground transition-colors group-hover:text-muted-foreground";
  const meClass =
    variant === "light"
      ? "hire-gradient-text"
      : "hire-gradient-text";
  return (
    <Link
      to={to}
      className={`group inline-flex shrink-0 items-baseline gap-0 font-bold tracking-tight ${sizes[size]} ${className}`}
    >
      <span className={hireClass}>Hire</span>
      <span className={meClass}>Me</span>
    </Link>
  );
};

export default BrandLogo;
