import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
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
        <div className="hire-page">
            <Navbar />
            <div className="hire-page-content hire-page-content-narrow">
                <div className='hire-card-padded'>
                    <h1 className='hire-title'>Name your company</h1>
                    <p className='hire-subtitle'>You can update branding and details on the next step.</p>

                    <Label className="mt-6 block sm:mt-8">Company name</Label>
                    <Input
                        type="text"
                        className="my-2 w-full"
                        placeholder="Acme Labs, TechNova…"
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <div className='mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3'>
                        <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/admin/companies")}>Cancel</Button>
                        <Button className="w-full sm:w-auto" onClick={registerNewCompany}>Continue</Button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default CompanyCreate
