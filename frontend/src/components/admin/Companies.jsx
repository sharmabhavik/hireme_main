import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import CompaniesTable from './CompaniesTable'
import { useNavigate } from 'react-router-dom'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import { useDispatch } from 'react-redux'
import { setSearchCompanyByText } from '@/redux/companySlice'

const Companies = () => {
    useGetAllCompanies();
    const [input, setInput] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch(setSearchCompanyByText(input));
    },[input]);
    return (
        <div className="min-h-screen bg-[oklch(0.99_0.005_165)]">
            <Navbar />
            <div className='mx-auto max-w-6xl px-4 py-10 sm:px-6'>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your companies</h1>
                    <p className="mt-2 text-slate-600">Manage profiles that appear on job listings.</p>
                </div>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <Input
                        className="max-w-xs border-slate-200"
                        placeholder="Filter by name"
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button onClick={() => navigate("/admin/companies/create")} className="bg-emerald-600 hover:bg-emerald-700">Add company</Button>
                </div>
                <div className="mt-8">
                    <CompaniesTable/>
                </div>
            </div>
        </div>
    )
}

export default Companies
