import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
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
    <div className="min-h-screen bg-[oklch(0.99_0.005_165)]">
      <Navbar />
      <div className='mx-auto max-w-6xl px-4 py-10 sm:px-6'>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Posted jobs</h1>
          <p className="mt-2 text-slate-600">Search by title or company name, then open applicants or edit.</p>
        </div>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <Input
            className="max-w-xs border-slate-200"
            placeholder="Filter by title or company"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={() => navigate("/admin/jobs/create")} className="bg-emerald-600 hover:bg-emerald-700">Post a job</Button>
        </div>
        <div className="mt-8">
          <AdminJobsTable />
        </div>
      </div>
    </div>
  )
}

export default AdminJobs
