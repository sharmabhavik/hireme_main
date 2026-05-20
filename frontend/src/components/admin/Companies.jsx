import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
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
        <div className="hire-page">
            <Navbar />
            <div className="hire-page-content hire-page-content-medium">
                <header className="hire-page-header">
                    <h1 className="hire-title-lg">Your companies</h1>
                    <p className="hire-subtitle">Manage profiles that appear on job listings.</p>
                </header>
                <div className="hire-toolbar">
                    <Input
                        className="w-full max-w-full sm:max-w-xs md:max-w-sm"
                        placeholder="Filter by name"
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="hire-toolbar-actions">
                        <Button onClick={() => navigate("/admin/companies/create")} className="w-full sm:w-auto">Add company</Button>
                    </div>
                </div>
                <div className="mt-6 sm:mt-8">
                    <CompaniesTable/>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Companies
