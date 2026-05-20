export const ROUNDS = {
  HR: "hr",
  APTITUDE: "aptitude",
  CODING: "coding",
};

// Keep this list small-but-complete; we can extend anytime.
// `technical: true` means Coding round is allowed.
export const DOMAIN_CATALOG = [
  { key: "frontend_developer", label: "Frontend Developer", technical: true },
  { key: "backend_developer", label: "Backend Developer", technical: true },
  {
    key: "fullstack_developer",
    label: "Full Stack Developer",
    technical: true,
  },
  { key: "mobile_developer", label: "Mobile App Developer", technical: true },
  { key: "ui_engineer", label: "UI Engineer", technical: true },
  { key: "devops_engineer", label: "DevOps Engineer", technical: true },
  { key: "cloud_engineer", label: "Cloud Engineer", technical: true },
  { key: "qa_engineer", label: "QA / Test Engineer", technical: true },
  { key: "automation_tester", label: "Automation Tester", technical: true },
  { key: "data_analyst", label: "Data Analyst", technical: true },
  { key: "data_scientist", label: "Data Science", technical: true },
  {
    key: "machine_learning",
    label: "Machine Learning Engineer",
    technical: true,
  },
  { key: "ai_engineer", label: "AI Engineer", technical: true },
  { key: "cybersecurity", label: "Cybersecurity Analyst", technical: true },
  { key: "database_admin", label: "Database Administrator", technical: true },
  { key: "product_manager", label: "Product Manager", technical: false },
  { key: "business_analyst", label: "Business Analyst", technical: false },
  { key: "project_manager", label: "Project Manager", technical: false },
  { key: "graphic_designer", label: "Graphic Designer", technical: false },
  { key: "ui_ux_designer", label: "UI/UX Designer", technical: false },
  { key: "digital_marketing", label: "Digital Marketing", technical: false },
  { key: "sales", label: "Sales / Business Development", technical: false },
  { key: "hr", label: "HR / Talent Acquisition", technical: false },
  { key: "content_writer", label: "Content Writer", technical: false },
  { key: "customer_support", label: "Customer Support", technical: false },
];

export function normalizeDomain(input) {
  const text = String(input ?? "").trim();
  if (!text) return { domainLabel: "", technical: false };

  const lowered = text.toLowerCase();

  const match = DOMAIN_CATALOG.find(
    (d) => d.label.toLowerCase() === lowered || d.key === lowered,
  );
  if (match) return { domainLabel: match.label, technical: match.technical };

  // Free-text domain support (e.g. user types "QA")
  // Heuristic: treat certain keywords as technical.
  const technicalHints = [
    "developer",
    "engineer",
    "qa",
    "test",
    "testing",
    "automation",
    "devops",
    "cloud",
    "data",
    "ml",
    "machine learning",
    "ai",
    "security",
    "cyber",
    "database",
    "dba",
  ];
  const technical = technicalHints.some((k) => lowered.includes(k));
  return { domainLabel: text, technical };
}

export function normalizeRound(input) {
  const r = String(input ?? "")
    .trim()
    .toLowerCase();
  if (r === ROUNDS.HR) return ROUNDS.HR;
  if (r === ROUNDS.APTITUDE) return ROUNDS.APTITUDE;
  if (r === ROUNDS.CODING) return ROUNDS.CODING;
  return "";
}
