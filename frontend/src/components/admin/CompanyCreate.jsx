import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setSingleCompany } from '@/redux/companySlice'

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState();
    const dispatch = useDispatch();
    const registerNewCompany = async () => {
        try {
            const res = await axios.post(`${COMPANY_API_END_POINT}/register`, {companyName}, {
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res?.data?.success){
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message);
                const companyId = res?.data?.company?._id;
                navigate(`/admin/companies/${companyId}`);
            }
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div className="min-h-screen bg-[oklch(0.99_0.005_165)]">
            <Navbar />
            <div className='mx-auto max-w-4xl px-4 py-10 sm:px-6'>
                <div className='rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm'>
                    <h1 className='font-bold text-2xl text-slate-900'>Name your company</h1>
                    <p className='mt-2 text-slate-600'>You can update branding and details on the next step.</p>

                    <Label className="mt-8 block">Company name</Label>
                    <Input
                        type="text"
                        className="my-2"
                        placeholder="Acme Labs, TechNova…"
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <div className='mt-8 flex flex-wrap items-center gap-3'>
                        <Button variant="outline" className="border-slate-300" onClick={() => navigate("/admin/companies")}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={registerNewCompany}>Continue</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompanyCreate