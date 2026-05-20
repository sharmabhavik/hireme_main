/* // Quick API smoke tests for HireMe backend.
// Run from repo root: node Backend/smoke-test.mjs

const BASE = "http://127.0.0.1:3000/api/v1";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function pickSetCookie(setCookieHeader) {
  if (!setCookieHeader) return [];
  // node fetch returns either a single string or an array-like; normalize.
  if (Array.isArray(setCookieHeader)) return setCookieHeader;
  return [setCookieHeader];
}

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }
  addFromSetCookie(setCookieHeaders) {
    for (const header of setCookieHeaders) {
      const first = String(header).split(";")[0];
      const eq = first.indexOf("=");
      if (eq === -1) continue;
      const name = first.slice(0, eq).trim();
      const value = first.slice(eq + 1).trim();
      if (name) this.cookies.set(name, value);
    }
  }
  headerValue() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
}

async function httpJson(method, url, { jar, body } = {}) {
  const headers = { Accept: "application/json" };
  if (body) headers["Content-Type"] = "application/json";
  if (jar) {
    const cookie = jar.headerValue();
    if (cookie) headers.Cookie = cookie;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const setCookie =
    res.headers.getSetCookie?.() ??
    pickSetCookie(res.headers.get("set-cookie"));
  if (jar) jar.addFromSetCookie(setCookie);

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  return { status: res.status, ok: res.ok, json };
}

async function run() {
  // console.log("== Public jobs ==");
  const jobsRes = await httpJson("GET", `${BASE}/job/get`);
  assert(jobsRes.ok, `GET /job/get failed (${jobsRes.status})`);
  const jobs = jobsRes.json.jobs || [];
  // console.log("Public jobs count:", jobs.length);
  assert(jobs.length > 0, "No public jobs returned");
  const jobId = jobs[0]._id;
  assert(jobId, "Missing jobId");
  // console.log("Using jobId:", jobId);

  console.log("\n== Student login ==");
  const studentJar = new CookieJar();
  const sLogin = await httpJson("POST", `${BASE}/user/login`, {
    jar: studentJar,
    body: {
      email: "student2@demo.local",
      password: "Password@123",
      role: "student",
    },
  });
  assert(sLogin.ok, `Student login failed (${sLogin.status})`);
  assert(sLogin.json.success === true, "Student login success=false");
  // console.log("Student login success:", sLogin.json.success);

  // console.log("\n== Save job ==");
  const saveRes = await httpJson("POST", `${BASE}/user/saved/${jobId}`, {
    jar: studentJar,
  });
  assert(saveRes.ok, `Save job failed (${saveRes.status})`);
  assert(saveRes.json.success === true, "Save job success=false");
  // console.log("Saved jobs count:", (saveRes.json.savedJobs || []).length);

  // console.log("\n== Fetch saved ==");
  const savedRes = await httpJson("GET", `${BASE}/user/saved`, {
    jar: studentJar,
  });
  assert(savedRes.ok, `Get saved failed (${savedRes.status})`);
  assert(savedRes.json.success === true, "Get saved success=false");
  // console.log(
  //   "Fetched saved jobs count:",
  //   (savedRes.json.savedJobs || []).length,
  // );

  // console.log("\n== Apply ==");
  const applyRes = await httpJson(
    "POST",
    `${BASE}/application/apply/${jobId}`,
    { jar: studentJar },
  );
  assert(applyRes.ok, `Apply failed (${applyRes.status})`);
  // console.log("Apply response:", applyRes.json.message ?? applyRes.json);

  // console.log("\n== Recruiter login ==");
  const recruiterJar = new CookieJar();
  const rLogin = await httpJson("POST", `${BASE}/user/login`, {
    jar: recruiterJar,
    body: {
      email: "recruiter1@demo.local",
      password: "Password@123",
      role: "recruiter",
    },
  });
  assert(rLogin.ok, `Recruiter login failed (${rLogin.status})`);
  assert(rLogin.json.success === true, "Recruiter login success=false");
  console.log("Recruiter login success:", rLogin.json.success);

  console.log("\n== Delete job (soft) ==");
  const delRes = await httpJson("DELETE", `${BASE}/job/delete/${jobId}`, {
    jar: recruiterJar,
  });
  assert(delRes.ok, `Delete job failed (${delRes.status})`);
  assert(delRes.json.success === true, "Delete job success=false");
  console.log("Delete response:", delRes.json.message ?? delRes.json);

  console.log("\n== Public jobs after delete ==");
  const jobsRes2 = await httpJson("GET", `${BASE}/job/get`);
  assert(jobsRes2.ok, `GET /job/get after delete failed (${jobsRes2.status})`);
  const stillThere = (jobsRes2.json.jobs || []).some((j) => j._id === jobId);
  console.log("Deleted job visible publicly?", stillThere);
  assert(stillThere === false, "Deleted job still visible in public list");

  console.log("\nSMOKE TESTS PASSED");
}

run().catch((e) => {
  console.error("\nSMOKE TESTS FAILED");
  console.error(e);
  process.exit(1);
});
 */