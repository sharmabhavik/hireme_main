import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input]);
  return (
    <div className="hire-page">
      <Navbar />
      <div className="hire-page-content hire-page-content-medium">
        <header className="hire-page-header">
          <h1 className="hire-title-lg">Posted jobs</h1>
          <p className="hire-subtitle">Search by title or company name, then open applicants or edit.</p>
        </header>
        <div className="hire-toolbar">
          <Input
            className="w-full max-w-full sm:max-w-xs md:max-w-sm"
            placeholder="Filter by title or company"
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="hire-toolbar-actions">
            <Button onClick={() => navigate("/admin/jobs/create")} className="w-full sm:w-auto">Post a job</Button>
          </div>
        </div>
        <div className="mt-6 sm:mt-8">
          <AdminJobsTable />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AdminJobs
