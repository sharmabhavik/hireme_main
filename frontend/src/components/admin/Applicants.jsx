import React, { useEffect } from "react";
import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";
import ApplicantsTable from "./ApplicantsTable";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAllApplicants } from "@/redux/applicationSlice";

const Applicants = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);

  useEffect(() => {
    const fetchAllApplicants = async () => {
      try {
        const res = await axios.get(
          `${APPLICATION_API_END_POINT}/${params.id}/applicants`,
          { withCredentials: true },
        );
        if (res.data?.success) {
          dispatch(setAllApplicants(res.data.job));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchAllApplicants();

    const id = setInterval(fetchAllApplicants, 4000);
    return () => clearInterval(id);
  }, [params.id, dispatch]);
  return (
    <div className="min-h-screen bg-[oklch(0.99_0.005_165)]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {applicants?.applications?.length ?? 0} applicants
        </h1>
        <p className="mt-1 text-slate-600">
          Review candidates who applied to this role.
        </p>
        <div className="mt-8">
          <ApplicantsTable />
        </div>
      </div>      <Footer />    </div>
  );
};

export default Applicants;
